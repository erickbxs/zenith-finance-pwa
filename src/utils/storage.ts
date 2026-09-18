import { Transaction, CreditCard, RecurringRule, AppBackupData } from '../types';
import { getCachedRates, saveRates } from './currency';
import { computeCreditCardInvoiceMonth, getCurrentYearMonth, shiftMonth } from './date';
import { encryptData, decryptData, EncryptedPayload } from './crypto';

const STORAGE_KEY_TX = 'zenit_transactions_v1';
const STORAGE_KEY_CARDS = 'zenit_cards_v1';
const STORAGE_KEY_RECURRING = 'zenit_recurring_v1';
const STORAGE_KEY_THEME = 'zenit_theme_mode';

const LEGACY_KEY_TX = 'equilibrio_transactions_v1';
const LEGACY_KEY_CARDS = 'equilibrio_cards_v1';
const LEGACY_KEY_RECURRING = 'equilibrio_recurring_v1';
const LEGACY_KEY_THEME = 'equilibrio_theme_mode';

export function getStoredTheme(): 'dark' | 'light' {
  const saved = localStorage.getItem(STORAGE_KEY_THEME) || localStorage.getItem(LEGACY_KEY_THEME);
  if (saved === 'dark' || saved === 'light') return saved;
  return 'dark';
}

export function setStoredTheme(theme: 'dark' | 'light') {
  localStorage.setItem(STORAGE_KEY_THEME, theme);
}

export function loadCreditCards(): CreditCard[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_CARDS) || localStorage.getItem(LEGACY_KEY_CARDS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load credit cards', e);
  }

  // Default initial card (Apple Wallet inspired)
  const initialCards: CreditCard[] = [
    {
      id: 'card_apple_black',
      name: 'Nubank Ultravioleta',
      limit: 15000,
      closingDay: 20, // Fecha todo dia 20
      dueDay: 27,     // Vence dia 27
      color: 'slate',
      digits: '8842',
    },
    {
      id: 'card_inter_gold',
      name: 'Itaú Personalité Visa Infinite',
      limit: 25000,
      closingDay: 10, // Fecha todo dia 10
      dueDay: 18,
      color: 'midnight',
      digits: '3190',
    }
  ];
  saveCreditCards(initialCards);
  return initialCards;
}

export function saveCreditCards(cards: CreditCard[]) {
  localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(cards));
}

export function loadRecurringRules(): RecurringRule[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_RECURRING) || localStorage.getItem(LEGACY_KEY_RECURRING);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load recurring rules', e);
  }

  const currentYM = getCurrentYearMonth();
  const initialRules: RecurringRule[] = [
    {
      id: 'rec_salario',
      description: 'Salário Mensal CLT',
      amountOriginal: 12500,
      currencyOriginal: 'BRL',
      type: 'income',
      category: 'Renda',
      paymentMethod: 'pix',
      dayOfMonth: 5,
      startMonth: shiftMonth(currentYM, -2),
      projectionMonths: 24,
      active: true,
    },
    {
      id: 'rec_renda_extra_usd',
      description: 'Consultoria Remota USD',
      amountOriginal: 800,
      currencyOriginal: 'USD',
      type: 'income',
      category: 'Freelance',
      paymentMethod: 'pix',
      dayOfMonth: 15,
      startMonth: currentYM,
      projectionMonths: 12,
      active: true,
    },
    {
      id: 'rec_aluguel',
      description: 'Aluguel & Condomínio',
      amountOriginal: 3400,
      currencyOriginal: 'BRL',
      type: 'expense',
      category: 'Moradia',
      paymentMethod: 'pix',
      dayOfMonth: 10,
      startMonth: shiftMonth(currentYM, -2),
      projectionMonths: 24,
      active: true,
    },
    {
      id: 'rec_internet',
      description: 'Fibra Óptica 1Gbps',
      amountOriginal: 169.90,
      currencyOriginal: 'BRL',
      type: 'expense',
      category: 'Serviços',
      paymentMethod: 'credit_card',
      creditCardId: 'card_apple_black',
      dayOfMonth: 12,
      startMonth: shiftMonth(currentYM, -2),
      projectionMonths: 24,
      active: true,
    },
    {
      id: 'rec_gym',
      description: 'Academia Smart Fit Black',
      amountOriginal: 149.90,
      currencyOriginal: 'BRL',
      type: 'expense',
      category: 'Saúde',
      paymentMethod: 'credit_card',
      creditCardId: 'card_apple_black',
      dayOfMonth: 18,
      startMonth: shiftMonth(currentYM, -2),
      projectionMonths: 24,
      active: true,
    }
  ];
  saveRecurringRules(initialRules);
  return initialRules;
}

export function saveRecurringRules(rules: RecurringRule[]) {
  localStorage.setItem(STORAGE_KEY_RECURRING, JSON.stringify(rules));
}

export function loadTransactions(): Transaction[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_TX) || localStorage.getItem(LEGACY_KEY_TX);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load transactions', e);
  }

  const currentYM = getCurrentYearMonth();
  const [currYear, currMonth] = currentYM.split('-');
  const rates = getCachedRates();

  const initialTxs: Transaction[] = [
    {
      id: 'tx_demo_1',
      description: 'Supermercado Pão de Açúcar',
      amountOriginal: 485.60,
      currencyOriginal: 'BRL',
      exchangeRate: 1.0,
      amountBRL: 485.60,
      date: `${currYear}-${currMonth}-04`,
      type: 'expense',
      category: 'Alimentação',
      paymentMethod: 'credit_card',
      creditCardId: 'card_apple_black',
      targetInvoiceMonth: computeCreditCardInvoiceMonth(`${currYear}-${currMonth}-04`, 20),
      createdAt: Date.now() - 86400000 * 5,
    },
    {
      id: 'tx_demo_2',
      description: 'Eletrônicos Ciudad del Este (PYG)',
      amountOriginal: 1850000,
      currencyOriginal: 'PYG',
      exchangeRate: rates.PYGBRL || 0.00072,
      amountBRL: Math.round(1850000 * (rates.PYGBRL || 0.00072) * 100) / 100,
      date: `${currYear}-${currMonth}-12`,
      type: 'expense',
      category: 'Tecnologia',
      paymentMethod: 'credit_card',
      creditCardId: 'card_apple_black',
      targetInvoiceMonth: computeCreditCardInvoiceMonth(`${currYear}-${currMonth}-12`, 20),
      createdAt: Date.now() - 86400000 * 3,
    },
    {
      id: 'tx_demo_3',
      description: 'Assinatura Apple One Premier (USD)',
      amountOriginal: 37.95,
      currencyOriginal: 'USD',
      exchangeRate: rates.USDBRL || 5.50,
      amountBRL: Math.round(37.95 * (rates.USDBRL || 5.50) * 100) / 100,
      date: `${currYear}-${currMonth}-15`,
      type: 'expense',
      category: 'Assinaturas',
      paymentMethod: 'credit_card',
      creditCardId: 'card_apple_black',
      targetInvoiceMonth: computeCreditCardInvoiceMonth(`${currYear}-${currMonth}-15`, 20),
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: 'tx_demo_4',
      description: 'Restaurante Fogo de Chão',
      amountOriginal: 380.00,
      currencyOriginal: 'BRL',
      exchangeRate: 1.0,
      amountBRL: 380.00,
      date: `${currYear}-${currMonth}-22`,
      type: 'expense',
      category: 'Lazer',
      paymentMethod: 'credit_card',
      creditCardId: 'card_apple_black',
      targetInvoiceMonth: computeCreditCardInvoiceMonth(`${currYear}-${currMonth}-22`, 20),
      createdAt: Date.now() - 86400000 * 1,
    },
    {
      id: 'tx_demo_5',
      description: 'Reembolso Viagem Corporativa',
      amountOriginal: 940.00,
      currencyOriginal: 'BRL',
      exchangeRate: 1.0,
      amountBRL: 940.00,
      date: `${currYear}-${currMonth}-16`,
      type: 'income',
      category: 'Trabalho',
      paymentMethod: 'pix',
      createdAt: Date.now() - 86400000 * 1,
    }
  ];

  saveTransactions(initialTxs);
  return initialTxs;
}

export function saveTransactions(txs: Transaction[]) {
  localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(txs));
}

/**
 * Compiles complete current application state into a unified backup object
 */
export function getFullBackupPayload(): AppBackupData {
  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    transactions: loadTransactions(),
    creditCards: loadCreditCards(),
    recurringRules: loadRecurringRules(),
    exchangeRates: getCachedRates(),
  };
}

/**
 * Exports complete local database as JSON file for backup (standard or AES-GCM encrypted)
 */
export async function exportBackupData(masterPassword?: string): Promise<void> {
  const data = getFullBackupPayload();
  const rawJson = JSON.stringify(data, null, 2);

  let outputContent: string;
  let filename: string;

  if (masterPassword && masterPassword.trim().length >= 6) {
    // Encrypt with Web Crypto AES-GCM 256-bit
    const encrypted = await encryptData(rawJson, masterPassword.trim());
    outputContent = JSON.stringify(encrypted, null, 2);
    filename = `zenit-backup-encrypted-${new Date().toISOString().slice(0, 10)}.aes.json`;
  } else {
    outputContent = rawJson;
    filename = `zenit-finance-backup-${new Date().toISOString().slice(0, 10)}.json`;
  }

  const blob = new Blob([outputContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports backup JSON data into localStorage (handles plain JSON and encrypted AES-GCM payloads)
 */
export async function importBackupData(fileContent: string, masterPassword?: string): Promise<{ success: boolean; message?: string }> {
  try {
    const parsed = JSON.parse(fileContent);

    let data: AppBackupData;

    // Check if the file is an AES-GCM encrypted payload
    if (parsed && parsed.algorithm === 'AES-GCM-256' && parsed.cipherText && parsed.iv && parsed.salt) {
      if (!masterPassword) {
        return {
          success: false,
          message: 'Este arquivo está protegido com criptografia AES-256. Por favor, insira a senha mestre.',
        };
      }
      try {
        const decryptedJson = await decryptData(parsed as EncryptedPayload, masterPassword);
        data = JSON.parse(decryptedJson);
      } catch (err: any) {
        return {
          success: false,
          message: err.message || 'Senha mestre incorreta.',
        };
      }
    } else {
      data = parsed as AppBackupData;
    }

    if (!data || !Array.isArray(data.transactions) || !Array.isArray(data.creditCards)) {
      return { success: false, message: 'Arquivo de backup inválido ou formato incompatível.' };
    }

    saveTransactions(data.transactions);
    saveCreditCards(data.creditCards);
    if (Array.isArray(data.recurringRules)) {
      saveRecurringRules(data.recurringRules);
    }
    if (data.exchangeRates) {
      saveRates(data.exchangeRates);
    }
    return { success: true };
  } catch (e: any) {
    console.error('Failed to import backup', e);
    return { success: false, message: e.message || 'Erro ao processar arquivo de backup.' };
  }
}
