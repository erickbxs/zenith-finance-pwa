import React, { useState, useEffect, useId } from 'react';
import { X, CreditCard as CardIcon, Trash2, Plus, Calendar, ShieldCheck } from 'lucide-react';
import { CreditCard } from '../types';
import { formatCurrency } from '../utils/currency';

interface CardManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CreditCard[];
  onSaveCard: (card: CreditCard) => void;
  onDeleteCard: (id: string) => void;
  editingCard?: CreditCard | null;
}

export const CardManagerModal: React.FC<CardManagerModalProps> = ({
  isOpen,
  onClose,
  cards,
  onSaveCard,
  onDeleteCard,
  editingCard,
}) => {
  const [name, setName] = useState('');
  const [limitStr, setLimitStr] = useState('');
  const [closingDay, setClosingDay] = useState(20);
  const [dueDay, setDueDay] = useState(27);
  const [color, setColor] = useState('slate');
  const [digits, setDigits] = useState('');

  // Form IDs
  const cardNameId = useId();
  const cardLimitId = useId();
  const cardDigitsId = useId();
  const cardClosingId = useId();
  const cardDueId = useId();

  useEffect(() => {
    if (editingCard) {
      setName(editingCard.name);
      setLimitStr(editingCard.limit.toString());
      setClosingDay(editingCard.closingDay);
      setDueDay(editingCard.dueDay);
      setColor(editingCard.color);
      setDigits(editingCard.digits || '');
    } else {
      setName('');
      setLimitStr('');
      setClosingDay(20);
      setDueDay(27);
      setColor('slate');
      setDigits('');
    }
  }, [editingCard, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(limitStr.replace(',', '.')) || 1000;
    if (!name.trim()) return;

    const card: CreditCard = {
      id: editingCard ? editingCard.id : `card_${Date.now()}`,
      name: name.trim(),
      limit,
      closingDay: Number(closingDay),
      dueDay: Number(dueDay),
      color,
      digits: digits.trim().slice(-4),
    };

    onSaveCard(card);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md rounded-t-[28px] sm:rounded-[28px] bg-[var(--modal-bg)] p-6 shadow-2xl hairline-border text-[var(--text-primary)] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b hairline-border mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center">
              <CardIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {editingCard ? 'Editar Cartão' : 'Novo Cartão de Crédito'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">Parâmetros de Limite e Fechamento</p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor={cardNameId} className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Nome do Cartão / Emissor
            </label>
            <input
              id={cardNameId}
              type="text"
              required
              placeholder="Ex: Nubank Ultravioleta, Itaú Visa..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] text-sm text-[var(--text-primary)] border hairline-border focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={cardLimitId} className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Limite Total (R$)
              </label>
              <input
                id={cardLimitId}
                type="text"
                required
                inputMode="decimal"
                placeholder="10000"
                value={limitStr}
                onChange={(e) => setLimitStr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] text-sm font-semibold text-[var(--text-primary)] border hairline-border focus:outline-hidden"
              />
            </div>

            <div>
              <label htmlFor={cardDigitsId} className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Últimos 4 Dígitos
              </label>
              <input
                id={cardDigitsId}
                type="text"
                maxLength={4}
                placeholder="4242"
                value={digits}
                onChange={(e) => setDigits(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] text-sm font-mono text-[var(--text-primary)] border hairline-border focus:outline-hidden"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] hairline-border">
            <div>
              <label htmlFor={cardClosingId} className="block text-[11px] font-semibold text-[var(--text-primary)] mb-1">
                Dia de Fechamento (Virada)
              </label>
              <input
                id={cardClosingId}
                type="number"
                min={1}
                max={31}
                required
                value={closingDay}
                onChange={(e) => setClosingDay(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-main)] text-sm font-bold text-[#007AFF] border hairline-border focus:outline-hidden"
              />
              <span className="text-[9px] text-[var(--text-secondary)] block mt-1">
                Virada da fatura
              </span>
            </div>

            <div>
              <label htmlFor={cardDueId} className="block text-[11px] font-semibold text-[var(--text-primary)] mb-1">
                Dia de Vencimento
              </label>
              <input
                id={cardDueId}
                type="number"
                min={1}
                max={31}
                required
                value={dueDay}
                onChange={(e) => setDueDay(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-main)] text-sm font-bold text-[#34C759] border hairline-border focus:outline-hidden"
              />
              <span className="text-[9px] text-[var(--text-secondary)] block mt-1">
                Pagamento da fatura
              </span>
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">
              Tema Visual do Cartão
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'slate', name: 'Titanium', bg: '#1C2541' },
                { id: 'midnight', name: 'Midnight', bg: '#1E293B' },
                { id: 'emerald', name: 'Esmeralda', bg: '#0F5132' },
                { id: 'purple', name: 'Roxo', bg: '#3A0CA3' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`ios-tap-active p-2 rounded-xl text-center border transition-all ${
                    color === c.id
                      ? 'border-[#007AFF] ring-2 ring-[#007AFF]/30'
                      : 'border-transparent hover:border-black/20 dark:hover:border-white/20'
                  }`}
                >
                  <div
                    className="w-full h-7 rounded-lg mb-1 shadow-sm"
                    style={{ backgroundColor: c.bg }}
                  />
                  <span className="text-[10px] font-medium text-[var(--text-secondary)] block">
                    {c.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex gap-2">
            {editingCard && cards.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  onDeleteCard(editingCard.id);
                  onClose();
                }}
                className="px-3 py-2.5 rounded-xl border border-[#FF3B30]/30 text-[#FF3B30] text-xs font-semibold hover:bg-[#FF3B30]/10 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-[#007AFF] dark:bg-[#0A84FF] text-white font-bold text-sm shadow-md hover:opacity-90 transition ios-tap-active"
            >
              {editingCard ? 'Salvar Alterações' : 'Cadastrar Cartão'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
