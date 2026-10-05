import React, { useState } from 'react';
import { Product } from '../../types/pos';
import { ScanBarcode, Search, Check, AlertCircle, X } from 'lucide-react';

interface BarcodeScannerModalProps {
  products: Product[];
  onScanProduct: (product: Product, barcodeMatchedUnit?: string) => void;
  onClose: () => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  products,
  onScanProduct,
  onClose,
}) => {
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const handleLookup = (code: string) => {
    if (!code.trim()) return;

    // Match by main product barcode, SKU, code, or unit conversion barcode
    for (const p of products) {
      if (!p.active) continue;

      if (p.barcode === code || p.sku === code || p.code === code) {
        onScanProduct(p);
        setFeedback({ type: 'success', message: `Added "${p.name}" to cart!` });
        setBarcodeInput('');
        return;
      }

      // Check unit conversions
      for (const u of p.unitConversions) {
        if (u.barcode && u.barcode === code) {
          onScanProduct(p, u.unitName);
          setFeedback({ type: 'success', message: `Added "${p.name}" (${u.unitName}) to cart!` });
          setBarcodeInput('');
          return;
        }
      }
    }

    setFeedback({ type: 'error', message: `No active product found for barcode "${code}"` });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ScanBarcode className="w-6 h-6 text-emerald-400" />
            <h2 className="text-base font-bold">Barcode / SKU Scanner</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Animated Scanner Visual */}
        <div className="bg-slate-950 rounded-xl p-6 border border-slate-800 text-center relative overflow-hidden">
          <div className="absolute inset-x-0 top-1/2 h-0.5 bg-rose-500/80 animate-pulse shadow-lg shadow-rose-500" />
          <ScanBarcode className="w-20 h-20 text-slate-700 mx-auto opacity-40 mb-2" />
          <p className="text-xs text-slate-400">
            Scanning active... Point hardware scanner or type barcode below
          </p>
        </div>

        {/* Manual Barcode Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookup(barcodeInput);
          }}
          className="space-y-3"
        >
          <div className="relative">
            <input
              type="text"
              autoFocus
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Enter or scan barcode e.g. 8991001001..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
            >
              Scan
            </button>
          </div>
        </form>

        {feedback && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <Check className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Quick Sample Barcode Chips */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800">
          <p className="text-[11px] text-slate-400">Quick Test Barcodes:</p>
          <div className="flex flex-wrap gap-1.5">
            {products.slice(0, 4).map((p) => (
              <button
                key={p.id}
                onClick={() => handleLookup(p.barcode)}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-700"
              >
                {p.barcode} ({p.name.slice(0, 12)}...)
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
