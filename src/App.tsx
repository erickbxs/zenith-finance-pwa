import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard as CardIcon,
  LayoutGrid,
  Columns,
  List,
} from 'lucide-react';
import { Transaction, CreditCard, RecurringRule, ExchangeRates, Currency } from './types';
import {
  loadTransactions,
  saveTransactions,
  loadCreditCards,
  saveCreditCards,
  loadRecurringRules,
  saveRecurringRules,
  getStoredTheme,
  setStoredTheme,
} from './utils/storage';
import { getCachedRates, formatCurrency } from './utils/currency';
import { sanitizeText } from './utils/sanitizer';
import { getCurrentYearMonth, generateTimelineMonths, formatMonthYear } from './utils/date';
import { calculateMonthSummaries } from './utils/projection';
import { Navbar } from './components/Navbar';
import { OfflineBanner } from './components/OfflineBanner';
import { CurrencyWidget } from './components/CurrencyWidget';
import { MonthProgressRing } from './components/MonthProgressRing';
import { MonthCard } from './components/MonthCard';
import { CreditCardModule } from './components/CreditCardModule';
import { TransactionModal } from './components/TransactionModal';
import { CardManagerModal } from './components/CardManagerModal';
import { RecurringManagerModal } from './components/RecurringManagerModal';
import { BackupModal } from './components/BackupModal';

export default function App() {
  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => getStoredTheme());

  // Data State
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions());
  const [creditCards, setCreditCards] = useState<CreditCard[]>(() => loadCreditCards());
  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>(() => loadRecurringRules());
  const [rates, setRates] = useState<ExchangeRates>(() => getCachedRates());

  // View Controls
  const [viewMode, setViewMode] = useState<'current' | 'timeline'>('current');
  const [timelineHorizon, setTimelineHorizon] = useState<number>(12);
  const [timelineStyle, setTimelineStyle] = useState<'accordion' | 'carousel' | 'grid'>('accordion');

  // Modals
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [initialTxDate, setInitialTxDate] = useState<string | undefined>(undefined);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Sync theme with HTML document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    setStoredTheme(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Timeline Calculation
  const currentYM = useMemo(() => getCurrentYearMonth(), []);
  const timelineMonths = useMemo(
    () => generateTimelineMonths(currentYM, 1, timelineHorizon),
    [currentYM, timelineHorizon]
  );

  const monthSummaries = useMemo(
    () => calculateMonthSummaries(timelineMonths, transactions, recurringRules, creditCards),
    [timelineMonths, transactions, recurringRules, creditCards]
  );

  const currentMonthSummary = useMemo(
    () => monthSummaries.find((m) => m.isCurrent) || monthSummaries[0],
    [monthSummaries]
  );

  // Future months for the timeline view
  const futureMonths = useMemo(
    () => monthSummaries.filter((m) => m.isFuture || m.isCurrent),
    [monthSummaries]
  );

  // Handlers for Transactions
  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>,
    isRecurring: boolean,
    projectionMonths: number
  ) => {
    const newTx: Transaction = {
      ...txData,
      description: sanitizeText(txData.description),
      category: sanitizeText(txData.category),
      id: `tx_${Date.now()}`,
      createdAt: Date.now(),
    };

    const updatedTxs = [newTx, ...transactions];
    setTransactions(updatedTxs);
    saveTransactions(updatedTxs);

    // If marked as recurring rule, register rule
    if (isRecurring) {
      const dayNum = parseInt(txData.date.slice(8), 10) || 1;
      const newRule: RecurringRule = {
        id: `rec_${Date.now()}`,
        description: sanitizeText(txData.description),
        amountOriginal: txData.amountOriginal,
        currencyOriginal: txData.currencyOriginal,
        type: txData.type,
        category: sanitizeText(txData.category),
        paymentMethod: txData.paymentMethod,
        creditCardId: txData.creditCardId,
        dayOfMonth: dayNum,
        startMonth: txData.date.slice(0, 7),
        projectionMonths,
        active: true,
      };

      const updatedRules = [...recurringRules, newRule];
      setRecurringRules(updatedRules);
      saveRecurringRules(updatedRules);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    saveTransactions(updated);
  };

  // Handlers for Credit Cards
  const handleSaveCard = (card: CreditCard) => {
    const sanitizedCard: CreditCard = {
      ...card,
      name: sanitizeText(card.name),
      digits: card.digits ? sanitizeText(card.digits).slice(0, 4) : undefined,
    };
    const exists = creditCards.some((c) => c.id === sanitizedCard.id);
    let updated: CreditCard[];
    if (exists) {
      updated = creditCards.map((c) => (c.id === sanitizedCard.id ? sanitizedCard : c));
    } else {
      updated = [...creditCards, sanitizedCard];
    }
    setCreditCards(updated);
    saveCreditCards(updated);
  };

  const handleDeleteCard = (id: string) => {
    const updated = creditCards.filter((c) => c.id !== id);
    setCreditCards(updated);
    saveCreditCards(updated);
  };

  // Handlers for Recurring Rules
  const handleToggleRule = (id: string) => {
    const updated = recurringRules.map((r) => (r.id === id ? { ...r, active: !r.active } : r));
    setRecurringRules(updated);
    saveRecurringRules(updated);
  };

  const handleDeleteRule = (id: string) => {
    const updated = recurringRules.filter((r) => r.id !== id);
    setRecurringRules(updated);
    saveRecurringRules(updated);
  };

  const handleDataRestored = () => {
    setTransactions(loadTransactions());
    setCreditCards(loadCreditCards());
    setRecurringRules(loadRecurringRules());
    setRates(getCachedRates());
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Offline Status Bar */}
      <OfflineBanner />

      {/* Apple Glass Top Bar */}
      <Navbar
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenNewTransaction={() => {
          setInitialTxDate(undefined);
          setIsTxModalOpen(true);
        }}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        onOpenRecurring={() => setIsRecurringModalOpen(true)}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-6 pb-24">
        {/* Top Control Bar: Mês Atual vs. Visão Futura (Timeline) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Segmented Control Mode */}
          <div className="inline-flex p-1 rounded-[14px] bg-black/5 dark:bg-white/5 hairline-border self-start">
            <button
              onClick={() => setViewMode('current')}
              className={`ios-tap-active px-4 py-1.5 rounded-[10px] text-xs font-bold transition-all ${
                viewMode === 'current'
                  ? 'bg-[var(--card-bg)] text-[#007AFF] dark:text-[#0A84FF] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Mês Corrente ({formatMonthYear(currentYM).split(' de ')[0]})
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`ios-tap-active px-4 py-1.5 rounded-[10px] text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'timeline'
                  ? 'bg-[var(--card-bg)] text-[#007AFF] dark:text-[#0A84FF] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Visão Futura (Timeline)</span>
            </button>
          </div>

          {/* If in Timeline Mode: Horizon & Layout options */}
          {viewMode === 'timeline' && (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Projection horizon selector */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-[var(--text-secondary)] text-[11px] hidden sm:inline">Projeção:</span>
                <div className="flex rounded-xl bg-black/5 dark:bg-white/5 p-0.5">
                  {[6, 12, 18, 24].map((months) => (
                    <button
                      key={months}
                      onClick={() => setTimelineHorizon(months)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        timelineHorizon === months
                          ? 'bg-[#007AFF] text-white'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {months}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout Switcher (Accordion, Carousel, Grid for iPad/Desktop) */}
              <div className="flex rounded-xl bg-black/5 dark:bg-white/5 p-0.5 ml-auto">
                <button
                  onClick={() => setTimelineStyle('accordion')}
                  className={`p-1.5 rounded-lg text-xs transition ${
                    timelineStyle === 'accordion'
                      ? 'bg-[var(--card-bg)] text-[#007AFF] shadow-xs'
                      : 'text-[var(--text-secondary)]'
                  }`}
                  title="Sanfonado / Accordion (Mobile/iPhone)"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTimelineStyle('carousel')}
                  className={`p-1.5 rounded-lg text-xs transition ${
                    timelineStyle === 'carousel'
                      ? 'bg-[var(--card-bg)] text-[#007AFF] shadow-xs'
                      : 'text-[var(--text-secondary)]'
                  }`}
                  title="Carrossel Horizontal"
                >
                  <Columns className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTimelineStyle('grid')}
                  className={`p-1.5 rounded-lg text-xs transition ${
                    timelineStyle === 'grid'
                      ? 'bg-[var(--card-bg)] text-[#007AFF] shadow-xs'
                      : 'text-[var(--text-secondary)]'
                  }`}
                  title="Grid Modular (iPad 10th gen &amp; Desktop)"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* View Mode 1: MÊS CORRENTE (DEFAULT) */}
        {viewMode === 'current' && (
          <div className="space-y-6">
            {/* Top Grid: Hero Summary & Credit Card Module */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 7 Columns: Current Month Hero & Activity Ring */}
              <div className="lg:col-span-7 space-y-5">
                {/* Hero Month Financial Overview */}
                <div className="rounded-[24px] bg-[var(--card-bg)] p-6 hairline-border apple-shadow space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                        Balanço do Mês Vigente
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] mt-1">
                        {currentMonthSummary.label}
                      </h2>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[var(--text-secondary)] uppercase block">
                        Saldo Líquido
                      </span>
                      <span
                        className={`text-xl sm:text-2xl font-bold tracking-tight ${
                          currentMonthSummary.netBalance >= 0
                            ? 'text-[#34C759] dark:text-[#30D158]'
                            : 'text-[#FF3B30] dark:text-[#FF453A]'
                        }`}
                      >
                        {currentMonthSummary.netBalance >= 0 ? '+' : ''}
                        {formatCurrency(currentMonthSummary.netBalance)}
                      </span>
                    </div>
                  </div>

                  {/* Circular Activity Ring & Ratio Gauge */}
                  <MonthProgressRing
                    income={currentMonthSummary.totalIncome}
                    expense={currentMonthSummary.totalExpense}
                    creditCardExpense={currentMonthSummary.creditCardExpense}
                    cashExpense={currentMonthSummary.cashExpense}
                    size={120}
                  />

                  {/* Cumulative Financial Flow Cards */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 rounded-2xl bg-[#34C759]/10 text-[#34C759] dark:text-[#30D158] flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] opacity-80 uppercase font-semibold block">
                          Entradas Acumuladas
                        </span>
                        <span className="text-base font-bold">
                          {formatCurrency(currentMonthSummary.totalIncome)}
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#FF3B30]/10 text-[#FF3B30] dark:text-[#FF453A] flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <ArrowDownRight className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] opacity-80 uppercase font-semibold block">
                          Despesas Totais
                        </span>
                        <span className="text-base font-bold">
                          {formatCurrency(currentMonthSummary.totalExpense)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Multicurrency Exchange Widget */}
                <CurrencyWidget rates={rates} onRatesUpdated={setRates} />
              </div>

              {/* Right 5 Columns: Apple Wallet Credit Card Module */}
              <div className="lg:col-span-5 space-y-5">
                <CreditCardModule
                  cards={creditCards}
                  transactions={transactions}
                  currentYearMonth={currentYM}
                  onOpenAddCard={() => {
                    setEditingCard(null);
                    setIsCardModalOpen(true);
                  }}
                  onEditCard={(card) => {
                    setEditingCard(card);
                    setIsCardModalOpen(true);
                  }}
                />

                {/* Quick Projection Teaser */}
                <div
                  onClick={() => setViewMode('timeline')}
                  className="p-4 rounded-[20px] bg-[var(--card-bg)] hairline-border apple-shadow cursor-pointer ios-tap-active flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center shrink-0">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">
                        Previsão Financeira dos Próximos 12 a 24 Meses
                      </h4>
                      <p className="text-[10px] text-[var(--text-secondary)]">
                        Saldo acumulado projetado: <strong>{formatCurrency(monthSummaries[monthSummaries.length - 1]?.accumulatedBalance || 0)}</strong>
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            </div>

            {/* Current Month Full Transactions Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Lançamentos de {currentMonthSummary.label}
                </h3>
                <button
                  onClick={() => {
                    setInitialTxDate(undefined);
                    setIsTxModalOpen(true);
                  }}
                  className="text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar</span>
                </button>
              </div>

              <MonthCard
                summary={currentMonthSummary}
                onDeleteTransaction={handleDeleteTransaction}
                onAddTransactionToMonth={(ym) => {
                  setInitialTxDate(`${ym}-01`);
                  setIsTxModalOpen(true);
                }}
                defaultExpanded={true}
              />
            </div>
          </div>
        )}

        {/* View Mode 2: VISÃO FUTURA (TIMELINE MULTI-MÊS) */}
        {viewMode === 'timeline' && (
          <div className="space-y-6">
            {/* Timeline Header Banner */}
            <div className="rounded-[20px] bg-[var(--card-bg)] p-5 hairline-border apple-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#007AFF]" />
                    <h3 className="text-base font-bold text-[var(--text-primary)]">
                      Linha do Tempo e Previsibilidade ({timelineHorizon} Meses)
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Projeção líquida de longo prazo combinando gastos fixos, receitas recorrentes e o fechamento programado das faturas de cartão.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 hairline-border shrink-0 text-right">
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase block">
                    Saldo Projetado no Final do Período
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      (monthSummaries[monthSummaries.length - 1]?.accumulatedBalance || 0) >= 0
                        ? 'text-[#34C759] dark:text-[#30D158]'
                        : 'text-[#FF3B30] dark:text-[#FF453A]'
                    }`}
                  >
                    {formatCurrency(monthSummaries[monthSummaries.length - 1]?.accumulatedBalance || 0)}
                  </span>
                </div>
              </div>

              {/* Balance Growth Timeline Sparkline / Bars */}
              <div className="mt-5 pt-4 border-t hairline-border">
                <div className="flex justify-between items-center text-[11px] text-[var(--text-secondary)] mb-2">
                  <span>Evolução do Saldo Acumulado</span>
                  <span>Horizonte: {timelineMonths[0]} até {timelineMonths[timelineMonths.length - 1]}</span>
                </div>
                <div className="flex items-end gap-1.5 h-16 w-full pt-2">
                  {futureMonths.map((m) => {
                    const balance = m.accumulatedBalance;
                    const maxAbs = Math.max(...futureMonths.map((x) => Math.abs(x.accumulatedBalance)), 1);
                    const heightPercent = Math.max((Math.abs(balance) / maxAbs) * 100, 10);
                    const isPos = balance >= 0;

                    return (
                      <div
                        key={m.yearMonth}
                        className="flex-1 flex flex-col items-center h-full justify-end group relative"
                      >
                        {/* Hover Tooltip */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block px-2 py-0.5 rounded bg-black text-white text-[9px] font-mono whitespace-nowrap z-20 shadow-md pointer-events-none">
                          {m.label.split(' de ')[0]}: {formatCurrency(balance)}
                        </div>
                        <div
                          className={`w-full rounded-t-sm transition-all duration-300 ${
                            m.isCurrent
                              ? 'bg-[#007AFF] ring-1 ring-white'
                              : isPos
                              ? 'bg-[#34C759]/60 hover:bg-[#34C759]'
                              : 'bg-[#FF3B30]/60 hover:bg-[#FF3B30]'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-[8px] text-[var(--text-secondary)] truncate w-full text-center mt-1">
                          {m.label.slice(0, 3)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Render Timeline according to layout preference */}

            {/* Layout 1: ACCORDION (Sanfonado - Ideal para iPhone) */}
            {timelineStyle === 'accordion' && (
              <div className="space-y-3">
                {futureMonths.map((summary) => (
                  <MonthCard
                    key={summary.yearMonth}
                    summary={summary}
                    onDeleteTransaction={handleDeleteTransaction}
                    onAddTransactionToMonth={(ym) => {
                      setInitialTxDate(`${ym}-01`);
                      setIsTxModalOpen(true);
                    }}
                    defaultExpanded={summary.isCurrent}
                  />
                ))}
              </div>
            )}

            {/* Layout 2: CARROSSEL HORIZONTAL */}
            {timelineStyle === 'carousel' && (
              <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none">
                {futureMonths.map((summary) => (
                  <div
                    key={summary.yearMonth}
                    className="w-[320px] sm:w-[360px] shrink-0 snap-start"
                  >
                    <MonthCard
                      summary={summary}
                      onDeleteTransaction={handleDeleteTransaction}
                      onAddTransactionToMonth={(ym) => {
                        setInitialTxDate(`${ym}-01`);
                        setIsTxModalOpen(true);
                      }}
                      defaultExpanded={true}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Layout 3: GRID MODULAR (Configurável 2 ou 3 colunas para iPad 10th gen & Desktop) */}
            {timelineStyle === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {futureMonths.map((summary) => (
                  <MonthCard
                    key={summary.yearMonth}
                    summary={summary}
                    onDeleteTransaction={handleDeleteTransaction}
                    onAddTransactionToMonth={(ym) => {
                      setInitialTxDate(`${ym}-01`);
                      setIsTxModalOpen(true);
                    }}
                    defaultExpanded={false}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleSaveTransaction}
        cards={creditCards}
        rates={rates}
        initialDate={initialTxDate}
      />

      <CardManagerModal
        isOpen={isCardModalOpen}
        onClose={() => {
          setIsCardModalOpen(false);
          setEditingCard(null);
        }}
        cards={creditCards}
        onSaveCard={handleSaveCard}
        onDeleteCard={handleDeleteCard}
        editingCard={editingCard}
      />

      <RecurringManagerModal
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
        rules={recurringRules}
        onToggleRule={handleToggleRule}
        onDeleteRule={handleDeleteRule}
        onOpenAddModal={() => {
          setInitialTxDate(undefined);
          setIsTxModalOpen(true);
        }}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataRestored={handleDataRestored}
      />
    </div>
  );
}
