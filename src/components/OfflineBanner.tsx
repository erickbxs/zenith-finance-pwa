import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-[#FF9500] dark:bg-[#FF9F0A] text-white px-4 py-2 text-xs font-medium flex items-center justify-center gap-2 shadow-sm transition-all duration-300">
      <WifiOff className="w-4 h-4" />
      <span>Modo Offline Ativo — Utilizando cache local seguro. Os dados permanecem sincronizados no seu dispositivo.</span>
    </div>
  );
};
