import React, { useState, useMemo } from 'react';
import {
  Product,
  Category,
  Brand,
  Customer,
  CartItem,
  Sale,
  DraftTransaction,
  Shift,
  StoreSettings,
  User,
} from '../../types/pos';
import { CartSidebar } from './CartSidebar';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { HoldCartModal } from './HoldCartModal';
import { PaymentModal } from './PaymentModal';
import { ReceiptModal } from './ReceiptModal';
import {
  Search,
  ScanBarcode,
  Grid,
  ListFilter,
  AlertTriangle,
  Plus,
  Layers,
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

interface PosTerminalProps {
  products: Product[];
  categories: Category[];
  brands?: Brand[];
  customers: Customer[];
  activeUser?: User | null;
  activeShift: Shift | null;
  settings: StoreSettings;
  userName?: string;
  drafts?: DraftTransaction[];
  onSaveSale?: (sale: Sale) => void;
  onCompleteSale?: (sale: Sale) => void;
  onSaveDraft?: (draft: DraftTransaction) => void;
  onDeleteDraft?: (id: string) => void;
}

export const PosTerminal: React.FC<PosTerminalProps> = ({
  products,
  categories,
  customers,
  activeUser,
  activeShift,
  settings,
  userName,
  drafts = [],
  onSaveSale,
  onCompleteSale,
  onSaveDraft,
  onDeleteDraft,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);

  // Discounts
  const [discountType, setDiscountType] = useState<'amount' | 'percent'>('percent');
  const [discountValue, setDiscountValue] = useState<number>(0);

  // Modals
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  // Variant selector modal state
  const [selectedProductForVariant, setSelectedProductForVariant] = useState<Product | null>(null);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.active) return false;
      const matchCategory = selectedCategoryId === 'all' || p.categoryId === selectedCategoryId;
      const q = searchQuery.toLowerCase();
      const matchQuery =
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.code.includes(q);

      return matchCategory && matchQuery;
    });
  }, [products, selectedCategoryId, searchQuery]);

  // Cart operations
  const handleAddToCart = (product: Product, variantId?: string, forcedUnitName?: string) => {
    if (product.stock <= 0) return; // Prevent adding out of stock

    // If product has variants and none passed, trigger variant selector
    if (product.variants && product.variants.length > 0 && !variantId) {
      setSelectedProductForVariant(product);
      return;
    }

    let unitName = forcedUnitName || product.baseUnit;
    let unitFactor = 1;
    const matchedConversion = product.unitConversions?.find((u) => u.unitName === unitName);
    if (matchedConversion) {
      unitFactor = matchedConversion.conversionFactor;
    }

    let price = product.sellingPrice;
    let variantName: string | undefined = undefined;

    if (variantId && product.variants) {
      const v = product.variants.find((varItem) => varItem.id === variantId);
      if (v) {
        variantName = v.name;
        price = product.sellingPrice + v.additionalPrice;
      }
    }

    const cartItemId = `${product.id}_${variantId || 'base'}_${unitName}`;

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex((i) => i.cartItemId === cartItemId);
      if (existingIdx >= 0) {
        const updated = [...prevCart];
        const newQty = updated[existingIdx].quantity + 1;
        const subtotal = newQty * updated[existingIdx].unitPrice - updated[existingIdx].lineDiscountAmount;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          subtotal: Math.max(0, subtotal),
        };
        return updated;
      } else {
        const itemUnitPrice = price * unitFactor;
        const newItem: CartItem = {
          cartItemId,
          productId: product.id,
          product,
          variantId,
          variantName,
          unitName,
          unitFactor,
          selectedPriceTier: 'Retail',
          unitPrice: itemUnitPrice,
          quantity: 1,
          lineDiscountAmount: 0,
          subtotal: itemUnitPrice,
        };
        return [...prevCart, newItem];
      }
    });
  };

  const handleUpdateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          const subtotal = newQty * item.unitPrice - item.lineDiscountAmount;
          return { ...item, quantity: newQty, subtotal: Math.max(0, subtotal) };
        }
        return item;
      })
    );
  };

  const handleUpdateUnit = (cartItemId: string, unitName: string) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          const conv = item.product.unitConversions?.find((u) => u.unitName === unitName);
          const unitFactor = conv ? conv.conversionFactor : 1;
          const unitPrice = item.product.sellingPrice * unitFactor;
          const subtotal = item.quantity * unitPrice - item.lineDiscountAmount;
          return {
            ...item,
            unitName,
            unitFactor,
            unitPrice,
            subtotal: Math.max(0, subtotal),
          };
        }
        return item;
      })
    );
  };

  const handleUpdatePriceTier = (cartItemId: string, tierName: 'Retail' | 'Wholesale' | 'VIP') => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          const tier = item.product.priceTiers?.find((pt) => pt.tierName === tierName);
          const basePrice = tier ? tier.price : item.product.sellingPrice;
          const unitPrice = basePrice * item.unitFactor;
          const subtotal = item.quantity * unitPrice - item.lineDiscountAmount;
          return {
            ...item,
            selectedPriceTier: tierName,
            unitPrice,
            subtotal: Math.max(0, subtotal),
          };
        }
        return item;
      })
    );
  };

  const handleUpdateLineDiscount = (cartItemId: string, amount: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          const subtotal = item.quantity * item.unitPrice - amount;
          return {
            ...item,
            lineDiscountAmount: amount,
            subtotal: Math.max(0, subtotal),
          };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const handleHoldCart = () => {
    if (cart.length === 0) return;
    const newDraft: DraftTransaction = {
      id: 'dft_' + Date.now(),
      title: `${selectedCustomer?.name || 'Walk-in'} Order (${cart.length} items)`,
      cashierName: userName || activeUser?.fullName || 'Cashier',
      items: cart,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name,
      createdAt: new Date().toISOString(),
    };
    if (onSaveDraft) onSaveDraft(newDraft);
    setCart([]);
    setSelectedCustomer(undefined);
  };

  const handleResumeDraft = (draft: DraftTransaction) => {
    setCart(draft.items);
    if (draft.customerId) {
      const cust = customers.find((c) => c.id === draft.customerId);
      setSelectedCustomer(cust);
    }
    if (onDeleteDraft) onDeleteDraft(draft.id);
  };

  const handleFinishedSale = (sale: Sale) => {
    if (onCompleteSale) onCompleteSale(sale);
    if (onSaveSale) onSaveSale(sale);
    setShowPaymentModal(false);
    setCompletedSale(sale);
    setCart([]);
    setSelectedCustomer(undefined);
    setDiscountValue(0);
  };

  // Subtotal & Calculations for Cart Sidebar
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  let totalDiscount = 0;
  if (discountType === 'percent') {
    totalDiscount = (subtotal * discountValue) / 100;
  } else {
    totalDiscount = Math.min(subtotal, discountValue);
  }
  const discountedSubtotal = Math.max(0, subtotal - totalDiscount);
  const totalTax = (discountedSubtotal * settings.taxRate) / 100;
  const grandTotal = discountedSubtotal + totalTax;

  return (
    <div id="pos-terminal-root" className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-[#0F172A]">
      {/* Left Area: Product Catalog Grid & Search */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-800">
        {/* Top Controls Bar */}
        <div className="p-2.5 bg-[#1E293B] border-b border-slate-800 flex flex-col sm:flex-row gap-2 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by SKU, name, or barcode..."
              className="w-full bg-[#0F172A] border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* Barcode Scanner Trigger Button */}
          <button
            onClick={() => setShowBarcodeScanner(true)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center justify-center space-x-2 transition-colors shadow-sm"
          >
            <ScanBarcode className="w-3.5 h-3.5" />
            <span className="font-mono uppercase text-[11px]">Barcode Scan</span>
          </button>
        </div>

        {/* Category Pills Bar */}
        <div className="p-2 bg-[#0F172A] border-b border-slate-800 flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedCategoryId('all')}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium whitespace-nowrap transition-colors ${
              selectedCategoryId === 'all'
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-[#1E293B] text-slate-400 hover:bg-slate-800'
            }`}
          >
            ALL ITEMS ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategoryId(c.id)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium whitespace-nowrap transition-colors ${
                selectedCategoryId === c.id
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-[#1E293B] text-slate-400 hover:bg-slate-800'
              }`}
            >
              {c.name.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 align-content-start">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500 space-y-2">
              <Grid className="w-10 h-10 mx-auto stroke-1" />
              <p className="text-xs font-mono">No matching inventory items found.</p>
            </div>
          ) : (
            filteredProducts.map((p) => {
              const isLowStock = p.stock <= p.minStock;
              const isOutOfStock = p.stock <= 0;

              return (
                <div
                  key={p.id}
                  onClick={() => !isOutOfStock && handleAddToCart(p)}
                  className={`group relative bg-[#1E293B] border rounded p-2.5 flex flex-col justify-between select-none cursor-pointer transition ${
                    isOutOfStock
                      ? 'opacity-40 border-slate-800 cursor-not-allowed'
                      : 'border-slate-800 hover:border-blue-500/80 hover:bg-slate-800/80'
                  }`}
                >
                  {/* Image or Icon Placeholder */}
                  <div className="w-full h-20 rounded bg-[#0F172A] overflow-hidden mb-2 relative flex items-center justify-center border border-slate-800">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                      />
                    ) : (
                      <div className="text-slate-600 font-mono font-bold text-lg">{p.name.charAt(0)}</div>
                    )}

                    {/* Low Stock or Out of Stock Badge */}
                    {isOutOfStock ? (
                      <span className="absolute top-1 right-1 bg-red-950/80 text-red-400 text-[9px] font-mono px-1.5 py-0.5 rounded border border-red-800">
                        OUT
                      </span>
                    ) : (
                      isLowStock && (
                        <span className="absolute top-1 right-1 bg-amber-950/80 text-amber-400 text-[9px] font-mono px-1.5 py-0.5 rounded border border-amber-800">
                          {p.stock} LEFT
                        </span>
                      )
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xs font-semibold text-slate-100 line-clamp-1 leading-tight">
                      {p.name}
                    </h3>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                      <span>{p.sku}</span>
                      <span>QTY: {p.stock}</span>
                    </div>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-blue-400">
                      {formatCurrency(p.sellingPrice, settings.currencySymbol)}
                    </span>
                    <button
                      disabled={isOutOfStock}
                      className="w-5 h-5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Area: Cart Sidebar */}
      <CartSidebar
        cart={cart}
        customers={customers}
        selectedCustomer={selectedCustomer}
        settings={settings}
        discountType={discountType}
        discountValue={discountValue}
        onUpdateQuantity={handleUpdateQuantity}
        onUpdateUnit={handleUpdateUnit}
        onUpdatePriceTier={handleUpdatePriceTier}
        onUpdateLineDiscount={handleUpdateLineDiscount}
        onRemoveItem={handleRemoveItem}
        onSelectCustomer={setSelectedCustomer}
        onSetDiscount={(type, val) => {
          setDiscountType(type);
          setDiscountValue(val);
        }}
        onClearCart={() => setCart([])}
        onHoldCart={handleHoldCart}
        onOpenHoldModal={() => setShowHoldModal(true)}
        onOpenCheckout={() => setShowPaymentModal(true)}
        heldCount={drafts.length}
      />

      {/* Barcode Scanner Modal */}
      {showBarcodeScanner && (
        <BarcodeScannerModal
          products={products}
          onScanProduct={(prod, unitName) => {
            handleAddToCart(prod, undefined, unitName);
          }}
          onClose={() => setShowBarcodeScanner(false)}
        />
      )}

      {/* Hold Carts Modal */}
      {showHoldModal && (
        <HoldCartModal
          drafts={drafts}
          currencySymbol={settings.currencySymbol}
          onResumeDraft={handleResumeDraft}
          onDeleteDraft={onDeleteDraft || (() => {})}
          onClose={() => setShowHoldModal(false)}
        />
      )}

      {/* Payment Checkout Modal */}
      {showPaymentModal && (
        <PaymentModal
          cart={cart}
          customer={selectedCustomer}
          activeUser={activeUser || { id: 'u1', fullName: userName || 'Cashier', role: 'cashier', pin: '1234', active: true }}
          activeShift={activeShift}
          settings={settings}
          subtotal={subtotal}
          discountType={discountType}
          discountValue={discountValue}
          totalDiscount={totalDiscount}
          totalTax={totalTax}
          grandTotal={grandTotal}
          onCompleteSale={handleFinishedSale}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      {/* Receipt Preview Modal */}
      {completedSale && (
        <ReceiptModal
          sale={completedSale}
          settings={settings}
          onNewTransaction={() => setCompletedSale(null)}
          onClose={() => setCompletedSale(null)}
        />
      )}

      {/* Variant Selector Popup */}
      {selectedProductForVariant && (
        <div className="fixed inset-0 bg-[#0F172A]/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1E293B] border border-slate-800 rounded max-w-xs w-full p-4 text-white shadow-2xl space-y-3">
            <h3 className="font-bold text-xs font-mono text-slate-100 flex items-center gap-2 uppercase">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Select Variant: {selectedProductForVariant.name}
            </h3>

            <div className="space-y-1.5">
              {selectedProductForVariant.variants?.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    handleAddToCart(selectedProductForVariant, v.id);
                    setSelectedProductForVariant(null);
                  }}
                  className="w-full text-left p-2 rounded bg-[#0F172A] hover:border-blue-500 border border-slate-800 transition flex justify-between items-center text-xs font-mono"
                >
                  <span className="font-semibold text-slate-200">{v.name}</span>
                  <span className="text-blue-400 font-bold">
                    {formatCurrency(selectedProductForVariant.sellingPrice + v.additionalPrice, settings.currencySymbol)}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setSelectedProductForVariant(null)}
              className="w-full py-1.5 rounded bg-slate-800 text-slate-300 text-xs font-mono"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
