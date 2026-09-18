import { Transaction, RecurringRule, MonthSummary, CreditCard } from '../types';
import { formatMonthYear, getCurrentYearMonth, computeCreditCardInvoiceMonth } from './date';

export function calculateMonthSummaries(
  timelineMonths: string[],
  actualTransactions: Transaction[],
  recurringRules: RecurringRule[],
  creditCards: CreditCard[]
): MonthSummary[] {
  const currentYM = getCurrentYearMonth();
  const cardMap = new Map(creditCards.map(c => [c.id, c]));

  let runningAccumulatedBalance = 0;

  return timelineMonths.map((ym) => {
    const [yearStr, monthStr] = ym.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const isCurrent = ym === currentYM;
    const isPast = ym < currentYM;
    const isFuture = ym > currentYM;

    // 1. Collect actual transactions for this month
    const monthTransactions: Transaction[] = [];

    // Filter actual recorded transactions
    actualTransactions.forEach((tx) => {
      if (tx.paymentMethod === 'credit_card') {
        // Credit card transactions belong to their calculated invoice month!
        const invoiceMonth = tx.targetInvoiceMonth || (tx.creditCardId && cardMap.get(tx.creditCardId)
          ? computeCreditCardInvoiceMonth(tx.date, cardMap.get(tx.creditCardId)!.closingDay)
          : tx.date.slice(0, 7));

        if (invoiceMonth === ym) {
          monthTransactions.push(tx);
        }
      } else {
        // Standard cash/pix/debit transactions belong to their transaction date month
        if (tx.date.slice(0, 7) === ym) {
          monthTransactions.push(tx);
        }
      }
    });

    // 2. If this is a future month (or current month projections for recurring items not yet logged),
    // inject projected recurring entries
    recurringRules.forEach((rule) => {
      if (!rule.active) return;

      // Check if this month falls into the rule projection range
      if (ym >= rule.startMonth) {
        // Calculate diff in months
        const [ruleYear, ruleMonth] = rule.startMonth.split('-').map(Number);
        const monthsDiff = (year - ruleYear) * 12 + (month - ruleMonth);

        if (monthsDiff >= 0 && monthsDiff < rule.projectionMonths) {
          // Check if already manually registered for this exact month & rule to avoid double counting
          const alreadyExists = monthTransactions.some(
            (t) => t.recurringParentId === rule.id || (t.description === rule.description && t.isRecurring)
          );

          if (!alreadyExists) {
            const projectedDate = `${ym}-${String(Math.min(rule.dayOfMonth, 28)).padStart(2, '0')}`;
            
            // For credit card recurring items, determine target invoice
            let invoiceMonth = ym;
            if (rule.paymentMethod === 'credit_card' && rule.creditCardId) {
              const card = cardMap.get(rule.creditCardId);
              if (card) {
                invoiceMonth = computeCreditCardInvoiceMonth(projectedDate, card.closingDay);
              }
            }

            // Only add if target invoice is this month
            if (invoiceMonth === ym) {
              monthTransactions.push({
                id: `proj_${rule.id}_${ym}`,
                description: rule.description,
                amountOriginal: rule.amountOriginal,
                currencyOriginal: rule.currencyOriginal,
                exchangeRate: 1.0, // normalized amount
                amountBRL: rule.amountOriginal, // simplified for recurring BRL
                date: projectedDate,
                type: rule.type,
                category: rule.category,
                paymentMethod: rule.paymentMethod,
                creditCardId: rule.creditCardId,
                targetInvoiceMonth: invoiceMonth,
                isRecurring: true,
                recurringParentId: rule.id,
                createdAt: Date.now(),
              });
            }
          }
        }
      }
    });

    // 3. Compute totals
    let totalIncome = 0;
    let totalExpense = 0;
    let creditCardExpense = 0;
    let cashExpense = 0;

    monthTransactions.forEach((tx) => {
      if (tx.type === 'income') {
        totalIncome += tx.amountBRL;
      } else {
        totalExpense += tx.amountBRL;
        if (tx.paymentMethod === 'credit_card') {
          creditCardExpense += tx.amountBRL;
        } else {
          cashExpense += tx.amountBRL;
        }
      }
    });

    const netBalance = totalIncome - totalExpense;
    runningAccumulatedBalance += netBalance;

    return {
      yearMonth: ym,
      label: formatMonthYear(ym),
      year,
      month,
      isCurrent,
      isPast,
      isFuture,
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpense: Math.round(totalExpense * 100) / 100,
      creditCardExpense: Math.round(creditCardExpense * 100) / 100,
      cashExpense: Math.round(cashExpense * 100) / 100,
      netBalance: Math.round(netBalance * 100) / 100,
      accumulatedBalance: Math.round(runningAccumulatedBalance * 100) / 100,
      transactions: monthTransactions.sort((a, b) => b.date.localeCompare(a.date)),
    };
  });
}
