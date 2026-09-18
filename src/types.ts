export type Currency = 'BRL' | 'USD' | 'PYG';

export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 'credit_card' | 'pix' | 'debit' | 'cash';

export interface Transaction {
  id: string;
  description: string;
  amountOriginal: number;
  currencyOriginal: Currency;
  exchangeRate: number; // 1.0 for BRL, e.g. 5.45 for USD, 0.00072 for PYG
  amountBRL: number;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  category: string;
  paymentMethod: PaymentMethod;
  creditCardId?: string;
  targetInvoiceMonth?: string; // YYYY-MM which invoice this purchase belongs to
  isRecurring?: boolean;
  recurringParentId?: string;
  createdAt: number;
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  closingDay: number; // Dia de fechamento da fatura (ex: 20)
  dueDay: number;     // Dia de vencimento (ex: 27)
  color: string;      // Identificador visual do cartão
  digits?: string;    // Últimos 4 dígitos (opcional)
}

export interface RecurringRule {
  id: string;
  description: string;
  amountOriginal: number;
  currencyOriginal: Currency;
  type: TransactionType;
  category: string;
  paymentMethod: PaymentMethod;
  creditCardId?: string;
  dayOfMonth: number;
  startMonth: string; // YYYY-MM
  projectionMonths: number; // 6 a 24 meses
  active: boolean;
}

export interface ExchangeRates {
  USDBRL: number;
  PYGBRL: number;
  lastUpdated: number; // timestamp
  source: 'api' | 'manual' | 'cached';
}

export interface MonthSummary {
  yearMonth: string; // YYYY-MM
  label: string;     // Ex: "Setembro 2026"
  year: number;
  month: number;     // 1-12
  isCurrent: boolean;
  isPast: boolean;
  isFuture: boolean;
  totalIncome: number;
  totalExpense: number;
  creditCardExpense: number;
  cashExpense: number;
  netBalance: number;
  accumulatedBalance: number;
  transactions: Transaction[];
}

export interface AppBackupData {
  version: string;
  exportedAt: string;
  transactions: Transaction[];
  creditCards: CreditCard[];
  recurringRules: RecurringRule[];
  exchangeRates: ExchangeRates;
}
