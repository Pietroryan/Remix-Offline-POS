import React from 'react';
import { DraftTransaction } from '../../types/pos';
import { PauseCircle, Play, Trash2, X, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

interface HoldCartModalProps {
  drafts: DraftTransaction[];
  currencySymbol?: string;
  onResumeDraft: (draft: DraftTransaction) => void;
  onDeleteDraft: (id: string) => void;
  onClose: () => void;
}

export const HoldCartModal: React.FC<HoldCartModalProps> = ({
  drafts,
  currencySymbol = 'Rp',
  onResumeDraft,
  onDeleteDraft,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl space-y-5 max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <PauseCircle className="w-6 h-6 text-amber-400" />
            <h2 className="text-base font-bold">Held Carts & Drafts</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-3 flex-1 pr-1">
          {drafts.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <ShoppingBag className="w-12 h-12 mx-auto text-slate-700" />
              <p className="text-sm">No held carts or pending drafts.</p>
            </div>
          ) : (
            drafts.map((draft) => {
              const totalItems = draft.items.reduce((sum, item) => sum + item.quantity, 0);
              const grandTotal = draft.items.reduce((sum, item) => sum + item.subtotal, 0);

              return (
                <div
                  key={draft.id}
                  className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-slate-600 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-100">{draft.title}</span>
                      <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full">
                        {totalItems} Items
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Cashier: {draft.cashierName} • {new Date(draft.createdAt).toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-emerald-400 font-semibold">
                      Total: {formatCurrency(grandTotal, currencySymbol)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => {
                        onResumeDraft(draft);
                        onClose();
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Resume</span>
                    </button>
                    <button
                      onClick={() => onDeleteDraft(draft.id)}
                      className="bg-slate-700 hover:bg-rose-900/60 hover:text-rose-300 text-slate-300 p-2 rounded-lg transition"
                      title="Discard draft"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
