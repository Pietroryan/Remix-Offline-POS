import React, { useState } from 'react';
import { Product, StockAdjustment } from '../../types/pos';
import { Boxes, X, CheckCircle2 } from 'lucide-react';

interface StockAdjustmentModalProps {
  products: Product[];
  userName: string;
  onSaveAdjustment: (adj: StockAdjustment) => void;
  onClose: () => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  products,
  userName,
  onSaveAdjustment,
  onClose,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [reason, setReason] = useState<
    'Damaged' | 'Expired' | 'Inventory Count Variance' | 'Internal Use' | 'Other'
  >('Damaged');
  const [adjustedQty, setAdjustedQty] = useState<number>(0); // positive or negative delta
  const [notes, setNotes] = useState<string>('');

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const currentStock = selectedProduct?.stock || 0;
  const newStock = Math.max(0, currentStock + adjustedQty);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || adjustedQty === 0) return;

    const adjustment: StockAdjustment = {
      id: 'adj_' + Date.now(),
      adjustmentNumber: 'ADJ-' + Math.floor(Math.random() * 90000 + 10000),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantityBefore: currentStock,
      quantityAdjusted: adjustedQty,
      quantityAfter: newStock,
      reason,
      userName,
      notes,
      createdAt: new Date().toISOString(),
    };

    onSaveAdjustment(adjustment);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-5">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Boxes className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold">Manual Stock Adjustment</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-1">Select Product</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Stock: {p.stock} {p.baseUnit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block">Recorded Stock</span>
              <span className="text-sm font-bold text-slate-200">{currentStock}</span>
            </div>
            <div>
              <span className="text-slate-400 block">New Stock Level</span>
              <span className="text-sm font-bold text-emerald-400">{newStock}</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-1">
              Quantity Adjustment Delta (+ or -)
            </label>
            <input
              type="number"
              value={adjustedQty}
              onChange={(e) => setAdjustedQty(parseInt(e.target.value) || 0)}
              placeholder="e.g. -2 for damaged, +5 for found stock"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-1">Adjustment Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="Damaged">Damaged / Broken Item</option>
              <option value="Expired">Expired Goods</option>
              <option value="Inventory Count Variance">Inventory Count Variance</option>
              <option value="Internal Use">Internal Store Use</option>
              <option value="Other">Other Reason</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-1">Notes / Description</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Shelf unit fallen in aisle 2"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={adjustedQty === 0}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold"
            >
              Commit Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
