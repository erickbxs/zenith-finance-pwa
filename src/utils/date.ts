const MONTH_NAMES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const SHORT_MONTHS_PT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

/**
 * Returns today in YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns current month in YYYY-MM
 */
export function getCurrentYearMonth(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Formats YYYY-MM to full PT-BR label: "Setembro de 2026"
 */
export function formatMonthYear(yearMonth: string): string {
  const [yearStr, monthStr] = yearMonth.split('-');
  const monthIndex = parseInt(monthStr, 10) - 1;
  const monthName = MONTH_NAMES_PT[monthIndex] || '';
  return `${monthName} de ${yearStr}`;
}

/**
 * Formats YYYY-MM to short label: "Set 26"
 */
export function formatShortMonthYear(yearMonth: string): string {
  const [yearStr, monthStr] = yearMonth.split('-');
  const monthIndex = parseInt(monthStr, 10) - 1;
  const shortName = SHORT_MONTHS_PT[monthIndex] || '';
  return `${shortName} ${yearStr.slice(-2)}`;
}

/**
 * Formats YYYY-MM-DD to "18 de set." or "18/09/2026"
 */
export function formatDatePT(dateStr: string, withYear = false): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const day = parseInt(parts[2], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const year = parts[0];

  if (withYear) {
    return `${String(day).padStart(2, '0')}/${String(monthIdx + 1).padStart(2, '0')}/${year}`;
  }
  return `${day} de ${SHORT_MONTHS_PT[monthIdx]?.toLowerCase() || ''}`;
}

/**
 * Automatic credit card invoice calculation:
 * If purchase day < closingDay, bill is for the SAME month.
 * If purchase day >= closingDay, bill is for the NEXT month!
 * Example: Purchase on 2026-09-20 with closing day 20 -> Invoice 2026-10!
 */
export function computeCreditCardInvoiceMonth(purchaseDateStr: string, closingDay: number): string {
  const parts = purchaseDateStr.split('-');
  let year = parseInt(parts[0], 10);
  let month = parseInt(parts[1], 10); // 1-12
  const day = parseInt(parts[2], 10);

  if (day >= closingDay) {
    // Falls into the following month
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Add or subtract months from a YYYY-MM string
 */
export function shiftMonth(yearMonth: string, offsetMonths: number): string {
  const [yearStr, monthStr] = yearMonth.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10) + offsetMonths;

  while (month > 12) {
    month -= 12;
    year += 1;
  }
  while (month < 1) {
    month += 12;
    year -= 1;
  }

  return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Generates an array of future & past months around current month
 */
export function generateTimelineMonths(currentYM: string, pastCount = 1, futureCount = 12): string[] {
  const months: string[] = [];
  for (let i = -pastCount; i <= futureCount; i++) {
    months.push(shiftMonth(currentYM, i));
  }
  return months;
}
