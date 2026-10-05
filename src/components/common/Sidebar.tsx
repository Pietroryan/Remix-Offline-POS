import React from 'react';
import {
  ShoppingCart,
  ReceiptText,
  Package,
  Boxes,
  Truck,
  Users,
  Coins,
  BarChart3,
  Settings,
  ShieldCheck,
  FileText,
  LogOut,
} from 'lucide-react';
import { UserRole } from '../../types/pos';
import { PWAInstallButton } from './PWAInstallButton';

export type TabType =
  | 'pos'
  | 'sales'
  | 'products'
  | 'inventory'
  | 'purchases'
  | 'contacts'
  | 'shifts'
  | 'reports'
  | 'settings'
  | 'audit';

interface SidebarProps {
  currentView: string;
  isOpen: boolean;
  isAdmin?: boolean;
  onRequestLogout?: () => void;
  onSelectView: (view: any) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  isOpen,
  isAdmin = true,
  onRequestLogout,
  onSelectView,
}) => {
  const allNavItems = [
    { id: 'pos', label: 'POS Terminal', icon: ShoppingCart },
    { id: 'sales', label: 'Sales History', icon: ReceiptText },
    { id: 'products', label: 'Product Catalog', icon: Package },
    { id: 'inventory', label: 'Inventory & Stock', icon: Boxes },
    { id: 'purchases', label: 'Purchase Orders', icon: Truck },
    { id: 'contacts', label: 'Contacts & CRM', icon: Users },
    { id: 'shifts', label: 'Shift Drawer', icon: Coins },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Store Settings', icon: Settings },
    { id: 'backup', label: 'Database Backup', icon: ShieldCheck, adminOnly: true },
    { id: 'audit', label: 'Audit Trail', icon: FileText, adminOnly: true },
  ];

  const navItems = allNavItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside
      id="pos-app-sidebar"
      className={`${
        isOpen ? 'w-56' : 'w-16'
      } bg-[#1E293B] border-r border-slate-800 flex flex-col justify-between transition-all duration-200 shrink-0 z-20 select-none`}
    >
      <div className="py-3 flex-1 overflow-y-auto">
        {isOpen && (
          <div className="px-4 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
            Navigation
          </div>
        )}
        <nav className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center ${
                  isOpen ? 'px-3 py-2 justify-start' : 'p-2.5 justify-center'
                } text-xs transition-colors rounded ${
                  isActive
                    ? 'bg-slate-800/90 text-blue-400 font-semibold border-r-2 border-blue-500 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
                title={item.label}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                {isOpen && <span className="ml-3 truncate text-xs">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* High-density status footer */}
      {isOpen && (
        <div className="p-3 border-t border-slate-800">
          <div className="bg-[#0F172A]/70 rounded p-2.5 text-[10px] font-mono border border-slate-800">
            <div className="flex justify-between items-center text-slate-400 mb-1">
              <span>DB STORAGE</span>
              <span className="text-emerald-400 font-bold">ONLINE</span>
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="w-[100%] h-full bg-blue-500"></div>
            </div>
            <div className="mt-1.5 text-[9px] text-slate-500 text-center uppercase tracking-tight">
              LOCAL PERSISTENCE ACTIVE
            </div>
          </div>
        </div>
      )}

      {/* PWA / APK Mobile Install Action */}
      <div className="p-2 border-t border-slate-800">
        <PWAInstallButton variant="sidebar" />
      </div>

      {/* Sidebar Logout Action */}
      {onRequestLogout && (
        <div className="p-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onRequestLogout}
            className={`w-full flex items-center ${
              isOpen ? 'px-3 py-2 justify-start' : 'p-2 justify-center'
            } rounded-xl text-xs text-rose-300 hover:text-white bg-rose-950/30 hover:bg-rose-900/60 border border-rose-900/40 hover:border-rose-700/60 transition cursor-pointer font-semibold shadow-sm`}
            title="Keluar / Logout Akun"
          >
            <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
            {isOpen && <span className="ml-2.5">Logout</span>}
          </button>
        </div>
      )}
    </aside>
  );
};
