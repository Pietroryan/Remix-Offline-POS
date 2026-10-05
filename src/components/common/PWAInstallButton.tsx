import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Smartphone } from 'lucide-react';
import { AppDownloadModal } from './AppDownloadModal';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'sidebar' | 'login' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { isInstallable, isInstalled } = usePWAInstall();
  const [showModal, setShowModal] = useState<boolean>(false);

  // If running in standalone mode, we can still show a helpful modal or compact indicator
  if (variant === 'header') {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className={`flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600/30 to-blue-600/30 hover:from-emerald-600/50 hover:to-blue-600/50 border border-emerald-500/40 text-emerald-300 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm ${className}`}
          title="Download App / Buat APK Android & iOS"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="hidden md:inline font-mono font-bold">APK / APP</span>
          <Download className="w-3 h-3 text-emerald-400" />
        </button>

        <AppDownloadModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  if (variant === 'sidebar') {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className={`w-full flex items-center px-3 py-2 text-xs rounded-xl text-emerald-300 hover:text-white bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-900/50 hover:border-emerald-700/60 transition cursor-pointer font-semibold shadow-sm ${className}`}
          title="Download App / Buat APK & iOS"
        >
          <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="ml-2.5 truncate">Download APK / iOS</span>
        </button>

        <AppDownloadModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  if (variant === 'login') {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className={`flex items-center space-x-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Pasang di HP / Tablet (APK / iOS)</span>
        </button>

        <AppDownloadModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={`flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow ${className}`}
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>

      <AppDownloadModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};
