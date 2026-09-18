import React, { useState } from 'react';
import { X, Repeat, Trash2, CheckCircle2, XCircle, Plus } from 'lucide-react';
import { RecurringRule } from '../types';
import { formatCurrency } from '../utils/currency';

interface RecurringManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: RecurringRule[];
  onToggleRule: (id: string) => void;
  onDeleteRule: (id: string) => void;
  onOpenAddModal: () => void;
}

export const RecurringManagerModal: React.FC<RecurringManagerModalProps> = ({
  isOpen,
  onClose,
  rules,
  onToggleRule,
  onDeleteRule,
  onOpenAddModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-lg rounded-t-[28px] sm:rounded-[28px] bg-[var(--modal-bg)] p-6 shadow-2xl hairline-border text-[var(--text-primary)] max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b hairline-border mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold">Gastos e Receitas Recorrentes</h3>
              <p className="text-xs text-[var(--text-secondary)]">Projeção automática para 6 a 24 meses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)]"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {rules.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--text-secondary)]">
              Nenhuma regra fixa cadastrada. Ao registrar uma transação, marque a opção "Gasto/Receita Recorrente Fixa".
            </div>
          ) : (
            rules.map((rule) => (
              <div
                key={rule.id}
                className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] hairline-border flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                      {rule.description}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        rule.type === 'income'
                          ? 'bg-[#34C759]/10 text-[#34C759] dark:text-[#30D158]'
                          : 'bg-[#FF3B30]/10 text-[#FF3B30] dark:text-[#FF453A]'
                      }`}
                    >
                      {rule.type === 'income' ? 'Receita Fixa' : 'Despesa Fixa'}
                    </span>
                  </div>

                  <div className="text-[11px] text-[var(--text-secondary)] mt-1 flex items-center gap-2">
                    <span>Todo dia {rule.dayOfMonth}</span>
                    <span>•</span>
                    <span>{rule.projectionMonths} meses previstos</span>
                    <span>•</span>
                    <span>{rule.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`font-bold text-xs ${
                      rule.type === 'income'
                        ? 'text-[#34C759] dark:text-[#30D158]'
                        : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {rule.type === 'income' ? '+' : '-'}
                    {formatCurrency(rule.amountOriginal, rule.currencyOriginal)}
                  </span>

                  <button
                    onClick={() => onToggleRule(rule.id)}
                    className={`p-1.5 rounded-lg transition ${
                      rule.active
                        ? 'text-[#34C759] hover:bg-[#34C759]/10'
                        : 'text-[var(--text-secondary)] hover:bg-black/5'
                    }`}
                    title={rule.active ? 'Regra ativa (clique para pausar)' : 'Pausada (clique para ativar)'}
                  >
                    {rule.active ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => onDeleteRule(rule.id)}
                    className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 transition"
                    title="Excluir regra"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-5 pt-3 border-t hairline-border">
          <button
            onClick={() => {
              onClose();
              onOpenAddModal();
            }}
            className="w-full py-2.5 rounded-xl bg-[#007AFF] dark:bg-[#0A84FF] text-white text-xs font-bold flex items-center justify-center gap-1.5 ios-tap-active"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Nova Regra Fixa</span>
          </button>
        </div>
      </div>
    </div>
  );
};
