import React, { useState } from 'react';
import { Shift, StoreSettings, User } from '../../types/pos';
import { Coins, ArrowUpRight, ArrowDownRight, CheckCircle2, Lock, Plus, Minus, X } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

interface ShiftManagementViewProps {
  activeShift: Shift | null;
  shifts: Shift[];
  activeUser: User;
  settings: StoreSettings;
  onOpenShift: (startingCash: number) => void;
  onRecordCashMovement: (type: 'in' | 'out', amount: number, reason: string) => void;
  onCloseShift: (actualCash: number, notes?: string) => void;
}

export const ShiftManagementView: React.FC<ShiftManagementViewProps> = ({
  activeShift,
  shifts,
  activeUser,
  settings,
  onOpenShift,
  onRecordCashMovement,
  onCloseShift,
}) => {
  // Open Shift Form
  const [startingCashInput, setStartingCashInput] = useState<number>(500000);

  // Cash Movement Modal
  const [showMovementModal, setShowMovementModal] = useState<boolean>(false);
  const [movementType, setMovementType] = useState<'in' | 'out'>('in');
  const [movAmount, setMovAmount] = useState<number>(50000);
  const [movReason, setMovReason] = useState<string>('');

  // Close Shift Modal
  const [showCloseModal, setShowCloseModal] = useState<boolean>(false);
  const [actualCashInput, setActualCashInput] = useState<number>(
    activeShift ? activeShift.expectedCash : 0
  );
  const [closeNotes, setCloseNotes] = useState<string>('');

  const handleConfirmMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (movAmount <= 0 || !movReason.trim()) return;
    onRecordCashMovement(movementType, movAmount, movReason.trim());
    setShowMovementModal(false);
    setMovReason('');
  };

  const handleConfirmClose = (e: React.FormEvent) => {
    e.preventDefault();
    onCloseShift(actualCashInput, closeNotes.trim());
    setShowCloseModal(false);
  };

  return (
    <div className="flex-1 bg-slate-950 p-4 md:p-6 overflow-y-auto space-y-5 text-white">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Coins className="w-6 h-6 text-emerald-400" />
          Shift & Cash Drawer Management
        </h1>
        <p className="text-xs text-slate-400">
          Open/close cash drawer shifts, record paid-in/paid-out movements, and reconcile cash variances
        </p>
      </div>

      {/* Current Shift Status */}
      {!activeShift ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 max-w-lg mx-auto shadow-xl">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">No Shift Currently Open</h2>
            <p className="text-xs text-slate-400">
              You must open a shift with an initial starting float before processing sales
            </p>
          </div>

          <div className="space-y-3 pt-2 text-left">
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">
                Starting Cash Float ({settings.currencySymbol})
              </label>
              <input
                type="number"
                step="1"
                value={startingCashInput}
                onChange={(e) => setStartingCashInput(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-lg font-bold text-white"
              />
            </div>

            <button
              onClick={() => onOpenShift(startingCashInput)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs shadow-lg shadow-emerald-950 transition"
            >
              Open Shift Now
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Active Shift Card */}
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-0.5 rounded-full font-bold uppercase">
                  ACTIVE SHIFT OPEN
                </span>
                <h2 className="text-lg font-extrabold text-white mt-1">
                  Shift #{activeShift.shiftNumber}
                </h2>
                <p className="text-xs text-slate-400">
                  Opened by {activeShift.cashierName} at{' '}
                  {new Date(activeShift.startTime).toLocaleTimeString()}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowMovementModal(true)}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  <Coins className="w-4 h-4 text-emerald-400" />
                  <span>Cash In / Out</span>
                </button>
                <button
                  onClick={() => {
                    setActualCashInput(activeShift.expectedCash);
                    setShowCloseModal(true);
                  }}
                  className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-rose-950 transition"
                >
                  Close Shift
                </button>
              </div>
            </div>

            {/* Shift Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block">STARTING FLOAT</span>
                <span className="text-base font-extrabold text-slate-200">
                  {formatCurrency(activeShift.startingCash, settings.currencySymbol)}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block">CASH SALES</span>
                <span className="text-base font-extrabold text-emerald-400">
                  {formatCurrency(activeShift.cashSales, settings.currencySymbol)}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block">CARD SALES</span>
                <span className="text-base font-extrabold text-slate-200">
                  {formatCurrency(activeShift.cardSales, settings.currencySymbol)}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block">PAID IN / OUT</span>
                <span className="text-base font-extrabold text-amber-400">
                  +{formatCurrency(activeShift.cashIn, settings.currencySymbol)} / -{formatCurrency(activeShift.cashOut, settings.currencySymbol)}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block">TOTAL SALES</span>
                <span className="text-base font-extrabold text-white">
                  {formatCurrency(activeShift.totalSales, settings.currencySymbol)}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/40">
                <span className="text-[10px] text-emerald-400 font-semibold block">EXPECTED IN DRAWER</span>
                <span className="text-base font-black text-emerald-400">
                  {formatCurrency(activeShift.expectedCash, settings.currencySymbol)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Past Shifts Log */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-slate-200">Past Shift History</h3>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
                  <th className="p-3">Shift #</th>
                  <th className="p-3">Cashier</th>
                  <th className="p-3">Start → End Time</th>
                  <th className="p-3">Total Sales</th>
                  <th className="p-3">Expected Cash</th>
                  <th className="p-3">Actual Cash</th>
                  <th className="p-3">Variance</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {shifts.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-850 transition">
                    <td className="p-3 font-bold text-emerald-400">{s.shiftNumber}</td>
                    <td className="p-3 text-slate-300">{s.cashierName}</td>
                    <td className="p-3 text-slate-400">
                      {new Date(s.startTime).toLocaleTimeString()} →{' '}
                      {s.endTime ? new Date(s.endTime).toLocaleTimeString() : 'Active'}
                    </td>
                    <td className="p-3 font-bold text-white">
                      {formatCurrency(s.totalSales, settings.currencySymbol)}
                    </td>
                    <td className="p-3 text-slate-300">
                      {formatCurrency(s.expectedCash, settings.currencySymbol)}
                    </td>
                    <td className="p-3 font-bold text-slate-200">
                      {s.actualCash !== undefined
                        ? formatCurrency(s.actualCash, settings.currencySymbol)
                        : '-'}
                    </td>
                    <td className="p-3 font-bold">
                      {s.variance !== undefined ? (
                        s.variance === 0 ? (
                          <span className="text-slate-500">{formatCurrency(0, settings.currencySymbol)}</span>
                        ) : s.variance > 0 ? (
                          <span className="text-emerald-400">+{formatCurrency(s.variance, settings.currencySymbol)}</span>
                        ) : (
                          <span className="text-rose-400">-{formatCurrency(Math.abs(s.variance), settings.currencySymbol)}</span>
                        )
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          s.status === 'open'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Cash In / Out Drawer Movement Modal */}
      {showMovementModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base">Record Cash Movement</h3>
              <button onClick={() => setShowMovementModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmMovement} className="space-y-3 text-xs">
              <div className="flex rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
                <button
                  type="button"
                  onClick={() => setMovementType('in')}
                  className={`flex-1 py-2 font-bold ${
                    movementType === 'in' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Cash Paid In (+)
                </button>
                <button
                  type="button"
                  onClick={() => setMovementType('out')}
                  className={`flex-1 py-2 font-bold ${
                    movementType === 'out' ? 'bg-rose-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Cash Paid Out (-)
                </button>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Amount ({settings.currencySymbol})</label>
                <input
                  type="number"
                  step="1"
                  required
                  value={movAmount}
                  onChange={(e) => setMovAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Reason / Description *</label>
                <input
                  type="text"
                  required
                  value={movReason}
                  onChange={(e) => setMovReason(e.target.value)}
                  placeholder="e.g. Added extra change, Bought printer paper"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMovementModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Submit Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Shift Reconciliation Modal */}
      {showCloseModal && activeShift && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base">Close Shift & Cash Reconcile</h3>
              <button onClick={() => setShowCloseModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmClose} className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400">System Calculated Cash:</span>
                <div className="text-xl font-bold text-emerald-400">
                  {formatCurrency(activeShift.expectedCash, settings.currencySymbol)}
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">
                  Actual Physical Cash Counted ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  value={actualCashInput}
                  onChange={(e) => setActualCashInput(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-lg font-bold text-white"
                />
              </div>

              <div className="flex justify-between items-center font-semibold pt-1">
                <span className="text-slate-400">Cash Variance:</span>
                <span
                  className={
                    actualCashInput - activeShift.expectedCash === 0
                      ? 'text-slate-400'
                      : actualCashInput - activeShift.expectedCash > 0
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }
                >
                  {actualCashInput - activeShift.expectedCash >= 0 ? '+' : '-'}
                  {formatCurrency(Math.abs(actualCashInput - activeShift.expectedCash), settings.currencySymbol)}
                </span>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Shift Notes (Optional)</label>
                <input
                  type="text"
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  placeholder="e.g. Cash drawer balanced"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Finalize & Close Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
