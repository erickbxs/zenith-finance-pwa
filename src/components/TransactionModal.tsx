import React, { useState, useEffect, useId } from 'react';
import { X, ArrowDownRight, ArrowUpRight, DollarSign, Calendar, CreditCard as CardIcon, RefreshCw, Repeat } from 'lucide-react';
import { Currency, PaymentMethod, TransactionType, Transaction, CreditCard, ExchangeRates } from '../types';
import { convertToBRL, formatCurrency } from '../utils/currency';
import { computeCreditCardInvoiceMonth, formatMonthYear, getTodayDateString } from '../utils/date';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt'>, isRecurring: boolean, projectionMonths: number) => void;
  cards: CreditCard[];
  rates: ExchangeRates;
  initialDate?: string;
}

const CATEGORIES = {
  expense: [
    'Alimentação', 'Moradia', 'Transporte', 'Assinaturas',
    'Saúde', 'Tecnologia', 'Lazer', 'Educação', 'Outros'
  ],
  income: [
    'Salário', 'Freelance', 'Investimentos', 'Reembolso', 'Vendas', 'Outros'
  ]
};

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  cards,
  rates,
  initialDate,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [currency, setCurrency] = useState<Currency>('BRL');
  const [date, setDate] = useState(initialDate || getTodayDateString());
  const [category, setCategory] = useState('Alimentação');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [selectedCardId, setSelectedCardId] = useState(cards[0]?.id || '');
  const [isRecurring, setIsRecurring] = useState(false);
  const [projectionMonths, setProjectionMonths] = useState(12);

  // Form IDs
  const descId = useId();
  const amountId = useId();
  const dateId = useId();
  const catId = useId();
  const cardSelectId = useId();
  const recurMonthsId = useId();

  // Reset or update on open
  useEffect(() => {
    if (isOpen) {
      setDate(initialDate || getTodayDateString());
      if (cards.length > 0 && !selectedCardId) {
        setSelectedCardId(cards[0].id);
      }
    }
  }, [isOpen, initialDate, cards]);

  if (!isOpen) return null;

  const numericAmount = parseFloat(amountStr.replace(',', '.')) || 0;
  const { amountBRL, rateUsed } = convertToBRL(numericAmount, currency, rates);

  // Credit card invoice determination
  const selectedCard = cards.find(c => c.id === selectedCardId) || cards[0];
  const computedInvoiceMonth = (paymentMethod === 'credit_card' && selectedCard)
    ? computeCreditCardInvoiceMonth(date, selectedCard.closingDay)
    : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || numericAmount <= 0) return;

    onSave(
      {
        description: description.trim(),
        amountOriginal: numericAmount,
        currencyOriginal: currency,
        exchangeRate: rateUsed,
        amountBRL,
        date,
        type,
        category,
        paymentMethod,
        creditCardId: paymentMethod === 'credit_card' ? selectedCard?.id : undefined,
        targetInvoiceMonth: computedInvoiceMonth,
      },
      isRecurring,
      projectionMonths
    );

    // Reset fields
    setDescription('');
    setAmountStr('');
    setIsRecurring(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-lg rounded-t-[28px] sm:rounded-[28px] bg-[var(--modal-bg)] p-6 shadow-2xl hairline-border text-[var(--text-primary)] max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b hairline-border mb-4">
          <div>
            <h3 className="text-base font-bold">Nova Transação</h3>
            <p className="text-xs text-[var(--text-secondary)]">Entradas, Saídas e Multimoeda</p>
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
          {/* Segmented Control: Expense vs Income */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-black/5 dark:bg-white/5">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory('Alimentação');
              }}
              className={`ios-tap-active py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                type === 'expense'
                  ? 'bg-[#FF3B30] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Despesa</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('Salário');
                if (paymentMethod === 'credit_card') setPaymentMethod('pix');
              }}
              className={`ios-tap-active py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                type === 'income'
                  ? 'bg-[#34C759] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Receita</span>
            </button>
          </div>

          {/* Amount & Currency Selector */}
          <div>
            <label htmlFor={amountId} className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Valor e Moeda
            </label>
            <div className="flex gap-2">
              {/* Currency pills */}
              <div className="flex rounded-xl bg-black/5 dark:bg-white/5 p-1 shrink-0">
                {(['BRL', 'USD', 'PYG'] as Currency[]).map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setCurrency(curr)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      currency === curr
                        ? 'bg-[var(--card-bg)] text-[#007AFF] shadow-xs'
                        : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {curr === 'BRL' ? 'R$ BRL' : curr === 'USD' ? '$ USD' : '₲ PYG'}
                  </button>
                ))}
              </div>

              {/* Amount input */}
              <input
                id={amountId}
                type="text"
                inputMode="decimal"
                required
                placeholder={currency === 'PYG' ? '1500000' : '0,00'}
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] text-base font-semibold text-[var(--text-primary)] border hairline-border focus:outline-hidden focus:border-[#007AFF]"
              />
            </div>

            {/* Currency Live Normalization Preview */}
            {numericAmount > 0 && (
              <div className="mt-2 p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] text-xs space-y-1 hairline-border">
                <div className="flex justify-between items-center text-[var(--text-secondary)]">
                  <span>Valor Consolidado (Real BRL):</span>
                  <span className="font-bold text-sm text-[var(--text-primary)]">
                    {formatCurrency(amountBRL, 'BRL')}
                  </span>
                </div>
                {currency !== 'BRL' && (
                  <div className="text-[10px] text-[var(--text-secondary)] flex items-center justify-between">
                    <span>Taxa Aplicada:</span>
                    <span>
                      {currency === 'USD'
                        ? `1 USD = R$ ${rates.USDBRL.toFixed(2)}`
                        : `1 BRL ≈ ₲ ${Math.round(1 / rates.PYGBRL).toLocaleString('es-PY')} (Tx: ${rates.PYGBRL.toFixed(6)})`}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor={descId} className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Descrição
            </label>
            <input
              id={descId}
              type="text"
              required
              placeholder="Ex: Supermercado, Aluguel, Farmácia..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] text-sm text-[var(--text-primary)] border hairline-border focus:outline-hidden focus:border-[#007AFF]"
            />
          </div>

          {/* Date & Category in 2 columns */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={dateId} className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Data
              </label>
              <input
                id={dateId}
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] text-xs text-[var(--text-primary)] border hairline-border focus:outline-hidden"
              />
            </div>

            <div>
              <label htmlFor={catId} className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Categoria
              </label>
              <select
                id={catId}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-main)] text-xs text-[var(--text-primary)] border hairline-border focus:outline-hidden"
              >
                {CATEGORIES[type].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Forma de Pagamento
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'credit_card', label: 'Cartão de Crédito', disabled: type === 'income' },
                { id: 'pix', label: 'Pix' },
                { id: 'debit', label: 'Débito' },
                { id: 'cash', label: 'Dinheiro' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  disabled={m.disabled}
                  onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                  className={`ios-tap-active py-2 px-2 rounded-xl text-xs font-medium transition-all ${
                    m.disabled
                      ? 'opacity-40 cursor-not-allowed bg-black/5 dark:bg-white/5'
                      : paymentMethod === m.id
                      ? 'bg-[#007AFF] text-white shadow-xs'
                      : 'bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* If Credit Card: Pick card & display automatic invoice month calculation */}
          {paymentMethod === 'credit_card' && cards.length > 0 && (
            <div className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] hairline-border space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor={cardSelectId} className="text-xs font-semibold text-[var(--text-primary)]">
                  Cartão Selecionado
                </label>
                <select
                  id={cardSelectId}
                  value={selectedCardId}
                  onChange={(e) => setSelectedCardId(e.target.value)}
                  className="px-2 py-1 rounded-lg bg-[var(--bg-main)] text-xs text-[var(--text-primary)] border hairline-border"
                >
                  {cards.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Fecha dia {c.closingDay})
                    </option>
                  ))}
                </select>
              </div>

              {/* Automatic Invoice Calculation Preview */}
              {selectedCard && computedInvoiceMonth && (
                <div className="p-2.5 rounded-lg bg-[#007AFF]/10 text-[#007AFF] dark:text-[#0A84FF] text-xs">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <CardIcon className="w-3.5 h-3.5" />
                    <span>Lógica de Fechamento da Fatura:</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-snug">
                    Comprando no dia {date.slice(8)} (Fechamento: dia {selectedCard.closingDay}), esta despesa será cobrada na fatura de <strong>{formatMonthYear(computedInvoiceMonth)}</strong>.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Recurrence option (Fixed Expense / Income projected for 6 to 24 months) */}
          <div className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] hairline-border space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded text-[#007AFF] w-4 h-4"
              />
              <div className="text-xs">
                <span className="font-semibold block text-[var(--text-primary)]">Gasto/Receita Recorrente Fixa</span>
                <span className="text-[10px] text-[var(--text-secondary)]">Projeta automaticamente para os próximos meses</span>
              </div>
            </label>

            {isRecurring && (
              <div className="pt-2 border-t hairline-border flex items-center justify-between text-xs">
                <label htmlFor={recurMonthsId} className="text-[var(--text-secondary)]">
                  Projetar pelos próximos:
                </label>
                <select
                  id={recurMonthsId}
                  value={projectionMonths}
                  onChange={(e) => setProjectionMonths(Number(e.target.value))}
                  className="px-2 py-1 rounded-lg bg-[var(--bg-main)] text-xs text-[var(--text-primary)] border hairline-border"
                >
                  <option value={6}>6 Meses</option>
                  <option value={12}>12 Meses (1 Ano)</option>
                  <option value={18}>18 Meses</option>
                  <option value={24}>24 Meses (2 Anos)</option>
                </select>
              </div>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#007AFF] dark:bg-[#0A84FF] text-white font-bold text-sm shadow-md hover:opacity-90 transition ios-tap-active"
          >
            {type === 'expense' ? 'Registrar Despesa' : 'Registrar Receita'}
          </button>
        </form>
      </div>
    </div>
  );
};
