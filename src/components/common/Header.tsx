import React from 'react';
import {
  Store,
  User as UserIcon,
  WifiOff,
  Clock,
  LogOut,
  ShieldAlert,
  Coins,
  Palette,
} from 'lucide-react';
import { User, Shift, StoreSettings } from '../../types/pos';
import { useTheme } from '../../context/ThemeContext';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeUser: User | null;
  activeShift: Shift | null;
  storeName: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenLoginModal: () => void;
  onNavigateToShifts: () => void;
  onOpenTemplateStudio: () => void;
  onRequestLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeUser,
  activeShift,
  storeName,
  isSidebarOpen,
  onToggleSidebar,
  onOpenLoginModal,
  onNavigateToShifts,
  onOpenTemplateStudio,
  onRequestLogout,
}) => {
  const { theme } = useTheme();

  return (
    <header id="pos-app-header" className="h-14 bg-[#0F172A] border-b border-slate-800 flex items-center justify-between px-4 select-none shrink-0 z-30">
      {/* Brand & Toggle */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
          title="Toggle Navigation Menu"
        >
          <div className="w-4 h-4 flex flex-col justify-between py-0.5">
            <span className="w-full h-0.5 bg-current rounded-full" />
            <span className="w-full h-0.5 bg-current rounded-full" />
            <span className="w-full h-0.5 bg-current rounded-full" />
          </div>
        </button>

        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center font-bold text-white text-xs shadow-sm">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-100 text-xs tracking-tight uppercase font-mono">{storeName}</span>
              <span className="bg-blue-900/40 text-blue-400 border border-blue-800/60 text-[10px] font-mono px-1.5 py-0.2 rounded uppercase">
                v2.4
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">CORE POS & INVENTORY</p>
          </div>
        </div>
      </div>

      {/* Middle: Active Shift & System Monitor */}
      <div className="hidden md:flex items-center space-x-3 text-xs font-mono">
        <button
          onClick={onNavigateToShifts}
          className={`flex items-center space-x-2 px-3 py-1 rounded border transition-colors ${
            activeShift
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400 hover:bg-emerald-900/60'
              : 'bg-amber-950/40 border-amber-800/60 text-amber-400 hover:bg-amber-900/60'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span className="text-[11px]">
            {activeShift
              ? `SHIFT #${activeShift.shiftNumber.slice(-6)} | DRAWER ACTIVE`
              : 'NO ACTIVE SHIFT'}
          </span>
        </button>

        <div className="flex items-center space-x-2 px-2.5 py-1 rounded bg-[#1E293B] border border-slate-800 text-slate-400 text-[11px]">
          <WifiOff className="w-3 h-3 text-emerald-400" />
          <span className="text-slate-300">OFFLINE SYNC: READY</span>
        </div>
      </div>

      {/* Right: Template Switcher & Active Cashier Profile */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenTemplateStudio}
          className="flex items-center space-x-1.5 bg-[#1E293B] hover:bg-slate-800 px-2.5 py-1.5 rounded border border-slate-800 text-slate-200 transition-colors text-xs font-mono"
          title="Change UI Theme & Store Templates"
        >
          <Palette className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline font-bold">TEMPLATE</span>
          <span className="w-2 h-2 rounded-full bg-blue-500 ml-0.5" />
        </button>

        {/* PWA / APK Download & Install Button */}
        <PWAInstallButton variant="header" />

        {/* User Profile Badge (Click to fast switch PIN) */}
        <button
          onClick={onOpenLoginModal}
          className="flex items-center space-x-2 bg-[#1E293B] hover:bg-slate-800 px-2.5 py-1 rounded border border-slate-800 text-slate-200 transition-colors"
          title="Switch Cashier / PIN Login"
        >
          {activeUser?.avatarUrl ? (
            <img
              src={activeUser.avatarUrl}
              alt={activeUser.fullName}
              className="w-5 h-5 rounded-full object-cover border border-slate-700"
            />
          ) : (
            <div className="w-5 h-5 rounded bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold text-[10px]">
              {activeUser?.fullName ? activeUser.fullName.charAt(0) : <UserIcon className="w-3 h-3" />}
            </div>
          )}
          <div className="text-left hidden sm:block">
            <div className="text-[11px] font-semibold text-slate-200 leading-tight">
              {activeUser?.fullName || 'Guest Cashier'}
            </div>
            <div className="text-[9px] text-slate-400 uppercase font-mono tracking-wider">
              {activeUser?.role || 'operator'}
            </div>
          </div>
        </button>

        {/* Dedicated Logout Button */}
        {onRequestLogout && (
          <button
            type="button"
            onClick={onRequestLogout}
            className="flex items-center space-x-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 hover:text-white border border-rose-800/60 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm"
            title="Keluar / Logout Akun"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        )}
      </div>
    </header>
  );
};
