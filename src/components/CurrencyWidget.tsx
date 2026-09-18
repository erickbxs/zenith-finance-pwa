import React, { useState } from 'react';
import { Coins, Sliders, ShieldCheck, Check, Calculator } from 'lucide-react';
import { ExchangeRates } from '../types';
import { saveRates, formatLastManualUpdate } from '../utils/currency';

interface CurrencyWidgetProps {
  rates: ExchangeRates;
  onRatesUpdated: (newRates: ExchangeRates) => void;
}

export const CurrencyWidget: React.FC<CurrencyWidgetProps> = ({ rates, onRatesUpdated }) => {
  const [showEdit, setShowEdit] = useState(false);
  const [usdInput, setUsdInput] = useState(rates.USDBRL.toString());
  
  // PYG can be entered either as rate (0.00072) or as "How many Guaranis per 1 BRL" (e.g., 1380)
  const initialGuaranisPerBrl = rates.PYGBRL > 0 ? Math.round(1 / rates.PYGBRL) : 1388;
  const [pygPerBrlInput, setPygPerBrlInput] = useState(initialGuaranisPerBrl.toString());
  const [pygDirectRateInput, setPygDirectRateInput] = useState(rates.PYGBRL.toString());
  const [pygMode, setPygMode] = useState<'perBRL' | 'direct'>('perBRL');
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    const usdBrl = parseFloat(usdInput.replace(',', '.')) || rates.USDBRL;
    
    let pygBrl = rates.PYGBRL;
    if (pygMode === 'perBRL') {
      const perBrl = parseFloat(pygPerBrlInput.replace(/\D/g, '')) || initialGuaranisPerBrl;
      if (perBrl > 0) {
        pygBrl = 1 / perBrl;
      }
    } else {
      pygBrl = parseFloat(pygDirectRateInput.replace(',', '.')) || rates.PYGBRL;
    }

    const newRates: ExchangeRates = {
      USDBRL: usdBrl,
      PYGBRL: pygBrl,
      lastUpdated: Date.now(),
      source: 'manual',
    };

    saveRates(newRates);
    onRatesUpdated(newRates);
    setShowEdit(false);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const formattedDate = formatLastManualUpdate(rates.lastUpdated);
  const currentGuaranisPerBRL = rates.PYGBRL > 0 ? Math.round(1 / rates.PYGBRL) : 1388;

  return (
    <div className="rounded-[20px] bg-[var(--card-bg)] p-4 sm:p-5 hairline-border apple-shadow">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#007AFF]/10 dark:bg-[#0A84FF]/20 flex items-center justify-center text-[#007AFF] dark:text-[#0A84FF] shrink-0">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                Câmbio Manual (Air-Gapped)
              </h4>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#34C759]/10 text-[#34C759] flex items-center gap-0.5">
                <ShieldCheck className="w-2.5 h-2.5" />
                100% Local
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)]">
              Último Ajuste Manual: <strong>{formattedDate}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowEdit(!showEdit)}
          className="ios-tap-active px-3 py-1.5 rounded-full text-xs font-semibold text-[#007AFF] dark:text-[#0A84FF] bg-black/5 dark:bg-white/5 hover:bg-black/10 transition flex items-center gap-1"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{showEdit ? 'Fechar' : 'Configurar'}</span>
        </button>
      </div>

      {savedFeedback && (
        <div className="mb-3 p-2 rounded-xl bg-[#34C759]/15 text-[#34C759] text-xs font-semibold flex items-center gap-1.5">
          <Check className="w-4 h-4" />
          <span>Taxas manuais salvas localmente no dispositivo com sucesso!</span>
        </div>
      )}

      {/* Static summary view */}
      {!showEdit ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {/* USD Card */}
          <div className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] hairline-border flex flex-col justify-between">
            <div className="flex items-center justify-between text-[var(--text-secondary)] text-[11px] mb-1">
              <span className="font-semibold text-[var(--text-primary)]">Dólar Americano (USD)</span>
              <span className="text-[10px] uppercase font-mono bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded">
                USD/BRL
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold text-[var(--text-primary)]">
                R$ {rates.USDBRL.toFixed(2)}
              </span>
              <span className="text-[10px] text-[var(--text-secondary)]">
                1 USD = R$ {rates.USDBRL.toFixed(2)}
              </span>
            </div>
          </div>

          {/* PYG Card */}
          <div className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] hairline-border flex flex-col justify-between">
            <div className="flex items-center justify-between text-[var(--text-secondary)] text-[11px] mb-1">
              <span className="font-semibold text-[var(--text-primary)]">Guarani Paraguaio (PYG)</span>
              <span className="text-[10px] uppercase font-mono bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded">
                PYG/BRL
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-[var(--text-primary)] truncate">
                1 BRL ≈ ₲ {currentGuaranisPerBRL.toLocaleString('es-PY')}
              </span>
              <span className="text-[10px] text-[var(--text-secondary)] shrink-0 ml-1">
                ₲ 1M ≈ R$ {(1000000 * rates.PYGBRL).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Manual Configuration Form */
        <form onSubmit={handleSaveManual} className="space-y-3 pt-2 border-t hairline-border text-xs">
          <div className="p-2.5 rounded-xl bg-[#007AFF]/10 text-[#007AFF] text-[11px] flex items-start gap-2">
            <Calculator className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Em conformidade com a arquitetura <strong>Air-Gapped</strong>, nenhuma consulta a APIs de câmbio é feita. Todas as conversões de lançamentos obedecem estritamente aos valores que você define aqui.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* USD Input */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[var(--text-primary)]">
                Valor de 1 USD em Reais (BRL):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-[var(--text-secondary)] text-xs font-bold">R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  value={usdInput}
                  onChange={(e) => setUsdInput(e.target.value)}
                  placeholder="5.50"
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[var(--bg-main)] text-sm font-bold text-[var(--text-primary)] border hairline-border focus:outline-hidden"
                />
              </div>
              <span className="text-[10px] text-[var(--text-secondary)] block">
                Exemplo: Se 1 dólar custar R$ 5,60, insira 5.60
              </span>
            </div>

            {/* PYG Input */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-[var(--text-primary)]">
                  Câmbio Guarani (PYG):
                </label>
                <button
                  type="button"
                  onClick={() => setPygMode(pygMode === 'perBRL' ? 'direct' : 'perBRL')}
                  className="text-[10px] text-[#007AFF] hover:underline"
                >
                  {pygMode === 'perBRL' ? 'Mudar p/ taxa unitária' : 'Mudar p/ Guaranis por R$ 1'}
                </button>
              </div>

              {pygMode === 'perBRL' ? (
                <div>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-[var(--text-secondary)] text-xs font-bold">₲</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={pygPerBrlInput}
                      onChange={(e) => setPygPerBrlInput(e.target.value)}
                      placeholder="1380"
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[var(--bg-main)] text-sm font-bold text-[var(--text-primary)] border hairline-border focus:outline-hidden"
                    />
                  </div>
                  <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5">
                    Quantos Guaranis equivalem a R$ 1,00 (ex: 1.380)
                  </span>
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    inputMode="decimal"
                    required
                    value={pygDirectRateInput}
                    onChange={(e) => setPygDirectRateInput(e.target.value)}
                    placeholder="0.00072"
                    className="w-full px-3 py-1.5 rounded-xl bg-[var(--bg-main)] text-sm font-bold text-[var(--text-primary)] border hairline-border focus:outline-hidden"
                  />
                  <span className="text-[10px] text-[var(--text-secondary)] block mt-0.5">
                    Multiplicador unitário (ex: 0.00072)
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setShowEdit(false)}
              className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/10 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-[#007AFF] dark:bg-[#0A84FF] text-white font-bold text-xs shadow-sm hover:opacity-90 transition ios-tap-active"
            >
              Gravar Ajuste Manual &amp; Atualizar Cálculos
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
