import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowDownRight, ArrowUpRight, CreditCard, Sparkles, Trash2 } from 'lucide-react';
import { MonthSummary, Transaction } from '../types';
import { formatCurrency } from '../utils/currency';
import { formatDatePT } from '../utils/date';

interface MonthCardProps {
  summary: MonthSummary;
  onDeleteTransaction?: (id: string) => void;
  onAddTransactionToMonth?: (yearMonth: string) => void;
  defaultExpanded?: boolean;
}

export const MonthCard: React.FC<MonthCardProps> = ({
  summary,
  onDeleteTransaction,
  onAddTransactionToMonth,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || summary.isCurrent);

  const isPositive = summary.netBalance >= 0;
  const isAccumulatedPositive = summary.accumulatedBalance >= 0;

  return (
    <div
      className={`rounded-[20px] bg-[var(--card-bg)] hairline-border apple-shadow transition-all duration-300 overflow-hidden ${
        summary.isCurrent
          ? 'ring-2 ring-[#007AFF]/40 dark:ring-[#0A84FF]/40'
          : ''
      }`}
    >
      {/* Clickable Header / Accordion trigger */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 sm:p-5 cursor-pointer select-none ios-tap-active flex items-start justify-between gap-3"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-[var(--text-primary)]">
              {summary.label}
            </h4>
            {summary.isCurrent && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#007AFF] text-white">
                Mês Atual
              </span>
            )}
            {summary.isFuture && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/5 dark:bg-white/10 text-[var(--text-secondary)] flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-[#007AFF]" />
                Previsão
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
            <span>
              Entradas: <strong className="text-[#34C759] dark:text-[#30D158]">{formatCurrency(summary.totalIncome)}</strong>
            </span>
            <span>•</span>
            <span>
              Saídas: <strong className="text-[#FF3B30] dark:text-[#FF453A]">{formatCurrency(summary.totalExpense)}</strong>
            </span>
          </div>
        </div>

        {/* Balances & Expand Chevron */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-[var(--text-secondary)] block">Saldo Líquido</span>
            <span
              className={`text-sm sm:text-base font-bold tracking-tight ${
                isPositive ? 'text-[#34C759] dark:text-[#30D158]' : 'text-[#FF3B30] dark:text-[#FF453A]'
              }`}
            >
              {isPositive ? '+' : ''}
              {formatCurrency(summary.netBalance)}
            </span>
            <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5">
              Acumulado: {formatCurrency(summary.accumulatedBalance)}
            </span>
          </div>

          <div className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-[var(--text-secondary)]">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Details Section */}
      {isExpanded && (
        <div className="px-4 sm:px-5 pb-5 pt-1 border-t hairline-border space-y-4">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 pt-3">
            <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] hairline-border">
              <span className="text-[10px] text-[var(--text-secondary)] block">Faturas de Cartão</span>
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                {formatCurrency(summary.creditCardExpense)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] hairline-border">
              <span className="text-[10px] text-[var(--text-secondary)] block">Pix &amp; Débito</span>
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                {formatCurrency(summary.cashExpense)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] hairline-border">
              <span className="text-[10px] text-[var(--text-secondary)] block">Transações</span>
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                {summary.transactions.length} itens
              </span>
            </div>
          </div>

          {/* Transactions List */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h5 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Lançamentos do Mês
              </h5>
              {onAddTransactionToMonth && (
                <button
                  onClick={() => onAddTransactionToMonth(summary.yearMonth)}
                  className="text-xs text-[#007AFF] dark:text-[#0A84FF] font-medium hover:underline"
                >
                  + Adicionar Item
                </button>
              )}
            </div>

            {summary.transactions.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)] py-4 text-center">
                Nenhum lançamento previsto para este mês.
              </p>
            ) : (
              <div className="divide-y hairline-border">
                {summary.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="py-2.5 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${
                          tx.type === 'income'
                            ? 'bg-[#34C759]/10 text-[#34C759] dark:text-[#30D158]'
                            : 'bg-[#FF3B30]/10 text-[#FF3B30] dark:text-[#FF453A]'
                        }`}
                      >
                        {tx.type === 'income' ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : tx.paymentMethod === 'credit_card' ? (
                          <CreditCard className="w-3.5 h-3.5 text-[#007AFF]" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-[var(--text-primary)] truncate">
                            {tx.description}
                          </span>
                          {tx.isRecurring && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-[#007AFF]/10 text-[#007AFF]">
                              Fixo
                            </span>
                          )}
                          {tx.currencyOriginal !== 'BRL' && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                              {tx.currencyOriginal}
                            </span>
                          )}
                        </div>

                        <div className="text-[10px] text-[var(--text-secondary)] flex items-center gap-2">
                          <span>{formatDatePT(tx.date)}</span>
                          <span>•</span>
                          <span>{tx.category}</span>
                          {tx.paymentMethod === 'credit_card' && (
                            <>
                              <span>•</span>
                              <span className="text-[#007AFF]">Fatura Cartão</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-2">
                      <div>
                        <span
                          className={`font-bold block ${
                            tx.type === 'income'
                              ? 'text-[#34C759] dark:text-[#30D158]'
                              : 'text-[var(--text-primary)]'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'}
                          {formatCurrency(tx.amountBRL)}
                        </span>

                        {tx.currencyOriginal !== 'BRL' && (
                          <span className="text-[10px] text-[var(--text-secondary)] block">
                            {tx.currencyOriginal === 'USD'
                              ? `$ ${tx.amountOriginal.toFixed(2)}`
                              : `₲ ${Math.round(tx.amountOriginal).toLocaleString('es-PY')}`}
                          </span>
                        )}
                      </div>

                      {onDeleteTransaction && !tx.id.startsWith('proj_') && (
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1 rounded text-[var(--text-secondary)] hover:text-[#FF3B30] transition"
                          title="Excluir lançamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
