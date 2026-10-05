import React, { useState } from 'react';
import { StoreSettings, UiThemeId, ReceiptTemplateId, User } from '../../types/pos';
import {
  Settings,
  Save,
  CheckCircle2,
  Store,
  Printer,
  Palette,
  Sparkles,
  Coins,
  Check,
  Eye,
  Users,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { CurrencyIcon } from '../common/CurrencyIcon';
import { PRESET_CURRENCIES, CurrencyInfo } from '../../data/currencies';
import { formatCurrency } from '../../utils/currency';
import { UserManagementView } from './UserManagementView';

interface SettingsViewProps {
  settings: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => void;
  onOpenTemplateStudio?: () => void;
  currentUser?: User | null;
  isAdmin?: boolean;
  onUsersUpdated?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onOpenTemplateStudio,
  currentUser = null,
  isAdmin = true,
  onUsersUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'store' | 'users'>('store');
  const [form, setForm] = useState<StoreSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const { themeId, setThemeId, availableThemes } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleThemeChange = (newTheme: UiThemeId) => {
    setThemeId(newTheme);
    setForm({ ...form, uiTheme: newTheme });
  };

  return (
    <div className="flex-1 bg-slate-950 p-4 md:p-6 overflow-y-auto space-y-6 text-white font-sans">
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-400" />
            Pengaturan & Master Data
          </h1>
          <p className="text-xs text-slate-400">
            Kelola profil toko, tema, template struk, mata uang, dan akun pengguna (Master User)
          </p>
        </div>

        {activeTab === 'store' && onOpenTemplateStudio && (
          <button
            type="button"
            onClick={onOpenTemplateStudio}
            className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded text-xs font-mono font-bold flex items-center space-x-1.5 transition-colors shadow self-start"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>OPEN TEMPLATE STUDIO</span>
          </button>
        )}
      </div>

      {/* Settings Navigation Tabs (Master User visible for Admin only) */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('store')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === 'store'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-950'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Profil Toko & Printer</span>
        </button>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'users'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Master User (Pengguna)</span>
            <span className="bg-emerald-400/20 text-emerald-300 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">
              ADMIN
            </span>
          </button>
        )}
      </div>

      {activeTab === 'users' && isAdmin ? (
        <UserManagementView
          currentUser={currentUser}
          onUsersUpdated={onUsersUpdated}
        />
      ) : (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Template & Visual Themes Section */}
        <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 font-mono">
              <Palette className="w-4 h-4 text-blue-400" />
              UI THEME & TEMPLATE
            </h3>
            {onOpenTemplateStudio && (
              <button
                type="button"
                onClick={onOpenTemplateStudio}
                className="text-xs text-blue-400 hover:text-blue-300 font-mono font-semibold flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Browse Store Presets</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Active Design Theme</label>
              <select
                value={form.uiTheme || themeId}
                onChange={(e) => handleThemeChange(e.target.value as UiThemeId)}
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-blue-500"
              >
                {availableThemes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.isDark ? 'Dark' : 'Light'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Default Receipt Template</label>
              <select
                value={form.receiptTemplate || (form.paperWidth === '58mm' ? 'compact-58' : 'standard-80')}
                onChange={(e) => {
                  const val = e.target.value as ReceiptTemplateId;
                  setForm({
                    ...form,
                    receiptTemplate: val,
                    paperWidth: val === 'compact-58' ? '58mm' : '80mm',
                  });
                }}
                className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-blue-500"
              >
                <option value="standard-80">80mm Retail POS Slip (Standard)</option>
                <option value="compact-58">58mm Compact Eco Thermal</option>
                <option value="tax-invoice">Official Tax Invoice Slip</option>
                <option value="gift-slip">Gift Receipt (Prices Masked)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Store Info */}
        <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 font-mono">
            <Store className="w-4 h-4 text-blue-400" />
            STORE INFORMATION
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="text-slate-400 font-semibold block mb-1">Store Name *</label>
              <input
                type="text"
                required
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-400 font-semibold block mb-1">Store Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Phone Number</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Store Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* Currency & Financial Localization */}
        <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 font-mono">
                <Coins className="w-4 h-4 text-emerald-400" />
                STORE CURRENCY & LOCALIZATION
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Set active business currency, financial symbols, and KPI icon formatting
              </p>
            </div>

            {/* Current Active Indicator Pill */}
            <div className="inline-flex items-center gap-2 bg-slate-900 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-mono self-start sm:self-auto shadow-sm">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Active:</span>
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CurrencyIcon currency={form.currencySymbol} className="w-4 h-4" />
                <span>{form.currencySymbol}</span>
                {form.currencyCode && (
                  <span className="text-slate-400 font-normal text-[10px]">({form.currencyCode})</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-2">
            <label className="text-slate-300 font-semibold text-xs block">
              Quick Select Currency Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_CURRENCIES.slice(0, 8).map((cur) => {
                const isSelected =
                  form.currencySymbol === cur.symbol ||
                  (form.currencyCode && form.currencyCode === cur.code);
                return (
                  <button
                    key={cur.code}
                    type="button"
                    onClick={() => {
                      setForm({
                        ...form,
                        currencySymbol: cur.symbol,
                        currencyCode: cur.code,
                      });
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/40 text-white shadow-sm ring-1 ring-emerald-500/50'
                        : 'border-slate-800 bg-slate-900/80 hover:bg-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className="text-base select-none">{cur.flag}</span>
                      <div className="text-left truncate">
                        <div className="font-bold flex items-center gap-1">
                          <span className="text-emerald-400">{cur.symbol}</span>
                          <span className="text-[11px] text-slate-200">{cur.code}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[80px]">
                          {cur.country}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full Currency Selector Dropdown & Custom Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div className="sm:col-span-1">
              <label className="text-slate-400 font-semibold block mb-1">
                Select from All Currencies
              </label>
              <select
                value={
                  PRESET_CURRENCIES.find(
                    (c) =>
                      c.symbol === form.currencySymbol ||
                      (form.currencyCode && c.code === form.currencyCode)
                  )?.code || 'custom'
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'custom') return;
                  const found = PRESET_CURRENCIES.find((c) => c.code === val);
                  if (found) {
                    setForm({
                      ...form,
                      currencySymbol: found.symbol,
                      currencyCode: found.code,
                    });
                  }
                }}
                className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-emerald-500"
              >
                {PRESET_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} — {c.name} ({c.symbol})
                  </option>
                ))}
                <option value="custom">✏️ Custom Currency / Other</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">
                Currency Symbol
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 flex items-center justify-center text-emerald-400 pointer-events-none">
                  <CurrencyIcon currency={form.currencySymbol} className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={form.currencySymbol}
                  onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })}
                  placeholder="e.g. Rp, $, €, £"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white font-mono font-bold text-xs focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">
                Currency Code (ISO)
              </label>
              <input
                type="text"
                value={form.currencyCode || ''}
                onChange={(e) => setForm({ ...form, currencyCode: e.target.value.toUpperCase() })}
                placeholder="e.g. IDR, USD, EUR"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                LIVE PREVIEW: HOW AMOUNTS & REPORTS APPEAR
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">
                Updates dynamically on change
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Reports KPI Card Simulation */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1 shadow-inner">
                <div className="text-[10px] text-slate-400 font-semibold flex items-center justify-between">
                  <span>REPORTS & ANALYTICS: TOTAL REVENUE</span>
                  <CurrencyIcon
                    currency={form.currencySymbol}
                    className="w-4 h-4 text-emerald-400"
                  />
                </div>
                <div className="text-lg font-black text-emerald-400 font-mono">
                  {formatCurrency(1250000, form.currencySymbol)}
                </div>
                <span className="text-[9px] text-slate-500 block">
                  Gross sales before taxes • Dynamic {form.currencySymbol} Icon
                </span>
              </div>

              {/* POS Cart & Receipt Simulation */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1 shadow-inner font-mono text-xs">
                <div className="text-[10px] text-slate-400 font-semibold flex items-center justify-between">
                  <span>POS CHECKOUT & RECEIPT TOTAL</span>
                  <span className="text-slate-500 text-[10px] font-sans">80mm thermal</span>
                </div>
                <div className="flex justify-between items-center text-slate-300 text-[11px] pt-0.5">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(250000, form.currencySymbol)}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-slate-100 text-xs border-t border-slate-800 pt-1">
                  <span>TOTAL DUE:</span>
                  <span className="text-emerald-400">{formatCurrency(277500, form.currencySymbol)}</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-500">
              Note: Changing currency applies instantly across the app — updating the Total Revenue KPI card icon, POS checkout terminal prices, product catalogs, customer transaction histories, and printed thermal slips.
            </p>
          </div>
        </div>

        {/* Tax & Thermal Receipt Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Printer className="w-4 h-4 text-emerald-400" />
              Tax & Thermal Receipt Printing
            </h3>
            {onOpenTemplateStudio && (
              <button
                type="button"
                onClick={onOpenTemplateStudio}
                className="text-xs text-blue-400 hover:text-blue-300 font-mono flex items-center space-x-1"
              >
                <span>Full Studio & Live Preview →</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Default Tax Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={form.taxRate}
                onChange={(e) => setForm({ ...form, taxRate: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Thermal Paper Width</label>
              <select
                value={form.paperWidth}
                onChange={(e) => setForm({ ...form, paperWidth: e.target.value as any })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value="80mm">80mm Thermal Receipt (Standard POS)</option>
                <option value="58mm">58mm Thermal Receipt (Compact Mobile)</option>
              </select>
            </div>

            {/* H1 Receipt Title */}
            <div className="sm:col-span-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-semibold">
                  H1 — Receipt Title / Main Heading <span className="text-red-400">*</span>
                </label>
                <span className="text-[10px] text-blue-400 font-mono">Printed boldly on receipt top</span>
              </div>
              <input
                type="text"
                value={form.h1Title || ''}
                onChange={(e) => setForm({ ...form, h1Title: e.target.value })}
                placeholder={form.storeName || 'Receipt'}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            {/* H2 Store Address */}
            <div className="sm:col-span-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-semibold">
                  H2 — Store Address on Receipt (Optional)
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {(form.h2Address || '').length} / 150 chars
                </span>
              </div>
              <textarea
                rows={2}
                maxLength={150}
                value={form.h2Address !== undefined ? form.h2Address : form.address || ''}
                onChange={(e) => setForm({ ...form, h2Address: e.target.value })}
                placeholder="e.g. 124 Market Street, Floor 2, Central District"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Wraps automatically to thermal paper width without truncation. Omitted if left empty.
              </p>
            </div>

            {/* Footnote 1 */}
            <div className="sm:col-span-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-semibold">
                  Footnote 1 (Optional)
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {(form.footnote1 || '').length} / 100 chars
                </span>
              </div>
              <input
                type="text"
                maxLength={100}
                value={form.footnote1 || ''}
                onChange={(e) => setForm({ ...form, footnote1: e.target.value })}
                placeholder="e.g. Goods sold are not returnable without valid invoice slip."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            {/* Footnote 2 */}
            <div className="sm:col-span-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-semibold">
                  Footnote 2 (Optional)
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {(form.footnote2 || '').length} / 100 chars
                </span>
              </div>
              <input
                type="text"
                maxLength={100}
                value={form.footnote2 || ''}
                onChange={(e) => setForm({ ...form, footnote2: e.target.value })}
                placeholder="e.g. Customer Care: support@store.com / +1 (555) 019-2831"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-400 font-semibold block mb-1">Additional Header Note</label>
              <textarea
                rows={2}
                value={form.receiptHeader}
                onChange={(e) => setForm({ ...form, receiptHeader: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-400 font-semibold block mb-1">Receipt Closing/Footer Note</label>
              <textarea
                rows={2}
                value={form.receiptFooter}
                onChange={(e) => setForm({ ...form, receiptFooter: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-950 border border-emerald-500/40 text-emerald-300 p-3 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-emerald-950 transition"
        >
          <Save className="w-4 h-4" />
          <span>Save Store Settings</span>
        </button>
      </form>
      )}
    </div>
  );
};
