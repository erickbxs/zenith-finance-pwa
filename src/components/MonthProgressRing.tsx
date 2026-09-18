import React from 'react';
import { formatCurrency } from '../utils/currency';

interface MonthProgressRingProps {
  income: number;
  expense: number;
  creditCardExpense: number;
  cashExpense: number;
  size?: number;
}

export const MonthProgressRing: React.FC<MonthProgressRingProps> = ({
  income,
  expense,
  creditCardExpense,
  cashExpense,
  size = 128,
}) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  // Percentage of income consumed by total expenses
  const ratio = income > 0 ? Math.min(expense / income, 1.25) : (expense > 0 ? 1 : 0);
  const percentDisplay = income > 0 ? Math.round((expense / income) * 100) : (expense > 0 ? 100 : 0);
  const strokeDashoffset = circumference - Math.min(ratio, 1) * circumference;

  // Color logic
  let ringColor = '#34C759'; // Apple Mint Green
  if (percentDisplay > 85 && percentDisplay <= 100) {
    ringColor = '#FF9500'; // Apple Amber
  } else if (percentDisplay > 100) {
    ringColor = '#FF3B30'; // Apple Carmim Red
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      {/* Circular SVG Ring */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-black/10 dark:text-white/10"
            fill="transparent"
          />
          {/* Animated progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            {percentDisplay}%
          </span>
          <span className="text-[10px] text-[var(--text-secondary)] font-medium">
            {percentDisplay > 100 ? 'Excedido' : 'Comprometido'}
          </span>
        </div>
      </div>

      {/* Breakdown Metrics */}
      <div className="flex-1 w-full space-y-2">
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-[var(--text-secondary)]">Entradas vs. Saídas</span>
            <span className="font-semibold text-[var(--text-primary)]">
              {formatCurrency(expense)} / {formatCurrency(income)}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden flex">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(percentDisplay, 100)}%`,
                backgroundColor: ringColor,
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t hairline-border">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#007AFF]" />
            <span className="text-[var(--text-secondary)]">Faturas Cartão:</span>
            <span className="font-medium text-[var(--text-primary)] ml-auto">
              {formatCurrency(creditCardExpense)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#34C759]" />
            <span className="text-[var(--text-secondary)]">Pix &amp; Débito:</span>
            <span className="font-medium text-[var(--text-primary)] ml-auto">
              {formatCurrency(cashExpense)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
