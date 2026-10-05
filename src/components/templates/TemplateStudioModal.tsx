import React, { useState } from 'react';
import {
  Palette,
  Store,
  Receipt,
  Check,
  Sparkles,
  Coffee,
  Shirt,
  ShoppingBag,
  Cpu,
  Printer,
  FileText,
  Gift,
  X,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import {
  UiThemeId,
  StoreTemplateId,
  ReceiptTemplateId,
  StoreSettings,
  Product,
  Category,
  Brand,
  canEditReceiptTemplate,
  canViewReceiptTemplate,
  ReceiptTemplate,
} from '../../types/pos';
import { STORE_TEMPLATES, StoreTemplatePreset } from '../../data/storeTemplates';
import { storage } from '../../services/storage';

interface TemplateStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => void;
  onLoadStoreTemplate: (preset: StoreTemplatePreset) => void;
}

export const TemplateStudioModal: React.FC<TemplateStudioModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onLoadStoreTemplate,
}) => {
  const { themeId, setThemeId, availableThemes } = useTheme();
  const [activeTab, setActiveTab] = useState<'ui' | 'store' | 'receipt'>('ui');
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptTemplateId>(
    settings.receiptTemplate || 'standard-80'
  );
  const [selectedStorePreset, setSelectedStorePreset] = useState<StoreTemplateId>(
    settings.storeTemplate || 'cafe-bakery'
  );
  const [confirmPreset, setConfirmPreset] = useState<StoreTemplatePreset | null>(null);

  // Active User & Permissions for Receipt Template
  const activeUser = storage.getActiveUser();
  const canEditReceipt = canEditReceiptTemplate(activeUser);

  // Receipt Template Custom Fields (H1, H2, Footnote 1, Footnote 2)
  const initialTemplate = storage.getReceiptTemplate();
  const [h1Title, setH1Title] = useState<string>(
    settings.h1Title || initialTemplate.h1Title || settings.storeName || 'Receipt'
  );
  const [h2Address, setH2Address] = useState<string>(
    settings.h2Address !== undefined
      ? settings.h2Address
      : initialTemplate.h2Address !== undefined
      ? initialTemplate.h2Address
      : settings.address || ''
  );
  const [footnote1, setFootnote1] = useState<string>(
    settings.footnote1 !== undefined
      ? settings.footnote1
      : initialTemplate.footnote1 || ''
  );
  const [footnote2, setFootnote2] = useState<string>(
    settings.footnote2 !== undefined
      ? settings.footnote2
      : initialTemplate.footnote2 || ''
  );
  const [previewPaperWidth, setPreviewPaperWidth] = useState<'80mm' | '58mm'>(
    settings.paperWidth || '80mm'
  );
  const [receiptSaveSuccess, setReceiptSaveSuccess] = useState<boolean>(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);

  const handleSaveReceiptContent = () => {
    if (!canEditReceipt) {
      setReceiptError('You do not have permission to edit the receipt template. Admin or Supervisor role required.');
      return;
    }
    if (!h1Title.trim()) {
      setReceiptError('Receipt Title (H1) is required.');
      return;
    }

    setReceiptError(null);
    const updatedTemplate: ReceiptTemplate = {
      id: initialTemplate.id || 'default_receipt_template',
      h1Title: h1Title.trim(),
      h2Address: h2Address.slice(0, 150),
      footnote1: footnote1.slice(0, 100),
      footnote2: footnote2.slice(0, 100),
      paperWidth: previewPaperWidth,
      createdAt: initialTemplate.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: activeUser?.id || 'usr_admin',
    };

    storage.saveReceiptTemplate(updatedTemplate);
    const updatedSettings = storage.getSettings();
    onSaveSettings(updatedSettings);

    setReceiptSaveSuccess(true);
    setTimeout(() => setReceiptSaveSuccess(false), 3000);
  };

  if (!isOpen) return null;

  const handleApplyTheme = (id: UiThemeId) => {
    setThemeId(id);
    onSaveSettings({
      ...settings,
      uiTheme: id,
    });
  };

  const handleApplyReceiptTemplate = (id: ReceiptTemplateId) => {
    setSelectedReceipt(id);
    onSaveSettings({
      ...settings,
      receiptTemplate: id,
      paperWidth: id === 'compact-58' ? '58mm' : '80mm',
    });
  };

  const handleApplyStorePreset = () => {
    if (!confirmPreset) return;
    onLoadStoreTemplate(confirmPreset);
    // Also auto switch theme if desired
    if (confirmPreset.recommendedTheme && confirmPreset.recommendedTheme !== themeId) {
      setThemeId(confirmPreset.recommendedTheme);
    }
    setConfirmPreset(null);
    onClose();
  };

  const getStoreIcon = (icon: string) => {
    switch (icon) {
      case 'Coffee':
        return <Coffee className="w-5 h-5 text-amber-500" />;
      case 'Shirt':
        return <Shirt className="w-5 h-5 text-blue-500" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5 text-emerald-500" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-indigo-500" />;
      default:
        return <Store className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 text-white shadow-2xl space-y-5 max-h-[92vh] flex flex-col font-sans">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shadow-inner">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-100 tracking-tight font-mono uppercase">
                  Template Studio
                </h2>
                <span className="bg-blue-900/50 text-blue-300 border border-blue-800 px-2 py-0.5 rounded text-[10px] font-mono font-semibold">
                  CUSTOMIZER
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Switch UI themes, load industry catalog presets, or customize thermal receipt layouts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-slate-800 pb-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('ui')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-colors ${
              activeTab === 'ui'
                ? 'bg-blue-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>UI DESIGN THEMES ({availableThemes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('store')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-colors ${
              activeTab === 'store'
                ? 'bg-blue-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>INDUSTRY STORE PRESETS (5)</span>
          </button>

          <button
            onClick={() => setActiveTab('receipt')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-colors ${
              activeTab === 'receipt'
                ? 'bg-blue-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>RECEIPT TEMPLATES (4)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* TAB 1: UI THEMES */}
          {activeTab === 'ui' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Select your preferred visual aesthetic. The theme applies across all POS modules instantly.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {availableThemes.map((t) => {
                  const isCurrent = themeId === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => handleApplyTheme(t.id)}
                      className={`relative p-4 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                        isCurrent
                          ? 'border-blue-500 bg-[#1E293B] shadow-lg shadow-blue-950/50'
                          : 'border-slate-800 bg-[#131B2E] hover:border-slate-700 hover:bg-[#1A233A]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-slate-100">{t.name}</span>
                            {isCurrent && (
                              <span className="bg-blue-600 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">
                            {t.isDark ? 'Dark Mode' : 'Light Mode'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 mb-3">{t.tagline}</p>

                        {/* Theme Palette Swatches Preview */}
                        <div className="flex items-center space-x-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 mb-3">
                          <div className="flex items-center space-x-1">
                            <div
                              className={`w-6 h-6 rounded border ${
                                t.isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-300'
                              }`}
                              title="Background"
                            />
                            <div
                              className={`w-6 h-6 rounded border ${
                                t.id === 'artisan-warm'
                                  ? 'bg-[#C2410C] border-orange-700'
                                  : t.id === 'emerald-retail'
                                  ? 'bg-emerald-600 border-emerald-700'
                                  : 'bg-blue-600 border-blue-700'
                              }`}
                              title="Accent"
                            />
                            <div
                              className={`w-6 h-6 rounded border ${
                                t.isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                              }`}
                              title="Card Surface"
                            />
                          </div>

                          <div className="text-[11px] font-mono text-slate-300 ml-2">
                            Accent: <span className="text-blue-400">{t.accentColorName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                        <span className="text-slate-400 font-mono text-[11px]">
                          {t.id === 'high-density'
                            ? 'Max Data Density • Monospace'
                            : t.id === 'modern-light'
                            ? 'High Contrast • Anti-Glare'
                            : t.id === 'artisan-warm'
                            ? 'Cozy Bistro • Specialty Cafe'
                            : 'Fintech Precision • Clean Dark'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyTheme(t.id);
                          }}
                          className={`px-3 py-1 rounded text-xs font-mono font-bold transition-colors ${
                            isCurrent
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {isCurrent ? 'SELECTED' : 'APPLY THEME'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: STORE INDUSTRY PRESETS */}
          {activeTab === 'store' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-950/30 border border-blue-800/60 rounded-xl text-xs text-blue-300 flex items-start space-x-2">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong>Store Industry Presets:</strong> Instantly load pre-configured categories, products with
                  units & wholesale pricing, and recommended store receipt headers tailored to your specific retail business!
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {Object.values(STORE_TEMPLATES).map((preset) => {
                  return (
                    <div
                      key={preset.id}
                      className="p-4 rounded-xl border border-slate-800 bg-[#131B2E] hover:border-slate-700 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                            {getStoreIcon(preset.iconName)}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-slate-100">{preset.name}</h3>
                            <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">
                              {preset.category}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 mb-3">{preset.description}</p>

                        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono space-y-1">
                          <div className="text-slate-300 font-semibold">Includes:</div>
                          <div className="text-slate-400">
                            • {preset.categories.length} Categories ({preset.categories.map((c) => c.name).slice(0, 2).join(', ')}...)
                          </div>
                          <div className="text-slate-400">
                            • {preset.products.length} Sample Products with SKU & Barcodes
                          </div>
                          <div className="text-slate-400">
                            • Recommended Theme:{' '}
                            <span className="text-emerald-400 uppercase font-bold">
                              {preset.recommendedTheme}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-500">
                          ID: {preset.id}
                        </span>
                        <button
                          onClick={() => setConfirmPreset(preset)}
                          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center space-x-1.5 transition-colors shadow"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>LOAD THIS STORE</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: RECEIPT DESIGN TEMPLATES */}
          {activeTab === 'receipt' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1">
                  1. Choose Print Layout Style
                </h3>
                <p className="text-xs text-slate-400">
                  Select the base template style used when printing thermal paper or exporting receipts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. 80mm Standard */}
                <div
                  onClick={() => handleApplyReceiptTemplate('standard-80')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedReceipt === 'standard-80'
                      ? 'border-blue-500 bg-[#1E293B] shadow-lg ring-1 ring-blue-500'
                      : 'border-slate-800 bg-[#131B2E] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Receipt className="w-5 h-5 text-blue-400" />
                      <span className="font-bold text-sm text-slate-100">80mm Retail Slip</span>
                    </div>
                    {selectedReceipt === 'standard-80' && (
                      <span className="bg-blue-600 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    Full-featured standard retail thermal paper with barcode, itemized price rows, cashier info, and return policy.
                  </p>
                </div>

                {/* 2. 58mm Compact */}
                <div
                  onClick={() => handleApplyReceiptTemplate('compact-58')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedReceipt === 'compact-58'
                      ? 'border-blue-500 bg-[#1E293B] shadow-lg ring-1 ring-blue-500'
                      : 'border-slate-800 bg-[#131B2E] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Printer className="w-5 h-5 text-emerald-400" />
                      <span className="font-bold text-sm text-slate-100">58mm Compact Eco</span>
                    </div>
                    {selectedReceipt === 'compact-58' && (
                      <span className="bg-blue-600 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    Condensed narrow slip engineered for portable Bluetooth thermal printers and paper conservation.
                  </p>
                </div>

                {/* 3. Official Tax Invoice */}
                <div
                  onClick={() => handleApplyReceiptTemplate('tax-invoice')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedReceipt === 'tax-invoice'
                      ? 'border-blue-500 bg-[#1E293B] shadow-lg ring-1 ring-blue-500'
                      : 'border-slate-800 bg-[#131B2E] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-amber-400" />
                      <span className="font-bold text-sm text-slate-100">Official Tax Invoice</span>
                    </div>
                    {selectedReceipt === 'tax-invoice' && (
                      <span className="bg-blue-600 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    Formal tax invoice with VAT registration numbers, tabular line items, and signature lines.
                  </p>
                </div>

                {/* 4. Gift Slip */}
                <div
                  onClick={() => handleApplyReceiptTemplate('gift-slip')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedReceipt === 'gift-slip'
                      ? 'border-blue-500 bg-[#1E293B] shadow-lg ring-1 ring-blue-500'
                      : 'border-slate-800 bg-[#131B2E] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Gift className="w-5 h-5 text-purple-400" />
                      <span className="font-bold text-sm text-slate-100">Gift Receipt Slip</span>
                    </div>
                    {selectedReceipt === 'gift-slip' && (
                      <span className="bg-blue-600 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    Gift slip format with item prices masked. Includes barcode and exchange policy for the recipient.
                  </p>
                </div>
              </div>

              {/* SECTION 2: RECEIPT CONTENT CUSTOMIZATION (H1, H2, FOOTNOTE 1, FOOTNOTE 2) */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      2. Custom Receipt Information & Headings
                    </h3>
                    <p className="text-xs text-slate-400">
                      Configure custom H1 heading, H2 address (up to 150 chars), and two bottom footnotes (up to 100 chars).
                    </p>
                  </div>

                  {/* Paper Width Toggle for Live Preview */}
                  <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono self-start sm:self-auto">
                    <span className="text-slate-400 px-1">Width:</span>
                    <button
                      type="button"
                      onClick={() => setPreviewPaperWidth('80mm')}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        previewPaperWidth === '80mm'
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      80mm
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewPaperWidth('58mm')}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        previewPaperWidth === '58mm'
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      58mm Eco
                    </button>
                  </div>
                </div>

                {!canEditReceipt && (
                  <div className="p-3 mb-4 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-300">
                    <strong>Note:</strong> You are currently signed in as a Cashier. Receipt template editing requires Admin or Supervisor permissions. Viewing current template configuration below.
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left Form: Fields with Character Counters */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* H1 Title Field */}
                    <div className="bg-[#131B2E] border border-slate-800 rounded-xl p-4 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-mono font-semibold text-slate-200">
                          H1 — Receipt Title / Main Heading <span className="text-red-400">*</span>
                        </label>
                        <span className="text-[10px] font-mono text-blue-400">Required</span>
                      </div>
                      <input
                        type="text"
                        disabled={!canEditReceipt}
                        value={h1Title}
                        onChange={(e) => setH1Title(e.target.value)}
                        placeholder="e.g. Acme Coffee & Retail Store"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-blue-500 disabled:opacity-60"
                      />
                      <p className="text-[10px] text-slate-400">
                        Primary header displayed boldly at the top of every printed slip.
                      </p>
                    </div>

                    {/* H2 Address Field (Max 150 chars) */}
                    <div className="bg-[#131B2E] border border-slate-800 rounded-xl p-4 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-mono font-semibold text-slate-200">
                          H2 — Store Address (Optional)
                        </label>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            h2Address.length > 150
                              ? 'bg-red-950 text-red-400 border border-red-800 font-bold'
                              : 'text-slate-400'
                          }`}
                        >
                          {h2Address.length} / 150 chars
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        maxLength={150}
                        disabled={!canEditReceipt}
                        value={h2Address}
                        onChange={(e) => setH2Address(e.target.value)}
                        placeholder="e.g. 124 Market Street, Floor 2, Central District, Cityville"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-blue-500 disabled:opacity-60"
                      />
                      <p className="text-[10px] text-slate-400">
                        Wraps automatically to paper width. If left empty, no address line or empty space is printed.
                      </p>
                    </div>

                    {/* Footnote 1 Field (Max 100 chars) */}
                    <div className="bg-[#131B2E] border border-slate-800 rounded-xl p-4 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-mono font-semibold text-slate-200">
                          Footnote 1 (Optional)
                        </label>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            footnote1.length > 100
                              ? 'bg-red-950 text-red-400 border border-red-800 font-bold'
                              : 'text-slate-400'
                          }`}
                        >
                          {footnote1.length} / 100 chars
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={100}
                        disabled={!canEditReceipt}
                        value={footnote1}
                        onChange={(e) => setFootnote1(e.target.value)}
                        placeholder="e.g. Goods sold are returnable within 7 days with valid receipt."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-blue-500 disabled:opacity-60"
                      />
                      <p className="text-[10px] text-slate-400">
                        Displays near the bottom of receipt. If left empty, omitted cleanly without blank space.
                      </p>
                    </div>

                    {/* Footnote 2 Field (Max 100 chars) */}
                    <div className="bg-[#131B2E] border border-slate-800 rounded-xl p-4 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-mono font-semibold text-slate-200">
                          Footnote 2 (Optional)
                        </label>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            footnote2.length > 100
                              ? 'bg-red-950 text-red-400 border border-red-800 font-bold'
                              : 'text-slate-400'
                          }`}
                        >
                          {footnote2.length} / 100 chars
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={100}
                        disabled={!canEditReceipt}
                        value={footnote2}
                        onChange={(e) => setFootnote2(e.target.value)}
                        placeholder="e.g. Free Wi-Fi: CoffeeGuest • Password: poslattecoffee"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-blue-500 disabled:opacity-60"
                      />
                      <p className="text-[10px] text-slate-400">
                        Displays directly beneath Footnote 1. If left empty, omitted cleanly without blank space.
                      </p>
                    </div>

                    {/* Error & Feedback Messages */}
                    {receiptError && (
                      <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-xl text-xs font-mono flex items-center space-x-2">
                        <X className="w-4 h-4 shrink-0 text-red-400" />
                        <span>{receiptError}</span>
                      </div>
                    )}

                    {receiptSaveSuccess && (
                      <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-mono flex items-center space-x-2">
                        <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span>Receipt template and store custom fields updated successfully!</span>
                      </div>
                    )}

                    {canEditReceipt && (
                      <div className="flex items-center space-x-3 pt-1">
                        <button
                          type="button"
                          onClick={handleSaveReceiptContent}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-colors flex items-center space-x-2"
                        >
                          <Check className="w-4 h-4" />
                          <span>SAVE RECEIPT TEMPLATE</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setH1Title(settings.storeName || 'Receipt');
                            setH2Address(settings.address || '');
                            setFootnote1('Goods sold are returnable within 7 days with valid receipt.');
                            setFootnote2('Customer care: support@retailpos.com / (555) 019-2831');
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs px-3.5 py-2.5 rounded-xl transition-colors"
                        >
                          Reset to Defaults
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right: Live Thermal Paper Simulation */}
                  <div className="lg:col-span-5 flex flex-col items-center">
                    <div className="w-full text-center text-[11px] font-mono text-slate-400 mb-2 flex items-center justify-between px-1">
                      <span>LIVE THERMAL PREVIEW</span>
                      <span className="text-blue-400 font-semibold">{previewPaperWidth} SIMULATION</span>
                    </div>

                    <div
                      className={`w-full bg-white text-black p-4 rounded-xl shadow-2xl font-mono text-xs border-2 border-slate-600 overflow-hidden transition-all ${
                        previewPaperWidth === '58mm' ? 'max-w-[220px]' : 'max-w-[300px]'
                      }`}
                      style={{
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                      }}
                    >
                      {/* Top Header: H1 & H2 */}
                      <div className="text-center">
                        <div className="font-bold text-xs uppercase leading-tight tracking-tight break-words">
                          {h1Title.trim() || 'RECEIPT TITLE'}
                        </div>
                        {h2Address.trim() && (
                          <div className="text-[10px] text-gray-700 mt-1 break-words whitespace-pre-wrap leading-tight">
                            {h2Address.trim()}
                          </div>
                        )}
                        {settings.phone && (
                          <div className="text-[9.5px] text-gray-600 mt-0.5">Tel: {settings.phone}</div>
                        )}
                      </div>

                      <div className="border-b border-dashed border-gray-400 my-2" />

                      {/* Mock Meta Info */}
                      <div className="flex justify-between text-[10px] text-gray-700">
                        <span>Receipt #:</span>
                        <span className="font-bold">#ORD-90218</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-700">
                        <span>Date:</span>
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-700">
                        <span>Cashier:</span>
                        <span>{activeUser?.fullName || 'Manager'}</span>
                      </div>

                      <div className="border-b border-dashed border-gray-400 my-2" />

                      {/* Sample Items to demonstrate width wrapping */}
                      <div className="space-y-1.5 text-[10px]">
                        <div className="flex justify-between">
                          <span className="font-semibold break-words flex-1 pr-1">Organic Colombian Coffee</span>
                          <span className="shrink-0">{settings.currencySymbol}4.50</span>
                        </div>
                        <div className="text-[9px] text-gray-600">1 pcs @ {settings.currencySymbol}4.50</div>

                        <div className="flex justify-between">
                          <span className="font-semibold break-words flex-1 pr-1">Artisan Butter Croissant</span>
                          <span className="shrink-0">{settings.currencySymbol}3.75</span>
                        </div>
                        <div className="text-[9px] text-gray-600">1 pcs @ {settings.currencySymbol}3.75</div>
                      </div>

                      <div className="border-b border-dashed border-gray-400 my-2" />

                      {/* Totals */}
                      <div className="flex justify-between text-[10px]">
                        <span>Subtotal:</span>
                        <span>{settings.currencySymbol}8.25</span>
                      </div>
                      <div className="flex justify-between font-bold text-xs border-t border-gray-300 pt-1 my-1">
                        <span>TOTAL:</span>
                        <span>{settings.currencySymbol}8.25</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span>Cash Tendered:</span>
                        <span>{settings.currencySymbol}10.00</span>
                      </div>
                      <div className="flex justify-between font-bold text-[10px]">
                        <span>Change Due:</span>
                        <span>{settings.currencySymbol}1.75</span>
                      </div>

                      <div className="border-b border-dashed border-gray-400 my-2" />

                      {/* Mock Barcode */}
                      <div className="text-center font-mono font-bold tracking-widest my-1 text-[11px]">
                        ||| |||| || ||||| |||
                      </div>
                      <div className="text-center text-[9px] text-gray-600">ORD-90218</div>

                      {/* Receipt Footer note */}
                      {settings.receiptFooter && (
                        <div className="text-center text-[9px] text-gray-600 mt-1 break-words">
                          {settings.receiptFooter}
                        </div>
                      )}

                      {/* Footnote 1 (Only rendered if filled) */}
                      {footnote1.trim() && (
                        <div className="text-center text-[9px] text-slate-800 font-medium break-words leading-tight mt-1.5 pt-1 border-t border-dotted border-gray-300">
                          {footnote1.trim()}
                        </div>
                      )}

                      {/* Footnote 2 (Only rendered if filled) */}
                      {footnote2.trim() && (
                        <div className="text-center text-[9px] text-slate-800 font-medium break-words leading-tight mt-1">
                          {footnote2.trim()}
                        </div>
                      )}

                      <div className="text-center text-[8px] text-gray-400 mt-2">
                        *** OFFLINE POS SYSTEM • CERTIFIED ***
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Confirm Dialog if loading store preset */}
        {confirmPreset ? (
          <div className="p-4 bg-amber-950/70 border border-amber-800 rounded-xl space-y-3">
            <div className="text-xs text-amber-200">
              <strong>Confirm Store Preset Load:</strong> Loading{' '}
              <span className="font-bold text-white">"{confirmPreset.name}"</span> will populate sample categories and products tailored to this business. Would you like to proceed?
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleApplyStorePreset}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded text-xs font-mono font-bold transition-colors"
              >
                YES, LOAD THIS PRESET
              </button>
              <button
                onClick={() => setConfirmPreset(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-1.5 rounded text-xs font-mono transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs font-mono">
            <div className="text-slate-400 flex items-center space-x-2">
              <span>ACTIVE THEME:</span>
              <span className="text-blue-400 font-bold uppercase">{availableThemes.find((t) => t.id === themeId)?.name}</span>
            </div>
            <button
              onClick={onClose}
              className="bg-[#1E293B] hover:bg-slate-800 text-slate-200 border border-slate-800 px-4 py-1.5 rounded text-xs font-mono font-semibold transition-colors"
            >
              DONE / CLOSE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
