import React from 'react';
import { Sun, Moon, Database, Repeat, Plus } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenNewTransaction: () => void;
  onOpenBackup: () => void;
  onOpenRecurring: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  onOpenNewTransaction,
  onOpenBackup,
  onOpenRecurring,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full apple-glass hairline-b pt-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* App Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[11px] overflow-hidden shadow-md flex items-center justify-center bg-[#0B132B] border border-white/15 shrink-0">
            <img src="/icon.svg" alt="Zenit Finance Logo" className="w-full h-full object-cover" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-primary)]">
                Zenit
              </h1>
              <span className="text-[11px] font-semibold text-[#007AFF] dark:text-[#0A84FF]">
                Finance
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#007AFF]/10 text-[#007AFF]">
                HIG iOS
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-[var(--text-secondary)] hidden xs:block">
              Previsão de Longo Prazo &amp; Cartões
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Fixed Recurring Rules Button */}
          <button
            onClick={onOpenRecurring}
            className="ios-tap-active p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10 transition"
            title="Gerenciar Gastos Fixos Recorrentes"
          >
            <Repeat className="w-4 h-4" />
          </button>

          {/* Backup / Export Local Data */}
          <button
            onClick={onOpenBackup}
            className="ios-tap-active p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10 transition"
            title="Backup Local &amp; Privacidade"
          >
            <Database className="w-4 h-4" />
          </button>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="ios-tap-active p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10 transition"
            title={theme === 'dark' ? 'Ativar Modo Claro (#F2F2F7)' : 'Ativar Modo Escuro Azul Noturno (#0B132B)'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#FF9500]" />
            ) : (
              <Moon className="w-4 h-4 text-[#007AFF]" />
            )}
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onOpenNewTransaction}
            className="ios-tap-active ml-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-[12px] bg-[#007AFF] dark:bg-[#0A84FF] text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm hover:opacity-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nova Transação</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
