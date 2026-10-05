import React, { useState } from 'react';
import { Product, StockOpname, StockOpnameItem } from '../../types/pos';
import { ClipboardCheck, CheckCircle2, X, AlertTriangle } from 'lucide-react';

interface StockOpnameViewProps {
  products: Product[];
  userName: string;
  onSaveOpname: (opname: StockOpname) => void;
  onClose: () => void;
}

export const StockOpnameView: React.FC<StockOpnameViewProps> = ({
  products,
  userName,
  onSaveOpname,
  onClose,
}) => {
  const [counts, setCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    products.forEach((p) => {
      initial[p.id] = p.stock;
    });
    return initial;
  });

  const handleCommitOpname = () => {
    const items: StockOpnameItem[] = products.map((p) => {
      const physical = counts[p.id] !== undefined ? counts[p.id] : p.stock;
      return {
        productId: p.id,
        productName: p.name,
        currentStock: p.stock,
        physicalStock: physical,
        variance: physical - p.stock,
      };
    });

    const opname: StockOpname = {
      id: 'opn_' + Date.now(),
      opnameNumber: 'OPN-' + Math.floor(Math.random() * 90000 + 10000),
      status: 'completed',
      items,
      userName,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    onSaveOpname(opname);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 text-white shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <ClipboardCheck className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold">Physical Stock Opname Audit</h2>
              <p className="text-xs text-slate-400">
                Input actual counted physical stock for reconciliation
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pr-1 border border-slate-800 rounded-xl bg-slate-950">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800 text-slate-400 font-semibold border-b border-slate-800 sticky top-0">
                <th className="p-3">Product Name</th>
                <th className="p-3">SKU</th>
                <th className="p-3">System Stock</th>
                <th className="p-3">Physical Count</th>
                <th className="p-3">Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {products.map((p) => {
                const physical = counts[p.id] !== undefined ? counts[p.id] : p.stock;
                const variance = physical - p.stock;

                return (
                  <tr key={p.id} className="hover:bg-slate-900 transition">
                    <td className="p-3 font-bold text-slate-200">{p.name}</td>
                    <td className="p-3 text-slate-400">{p.sku}</td>
                    <td className="p-3 text-slate-300 font-semibold">{p.stock}</td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={physical}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setCounts((prev) => ({ ...prev, [p.id]: val }));
                        }}
                        className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 font-bold text-white text-center"
                      />
                    </td>
                    <td className="p-3 font-bold">
                      {variance === 0 ? (
                        <span className="text-slate-500">0</span>
                      ) : variance > 0 ? (
                        <span className="text-emerald-400">+{variance}</span>
                      ) : (
                        <span className="text-rose-400">{variance}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleCommitOpname}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 flex items-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Finalize & Adjust Stock</span>
          </button>
        </div>
      </div>
    </div>
  );
};
