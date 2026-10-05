import React, { useState } from 'react';
import {
  CartItem,
  Customer,
  PaymentMethod,
  PaymentDetail,
  Sale,
  Shift,
  StoreSettings,
  User,
} from '../../types/pos';
import {
  CreditCard,
  Banknote,
  QrCode,
  Layers,
  CheckCircle2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

interface PaymentModalProps {
  cart: CartItem[];
  customer?: Customer;
  activeUser: User;
  activeShift: Shift | null;
  settings: StoreSettings;
  subtotal: number;
  discountType: 'amount' | 'percent';
  discountValue: number;
  totalDiscount: number;
  totalTax: number;
  grandTotal: number;
  onCompleteSale: (sale: Sale) => void;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  cart,
  customer,
  activeUser,
  activeShift,
  settings,
  subtotal,
  discountType,
  discountValue,
  totalDiscount,
  totalTax,
  grandTotal,
  onCompleteSale,
  onClose,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [amountPaid, setAmountPaid] = useState<number>(grandTotal);
  const [referenceNo, setReferenceNo] = useState<string>('');

  // Split Payment states
  const [splitCash, setSplitCash] = useState<number>(Math.round(grandTotal / 2));
  const [splitCard, setSplitCard] = useState<number>(grandTotal - Math.round(grandTotal / 2));

  const changeAmount = method === 'cash' ? Math.max(0, amountPaid - grandTotal) : 0;
  const isSufficient =
    method === 'split'
      ? splitCash + splitCard >= grandTotal
      : amountPaid >= grandTotal - 0.01;

  const quickDenominations = [
    grandTotal,
    Math.ceil(grandTotal / 5000) * 5000,
    Math.ceil(grandTotal / 10000) * 10000,
    Math.ceil(grandTotal / 20000) * 20000,
    Math.ceil(grandTotal / 50000) * 50000,
    Math.ceil(grandTotal / 100000) * 100000,
  ].filter((val, index, self) => val >= grandTotal && self.indexOf(val) === index);

  const handleFinish = () => {
    if (!isSufficient) return;

    let payments: PaymentDetail[] = [];

    if (method === 'split') {
      payments = [
        { method: 'cash', amount: splitCash },
        { method: 'card', amount: splitCard, referenceNo },
      ];
    } else {
      payments = [
        {
          method,
          amount: method === 'cash' ? amountPaid : grandTotal,
          referenceNo: method !== 'cash' ? referenceNo : undefined,
        },
      ];
    }

    const saleNumber =
      'INV-' +
      new Date().toISOString().slice(0, 10).replace(/-/g, '') +
      '-' +
      Math.floor(Math.random() * 9000 + 1000);

    const newSale: Sale = {
      id: 'sal_' + Date.now(),
      saleNumber,
      cashierId: activeUser.id,
      cashierName: activeUser.fullName,
      customerId: customer?.id,
      customerName: customer?.name,
      shiftId: activeShift?.id,
      items: cart,
      subtotal,
      discountType,
      discountValue,
      totalDiscount,
      taxRate: settings.taxRate,
      totalTax,
      grandTotal,
      payments,
      totalPaid: method === 'split' ? splitCash + splitCard : amountPaid,
      changeAmount,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    onCompleteSale(newSale);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl space-y-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Checkout Payment</h2>
            <p className="text-xs text-slate-400">
              Customer: {customer?.name || 'Walk-in'} • {cart.length} line items
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Due Banner */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
          <div>
            <span className="text-xs text-slate-400 font-medium">TOTAL AMOUNT DUE</span>
            <div className="text-2xl font-extrabold text-emerald-400">
              {formatCurrency(grandTotal, settings.currencySymbol)}
            </div>
          </div>

          <div className="text-right text-xs text-slate-400 space-y-0.5">
            <div>Subtotal: {formatCurrency(subtotal, settings.currencySymbol)}</div>
            {totalDiscount > 0 && (
              <div className="text-amber-400">
                Discount: -{formatCurrency(totalDiscount, settings.currencySymbol)}
              </div>
            )}
            <div>Tax ({settings.taxRate}%): {formatCurrency(totalTax, settings.currencySymbol)}</div>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'cash', label: 'Cash', icon: Banknote },
            { id: 'card', label: 'Credit Card', icon: CreditCard },
            { id: 'qr', label: 'QR / Digital', icon: QrCode },
            { id: 'split', label: 'Split Pay', icon: Layers },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = method === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setMethod(item.id as PaymentMethod);
                  if (item.id === 'cash') setAmountPaid(grandTotal);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition ${
                  isSelected
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-950'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Method Specific Input Form */}
        {method === 'cash' && (
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
              <span>Cash Tendered</span>
              <span>Change: {formatCurrency(changeAmount, settings.currencySymbol)}</span>
            </div>

            <input
              type="number"
              step="1"
              value={amountPaid}
              onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xl font-bold text-white text-right focus:outline-none focus:border-emerald-500"
            />

            {/* Quick Bill Preset Buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              {quickDenominations.map((denom) => (
                <button
                  key={denom}
                  onClick={() => setAmountPaid(denom)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                >
                  {denom === grandTotal ? 'Exact' : formatCurrency(denom, settings.currencySymbol)}
                </button>
              ))}
            </div>
          </div>
        )}

        {(method === 'card' || method === 'qr') && (
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <label className="text-xs font-semibold text-slate-300 block">
              Terminal Reference / Approval Code (Optional)
            </label>
            <input
              type="text"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              placeholder="e.g. TR-892019"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}

        {method === 'split' && (
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Cash Portion</label>
                <input
                  type="number"
                  value={splitCash}
                  onChange={(e) => setSplitCash(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white text-right"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Card Portion</label>
                <input
                  type="number"
                  value={splitCard}
                  onChange={(e) => setSplitCard(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white text-right"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 text-slate-400 font-medium">
              <span>Split Total: {formatCurrency(splitCash + splitCard, settings.currencySymbol)}</span>
              <span>
                Remaining:{' '}
                {formatCurrency(Math.max(0, grandTotal - (splitCash + splitCard)), settings.currencySymbol)}
              </span>
            </div>
          </div>
        )}

        {/* Warning if insufficient */}
        {!isSufficient && (
          <div className="bg-rose-950/80 border border-rose-500/40 text-rose-300 p-3 rounded-xl text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Amount tendered is less than the total sale amount.</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end space-x-3 border-t border-slate-800 pt-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Back
          </button>
          <button
            onClick={handleFinish}
            disabled={!isSufficient}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition flex items-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete Order</span>
          </button>
        </div>
      </div>
    </div>
  );
};
