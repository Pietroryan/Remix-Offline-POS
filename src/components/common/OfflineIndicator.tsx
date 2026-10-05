import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff, Database } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  // If online, don't show the warning banner
  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center space-x-2 bg-slate-900/95 border border-amber-500/50 shadow-2xl px-3 py-2 rounded-xl text-xs text-amber-200 backdrop-blur-md animate-bounce-subtle select-none">
      <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
      <span className="font-semibold text-[11px]">Mode Offline Aktif</span>
      <span className="text-slate-400 text-[10px] hidden sm:inline">• Semua transaksi tersimpan di memori perangkat</span>
    </div>
  );
};
