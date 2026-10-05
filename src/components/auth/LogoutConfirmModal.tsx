import React from 'react';
import { User, Shift } from '../../types/pos';
import { LogOut, AlertTriangle, ShieldCheck, X } from 'lucide-react';

interface LogoutConfirmModalProps {
  user: User | null;
  activeShift: Shift | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  user,
  activeShift,
  isOpen,
  onClose,
  onConfirmLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 selection:bg-rose-500 selection:text-white font-sans animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-5 text-white shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 transition"
          title="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon Ring */}
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
          <LogOut className="w-7 h-7" />
        </div>

        {/* Content */}
        <div className="text-center space-y-2">
          <h3 className="text-base font-bold text-white">Konfirmasi Logout</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Apakah Anda yakin ingin logout dari akun{' '}
            <strong className="text-white font-semibold">
              {user?.nama_lengkap || user?.fullName || user?.username || 'Pengguna'}
            </strong>{' '}
            (<span className="font-mono text-emerald-400 text-[11px]">{user?.username}</span>)?
          </p>
        </div>

        {/* Informative shift state notice if shift is active */}
        {activeShift && (
          <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 flex items-start space-x-2 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-tight">
              <span className="font-bold text-amber-300 block mb-0.5">Shift Kasir Masih Aktif</span>
              Laci kasir saat ini masih terbuka (Shift #{activeShift.shiftNumber.slice(-6)}). Anda dapat login kembali nanti untuk menutup shift atau melanjutkan transaksi.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer border border-slate-700/60"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirmLogout}
            className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-rose-950/60 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Ya, Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};
