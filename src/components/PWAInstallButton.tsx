import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Detect standalone display mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforePrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  // If running in standalone PWA, hide button
  if (isInstalled) return null;

  return (
    <>
      {deferredPrompt ? (
        <button
          id="btn-install-pwa"
          onClick={handleInstall}
          className="ios-tap-active flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-[#007AFF] dark:bg-[#0A84FF] shadow-sm hover:opacity-90"
          title="Instalar App no Dispositivo"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Instalar App</span>
        </button>
      ) : isIOS ? (
        <button
          id="btn-install-ios"
          onClick={() => setShowIOSGuide(true)}
          className="ios-tap-active flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border hairline-border text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
          title="Instalar no iPhone ou iPad"
        >
          <Share className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#0A84FF]" />
          <span>Adicionar à Tela</span>
        </button>
      ) : (
        <button
          id="btn-install-info"
          onClick={() => setShowIOSGuide(true)}
          className="ios-tap-active flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border hairline-border text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
          title="Instalar Progressive Web App"
        >
          <Download className="w-3.5 h-3.5 text-[#007AFF]" />
          <span className="hidden sm:inline">PWA</span>
        </button>
      )}

      {/* iOS Installation Instructions Bottom Sheet / Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-[24px] bg-[var(--modal-bg)] p-6 shadow-2xl hairline-border text-[var(--text-primary)] relative">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)]"
              aria-label="Fechar guia"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#0B132B] p-2 flex items-center justify-center shadow-md">
                <img src="/icon.svg" alt="Zenit Finance" className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-semibold">Instalar Zenit Finance</h3>
                <p className="text-xs text-[var(--text-secondary)]">Apple HIG Progressive Web App</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-[var(--text-secondary)] my-4">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5">
                <Share className="w-5 h-5 text-[#007AFF] shrink-0 mt-0.5" />
                <p>
                  1. No Safari do seu iPhone ou iPad, toque no botão <strong>Compartilhar</strong> na barra inferior.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5">
                <PlusSquare className="w-5 h-5 text-[#34C759] shrink-0 mt-0.5" />
                <p>
                  2. Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl font-medium bg-[#007AFF] dark:bg-[#0A84FF] text-white text-sm ios-tap-active"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
};
