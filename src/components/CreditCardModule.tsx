import React, { useState } from 'react';
import { CreditCard as CardIcon, Plus, Calendar, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { CreditCard, Transaction } from '../types';
import { formatCurrency } from '../utils/currency';
import { getCurrentYearMonth } from '../utils/date';

interface CreditCardModuleProps {
  cards: CreditCard[];
  transactions: Transaction[];
  currentYearMonth: string;
  onOpenAddCard: () => void;
  onEditCard: (card: CreditCard) => void;
}

export const CreditCardModule: React.FC<CreditCardModuleProps> = ({
  cards,
  transactions,
  currentYearMonth,
  onOpenAddCard,
  onEditCard,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id || '');
  const today = new Date();
  const currentDay = today.getDate();

  const selectedCard = cards.find(c => c.id === selectedCardId) || cards[0];

  // Calculate used limit on the selected card (sum of credit card transactions currently pending/unpaid)
  const cardTransactions = transactions.filter(t => t.creditCardId === selectedCard?.id && t.type === 'expense');
  
  // Total current cycle invoice (transactions falling into current target invoice month)
  const currentInvoiceTotal = cardTransactions
    .filter(t => t.targetInvoiceMonth === currentYearMonth)
    .reduce((sum, t) => sum + t.amountBRL, 0);

  // Total active used limit across upcoming cycles
  const totalUsedLimit = cardTransactions.reduce((sum, t) => sum + t.amountBRL, 0);
  const cardLimit = selectedCard?.limit || 1000;
  const availableLimit = Math.max(cardLimit - totalUsedLimit, 0);
  const usedRatio = Math.min((totalUsedLimit / cardLimit) * 100, 100);

  // Closing day logic for today
  const isPastClosing = selectedCard ? currentDay >= selectedCard.closingDay : false;

  return (
    <div className="rounded-[20px] bg-[var(--card-bg)] p-5 hairline-border apple-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#007AFF]/10 dark:bg-[#0A84FF]/20 flex items-center justify-center text-[#007AFF] dark:text-[#0A84FF]">
            <CardIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Cartões de Crédito</h3>
            <p className="text-[11px] text-[var(--text-secondary)]">Fechamento Inteligente de Fatura</p>
          </div>
        </div>

        <button
          onClick={onOpenAddCard}
          className="ios-tap-active flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] bg-black/5 dark:bg-white/5 hover:bg-black/10"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Novo Cartão</span>
        </button>
      </div>

      {cards.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-xs text-[var(--text-secondary)] mb-3">Nenhum cartão cadastrado ainda.</p>
          <button
            onClick={onOpenAddCard}
            className="px-4 py-2 rounded-xl bg-[#007AFF] text-white text-xs font-medium ios-tap-active"
          >
            Cadastrar Primeiro Cartão
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Card Selector Tabs if multiple cards */}
          {cards.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {cards.map(card => (
                <button
                  key={card.id}
                  onClick={() => setSelectedCardId(card.id)}
                  className={`ios-tap-active px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCard?.id === card.id
                      ? 'bg-[#007AFF] text-white shadow-sm'
                      : 'bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {card.name} {card.digits ? `•• ${card.digits}` : ''}
                </button>
              ))}
            </div>
          )}

          {/* Apple Wallet Style Physical Card Graphic */}
          {selectedCard && (
            <div
              onClick={() => onEditCard(selectedCard)}
              className="relative overflow-hidden rounded-[20px] p-5 text-white shadow-xl cursor-pointer ios-tap-active transition-transform"
              style={{
                background: selectedCard.color === 'slate'
                  ? 'linear-gradient(135deg, #1C2541 0%, #0B132B 100%)'
                  : selectedCard.color === 'midnight'
                  ? 'linear-gradient(135deg, #2C3E50 0%, #000000 100%)'
                  : selectedCard.color === 'emerald'
                  ? 'linear-gradient(135deg, #0F5132 0%, #082819 100%)'
                  : 'linear-gradient(135deg, #3A0CA3 0%, #1A004F 100%)',
                border: '0.5px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              {/* Glossy overlay effect */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(125deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.02) 40%, transparent 60%)',
                }}
              />

              <div className="relative z-10 flex flex-col justify-between h-40">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-medium tracking-wider uppercase opacity-75">Cartão de Crédito</span>
                    <h4 className="text-lg font-bold tracking-tight">{selectedCard.name}</h4>
                  </div>
                  <div className="px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-md text-[10px] font-mono tracking-wider border border-white/20">
                    •• {selectedCard.digits || '4242'}
                  </div>
                </div>

                {/* Card Limit Status */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-end text-xs">
                    <div>
                      <span className="text-[10px] opacity-75 block">Fatura deste Mês</span>
                      <span className="text-base font-bold">{formatCurrency(currentInvoiceTotal)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] opacity-75 block">Limite Disponível</span>
                      <span className="text-sm font-semibold">{formatCurrency(availableLimit)}</span>
                    </div>
                  </div>

                  {/* Limit Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${usedRatio}%`,
                        backgroundColor: usedRatio > 85 ? '#FF453A' : usedRatio > 65 ? '#FF9F0A' : '#30D158',
                      }}
                    />
                  </div>
                </div>

                {/* Footer Dates */}
                <div className="flex justify-between items-center text-[10px] opacity-80 pt-1 border-t border-white/10">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Fecha dia <strong>{selectedCard.closingDay}</strong></span>
                  </div>
                  <div>
                    <span>Vence dia <strong>{selectedCard.dueDay}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Automatic Closing Logic Notice Banner */}
          {selectedCard && (
            <div className={`p-3 rounded-xl text-xs flex items-start gap-2.5 hairline-border ${
              isPastClosing
                ? 'bg-[#34C759]/10 text-[#34C759] dark:text-[#30D158]'
                : 'bg-[#007AFF]/10 text-[#007AFF] dark:text-[#0A84FF]'
            }`}>
              {isPastClosing ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <div className="text-[11px] leading-relaxed">
                {isPastClosing ? (
                  <span>
                    <strong>Melhor dia de compra ativo!</strong> Hoje (dia {currentDay}) já passou do fechamento (dia {selectedCard.closingDay}). Compras realizadas agora serão computadas automaticamente na fatura do <strong>mês subsequente</strong>.
                  </span>
                ) : (
                  <span>
                    <strong>Fatura aberta até dia {selectedCard.closingDay}.</strong> Compras feitas até o fechamento serão cobradas no vencimento de dia {selectedCard.dueDay}.
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
