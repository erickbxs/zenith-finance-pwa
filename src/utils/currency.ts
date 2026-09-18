import { Currency, ExchangeRates } from '../types';

const STORAGE_KEY_RATES = 'zenit_exchange_rates_manual';
const LEGACY_STORAGE_KEY_RATES = 'equilibrio_exchange_rates_manual';

// Default baseline rates for offline initial start
const DEFAULT_MANUAL_RATES: ExchangeRates = {
  USDBRL: 5.50,
  PYGBRL: 0.00072, // 1 BRL ≈ 1.388 PYG (ou 1.000.000 PYG ≈ R$ 720,00)
  lastUpdated: Date.now(),
  source: 'manual',
};

/**
 * Loads exchange rates stored strictly on local device (IndexedDB / LocalStorage).
 * Zero network requests.
 */
export function getCachedRates(): ExchangeRates {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_RATES) || localStorage.getItem(LEGACY_STORAGE_KEY_RATES);
    if (saved) {
      const parsed: ExchangeRates = JSON.parse(saved);
      if (parsed && typeof parsed.USDBRL === 'number' && typeof parsed.PYGBRL === 'number') {
        return {
          ...parsed,
          source: 'manual',
        };
      }
    }
  } catch (e) {
    console.error('Falha ao ler taxas locais do dispositivo', e);
  }
  return DEFAULT_MANUAL_RATES;
}

/**
 * Persists user-defined manual exchange rates with local timestamp.
 * Strictly local-only, zero network transmission.
 */
export function saveRates(rates: ExchangeRates): void {
  try {
    const manualRates: ExchangeRates = {
      USDBRL: Number(rates.USDBRL) > 0 ? Number(rates.USDBRL) : 5.50,
      PYGBRL: Number(rates.PYGBRL) > 0 ? Number(rates.PYGBRL) : 0.00072,
      lastUpdated: Date.now(),
      source: 'manual',
    };
    localStorage.setItem(STORAGE_KEY_RATES, JSON.stringify(manualRates));
  } catch (e) {
    console.error('Falha ao gravar taxas locais', e);
  }
}

/**
 * Normalizes any supported currency into BRL using strictly local manual rates.
 */
export function convertToBRL(
  amount: number,
  currency: Currency,
  rates: ExchangeRates
): { amountBRL: number; rateUsed: number } {
  if (currency === 'BRL') {
    return { amountBRL: amount, rateUsed: 1.0 };
  }

  if (currency === 'USD') {
    const rate = rates.USDBRL > 0 ? rates.USDBRL : 5.50;
    return {
      amountBRL: Math.round(amount * rate * 100) / 100,
      rateUsed: rate,
    };
  }

  if (currency === 'PYG') {
    const rate = rates.PYGBRL > 0 ? rates.PYGBRL : 0.00072;
    return {
      amountBRL: Math.round(amount * rate * 100) / 100,
      rateUsed: rate,
    };
  }

  return { amountBRL: amount, rateUsed: 1.0 };
}

/**
 * Format currency with proper locale standard
 */
export function formatCurrency(amount: number, currency: Currency = 'BRL'): string {
  if (currency === 'BRL') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  }

  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  if (currency === 'PYG') {
    return `₲ ${Math.round(amount).toLocaleString('es-PY')}`;
  }

  return `${amount.toFixed(2)}`;
}

/**
 * Formats a clear Brazilian date-time string for "Último Ajuste Manual"
 */
export function formatLastManualUpdate(timestamp: number): string {
  if (!timestamp || timestamp === 0) return 'Configuração Inicial Padrão';
  return new Date(timestamp).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
