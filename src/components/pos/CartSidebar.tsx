import React, { useState } from 'react';
import {
  CartItem,
  Customer,
  Product,
  StoreSettings,
} from '../../types/pos';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  UserPlus,
  Tag,
  PauseCircle,
  CreditCard,
  Percent,
  ChevronDown,
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

interface CartSidebarProps {
  cart: CartItem[];
  customers: Customer[];
  selectedCustomer: Customer | undefined;
  settings: StoreSettings;
  discountType: 'amount' | 'percent';
  discountValue: number;
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onUpdateUnit: (cartItemId: string, unitName: string) => void;
  onUpdatePriceTier: (cartItemId: string, tierName: 'Retail' | 'Wholesale' | 'VIP') => void;
  onUpdateLineDiscount: (cartItemId: string, amount: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onSelectCustomer: (customer: Customer | undefined) => void;
  onSetDiscount: (type: 'amount' | 'percent', value: number) => void;
  onClearCart: () => void;
  onHoldCart: () => void;
  onOpenHoldModal: () => void;
  onOpenCheckout: () => void;
  heldCount: number;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
  cart,
  customers,
  selectedCustomer,
  settings,
  discountType,
  discountValue,
  onUpdateQuantity,
  onUpdateUnit,
  onUpdatePriceTier,
  onUpdateLineDiscount,
  onRemoveItem,
  onSelectCustomer,
  onSetDiscount,
  onClearCart,
  onHoldCart,
  onOpenHoldModal,
  onOpenCheckout,
  heldCount,
}) => {
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discValInput, setDiscValInput] = useState<number>(discountValue);
  const [discTypeInput, setDiscTypeInput] = useState<'amount' | 'percent'>(discountType);

  // Subtotal Calculation
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  // Total Discount Calculation
  let totalDiscount = 0;
  if (discountType === 'percent') {
    totalDiscount = (subtotal * discountValue) / 100;
  } else {
    totalDiscount = Math.min(subtotal, discountValue);
  }

  const discountedSubtotal = Math.max(0, subtotal - totalDiscount);
  const totalTax = (discountedSubtotal * settings.taxRate) / 100;
  const grandTotal = discountedSubtotal + totalTax;

  const handleApplyDiscount = () => {
    onSetDiscount(discTypeInput, discValInput);
    setShowDiscountModal(false);
  };

  return (
    <div id="pos-cart-sidebar" className="w-full lg:w-80 bg-[#1E293B] border-l border-slate-800 flex flex-col justify-between h-full select-none">
      {/* Top Header & Customer Selector */}
      <div className="p-2.5 bg-[#0F172A] border-b border-slate-800 space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-4 h-4 text-blue-400" />
            <h2 className="font-bold text-xs font-mono uppercase tracking-wider text-slate-100">Current Cart</h2>
            <span className="bg-[#1E293B] text-slate-300 text-[10px] px-1.5 py-0.5 rounded font-mono border border-slate-800">
              {cart.reduce((s, i) => s + i.quantity, 0)} ITEMS
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={onOpenHoldModal}
              className="relative p-1 rounded bg-[#1E293B] hover:bg-slate-800 text-amber-400 border border-slate-800 text-[11px] font-mono"
              title="View held carts"
            >
              <PauseCircle className="w-3.5 h-3.5" />
              {heldCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[9px] font-mono font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {heldCount}
                </span>
              )}
            </button>
            {cart.length > 0 && (
              <button
                onClick={onClearCart}
                className="p-1 rounded bg-[#1E293B] hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-800 text-[11px]"
                title="Clear current cart"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Customer Selector Dropdown */}
        <div className="relative">
          <select
            value={selectedCustomer?.id || ''}
            onChange={(e) => {
              const cust = customers.find((c) => c.id === e.target.value);
              onSelectCustomer(cust);
            }}
            className="w-full bg-[#1E293B] border border-slate-800 rounded px-2.5 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 appearance-none pr-7 cursor-pointer"
          >
            <option value="">Walk-in Customer (Regular)</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.tier}) - {c.phone}
              </option>
            ))}
          </select>
          <UserPlus className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1.5 pointer-events-none" />
        </div>
      </div>

      {/* Cart Items Scroll Container */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-1.5 py-12">
            <ShoppingCart className="w-8 h-8 text-slate-600 stroke-1" />
            <p className="text-xs font-mono text-center">Cart is empty. Select inventory items to populate.</p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.cartItemId}
              className="bg-[#0F172A] border border-slate-800 rounded p-2.5 space-y-1.5 font-mono"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-2">
                  <h4 className="text-xs font-bold text-slate-100 leading-tight">
                    {item.product.name}
                  </h4>
                  {item.variantName && (
                    <span className="text-[10px] text-blue-400 font-mono">
                      Variant: {item.variantName}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onRemoveItem(item.cartItemId)}
                  className="text-slate-500 hover:text-red-400 p-0.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Unit & Tier Controls */}
              <div className="flex items-center space-x-1.5 text-[10px]">
                {/* Unit Switcher */}
                {item.product.unitConversions && item.product.unitConversions.length > 1 ? (
                  <select
                    value={item.unitName}
                    onChange={(e) => onUpdateUnit(item.cartItemId, e.target.value)}
                    className="bg-[#1E293B] border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 font-mono cursor-pointer"
                  >
                    {item.product.unitConversions.map((uc) => (
                      <option key={uc.unitName} value={uc.unitName}>
                        {uc.unitName} (x{uc.conversionFactor})
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="bg-[#1E293B] px-1.5 py-0.5 rounded border border-slate-800 text-slate-400 font-mono">
                    {item.unitName}
                  </span>
                )}

                {/* Price Tier Switcher */}
                {item.product.priceTiers && (
                  <select
                    value={item.selectedPriceTier}
                    onChange={(e) =>
                      onUpdatePriceTier(
                        item.cartItemId,
                        e.target.value as 'Retail' | 'Wholesale' | 'VIP'
                      )
                    }
                    className="bg-[#1E293B] border border-slate-800 rounded px-1.5 py-0.5 text-blue-400 font-mono cursor-pointer"
                  >
                    {item.product.priceTiers.map((pt) => (
                      <option key={pt.tierName} value={pt.tierName}>
                        {pt.tierName}: {formatCurrency(pt.price, settings.currencySymbol)}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Quantity Stepper & Subtotal */}
              <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
                <div className="flex items-center space-x-1 bg-[#1E293B] border border-slate-800 rounded p-0.5">
                  <button
                    onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                    className="w-5 h-5 rounded bg-[#0F172A] hover:bg-slate-800 flex items-center justify-center text-slate-200"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center font-bold font-mono text-xs text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                    className="w-5 h-5 rounded bg-[#0F172A] hover:bg-slate-800 flex items-center justify-center text-slate-200"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-blue-400">
                    {formatCurrency(item.subtotal, settings.currencySymbol)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Summary & Checkout Footer */}
      <div className="p-2.5 bg-[#0F172A] border-t border-slate-800 space-y-2 font-mono">
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal</span>
            <span className="text-slate-200 font-semibold">
              {formatCurrency(subtotal, settings.currencySymbol)}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-400">
            <button
              onClick={() => setShowDiscountModal(true)}
              className="text-amber-400 hover:underline flex items-center space-x-1 text-[10px] font-mono"
            >
              <Tag className="w-3 h-3" />
              <span>
                Discount {discountValue > 0 ? (discountType === 'percent' ? `(${discountValue}%)` : `(${formatCurrency(discountValue, settings.currencySymbol)})`) : ''}
              </span>
            </button>
            <span className="text-amber-400 font-semibold">
              -{formatCurrency(totalDiscount, settings.currencySymbol)}
            </span>
          </div>

          <div className="flex justify-between text-slate-400">
            <span>Tax ({settings.taxRate}%)</span>
            <span className="text-slate-200 font-semibold">
              {formatCurrency(totalTax, settings.currencySymbol)}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs font-bold text-white pt-1.5 border-t border-slate-800">
            <span className="uppercase tracking-wider">Grand Total</span>
            <span className="text-blue-400 text-sm">
              {formatCurrency(grandTotal, settings.currencySymbol)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            onClick={onHoldCart}
            disabled={cart.length === 0}
            className="bg-[#1E293B] hover:bg-slate-800 disabled:opacity-40 text-amber-400 border border-slate-800 rounded p-2 text-[11px] font-mono font-semibold flex flex-col items-center justify-center transition-colors"
            title="Hold cart as draft"
          >
            <PauseCircle className="w-3.5 h-3.5 mb-0.5" />
            <span>HOLD</span>
          </button>

          <button
            onClick={onOpenCheckout}
            disabled={cart.length === 0}
            className="col-span-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-mono font-bold rounded p-2 text-xs flex items-center justify-center space-x-1.5 transition-colors shadow"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>PAY ({formatCurrency(grandTotal, settings.currencySymbol)})</span>
          </button>
        </div>
      </div>

      {/* Global Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-[#0F172A]/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1E293B] border border-slate-800 rounded max-w-xs w-full p-4 text-white shadow-2xl space-y-3 font-mono">
            <h3 className="font-bold text-xs text-slate-100 flex items-center gap-2 uppercase">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              Apply Order Discount
            </h3>

            <div className="flex rounded overflow-hidden border border-slate-800 bg-[#0F172A]">
              <button
                onClick={() => setDiscTypeInput('amount')}
                className={`flex-1 py-1 text-[11px] font-semibold ${
                  discTypeInput === 'amount'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Fixed ({settings.currencySymbol})
              </button>
              <button
                onClick={() => setDiscTypeInput('percent')}
                className={`flex-1 py-1 text-[11px] font-semibold ${
                  discTypeInput === 'percent'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Percentage (%)
              </button>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 mb-1 block uppercase">Discount Value</label>
              <input
                type="number"
                value={discValInput}
                onChange={(e) => setDiscValInput(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0F172A] border border-slate-800 rounded px-2.5 py-1 text-xs text-white font-bold"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDiscountModal(false)}
                className="px-3 py-1 rounded bg-[#0F172A] hover:bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyDiscount}
                className="px-4 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
