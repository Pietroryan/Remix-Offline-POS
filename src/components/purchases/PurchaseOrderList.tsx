import React, { useState } from 'react';
import {
  Product,
  Supplier,
  Purchase,
  PurchaseItem,
  StoreSettings,
} from '../../types/pos';
import { Truck, Plus, CheckCircle2, Eye, X, FileSpreadsheet } from 'lucide-react';
import { downloadCsv, convertToCsv } from '../../services/exportCsv';
import { formatCurrency } from '../../utils/currency';

interface PurchaseOrderListProps {
  purchases: Purchase[];
  suppliers: Supplier[];
  products: Product[];
  settings: StoreSettings;
  userName: string;
  onSavePurchase: (purchase: Purchase) => void;
}

export const PurchaseOrderList: React.FC<PurchaseOrderListProps> = ({
  purchases,
  suppliers,
  products,
  settings,
  userName,
  onSavePurchase,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Partial' | 'Unpaid'>('Paid');
  const [notes, setNotes] = useState<string>('');

  // Item selector state inside modal
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [unitCostInput, setUnitCostInput] = useState<number>(0);
  const [qtyInput, setQtyInput] = useState<number>(1);

  const handleAddItemToPO = () => {
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    const cost = unitCostInput > 0 ? unitCostInput : prod.costPrice;
    const newItem: PurchaseItem = {
      productId: prod.id,
      productName: prod.name,
      unitCost: cost,
      quantity: qtyInput,
      subtotal: cost * qtyInput,
    };

    setPurchaseItems((prev) => [...prev, newItem]);
    setQtyInput(1);
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (purchaseItems.length === 0) return;

    const supplier = suppliers.find((s) => s.id === selectedSupplierId);
    const totalAmount = purchaseItems.reduce((sum, i) => sum + i.subtotal, 0);

    const newPurchase: Purchase = {
      id: 'po_' + Date.now(),
      poNumber: 'PO-' + Math.floor(Math.random() * 90000 + 10000),
      supplierId: selectedSupplierId,
      supplierName: supplier?.name || 'General Supplier',
      items: purchaseItems,
      totalAmount,
      paymentStatus,
      status: 'Received', // Auto receive goods into stock
      userName,
      createdAt: new Date().toISOString(),
      notes,
    };

    onSavePurchase(newPurchase);
    setShowAddModal(false);
    setPurchaseItems([]);
  };

  const handleExportCsv = () => {
    const data = purchases.map((p) => ({
      PONumber: p.poNumber,
      Date: p.createdAt,
      Supplier: p.supplierName,
      ItemsCount: p.items.length,
      TotalAmount: p.totalAmount,
      PaymentStatus: p.paymentStatus,
      Status: p.status,
      User: p.userName,
    }));
    downloadCsv(`Purchases_Report_${new Date().toISOString().slice(0, 10)}.csv`, convertToCsv(data));
  };

  return (
    <div className="flex-1 bg-slate-950 p-4 md:p-6 overflow-y-auto space-y-5 text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Truck className="w-6 h-6 text-emerald-400" />
            Purchasing & Goods Receipt
          </h1>
          <p className="text-xs text-slate-400">
            Create supplier purchase orders, receive incoming stock, and track vendor payments
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCsv}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg shadow-emerald-950 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Purchase Order</span>
          </button>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
                <th className="p-3">PO Number</th>
                <th className="p-3">Date</th>
                <th className="p-3">Supplier Name</th>
                <th className="p-3">Items Count</th>
                <th className="p-3">Total Cost</th>
                <th className="p-3">Payment Status</th>
                <th className="p-3">Goods Status</th>
                <th className="p-3">Purchaser</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    No purchase orders created yet.
                  </td>
                </tr>
              ) : (
                purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-850 transition">
                    <td className="p-3 font-bold text-emerald-400">{p.poNumber}</td>
                    <td className="p-3 text-slate-300">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-slate-200 font-semibold">{p.supplierName}</td>
                    <td className="p-3 text-slate-300">{p.items.length} Lines</td>
                    <td className="p-3 font-bold text-white">
                      {formatCurrency(p.totalAmount, settings.currencySymbol)}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{p.userName}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Purchase Order Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 text-white shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                Create Purchase Order & Receive Goods
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="overflow-y-auto space-y-4 flex-1 pr-1">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Select Supplier</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Add Item Line Box */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-emerald-400 block">Add Item Line</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-3">
                    <select
                      value={selectedProductId}
                      onChange={(e) => {
                        setSelectedProductId(e.target.value);
                        const p = products.find((prod) => prod.id === e.target.value);
                        if (p) setUnitCostInput(p.costPrice);
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Cost: {formatCurrency(p.costPrice, settings.currencySymbol)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block">Unit Cost ({settings.currencySymbol})</label>
                    <input
                      type="number"
                      step="1"
                      value={unitCostInput}
                      onChange={(e) => setUnitCostInput(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block">Quantity</label>
                    <input
                      type="number"
                      value={qtyInput}
                      onChange={(e) => setQtyInput(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-white text-center"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleAddItemToPO}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 rounded-lg text-xs"
                    >
                      Add Line
                    </button>
                  </div>
                </div>
              </div>

              {/* PO Line Items List */}
              <div className="space-y-2 max-h-40 overflow-y-auto">
                <span className="text-xs font-bold text-slate-300">Order Items ({purchaseItems.length})</span>
                {purchaseItems.map((item, idx) => (
                  <div key={idx} className="bg-slate-800 p-2.5 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-slate-200">{item.productName}</div>
                      <div className="text-[10px] text-slate-400">
                        {item.quantity} Units @ {formatCurrency(item.unitCost, settings.currencySymbol)}
                      </div>
                    </div>
                    <span className="font-bold text-emerald-400">{formatCurrency(item.subtotal, settings.currencySymbol)}</span>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Paid">Fully Paid</option>
                  <option value="Partial">Partially Paid</option>
                  <option value="Unpaid">Unpaid / Credit</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={purchaseItems.length === 0}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold"
                >
                  Create PO & Increase Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
