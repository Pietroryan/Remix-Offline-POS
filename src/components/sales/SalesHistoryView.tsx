import React, { useState } from 'react';
import { Sale, SalesReturn, SalesReturnItem, StoreSettings } from '../../types/pos';
import { printReceipt } from '../../services/receipt';
import {
  ReceiptText,
  Search,
  Printer,
  RotateCcw,
  Eye,
  X,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { downloadCsv, convertToCsv } from '../../services/exportCsv';
import { formatCurrency } from '../../utils/currency';

interface SalesHistoryViewProps {
  sales: Sale[];
  returns: SalesReturn[];
  settings: StoreSettings;
  cashierName: string;
  onProcessReturn: (salesReturn: SalesReturn) => void;
}

export const SalesHistoryView: React.FC<SalesHistoryViewProps> = ({
  sales,
  returns,
  settings,
  cashierName,
  onProcessReturn,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [returnModalSale, setReturnModalSale] = useState<Sale | null>(null);

  // Return Form State
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [returnReason, setReturnReason] = useState<string>('Customer Defect / Damage');

  const filteredSales = sales.filter(
    (s) =>
      s.saleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.cashierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.customerName && s.customerName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenReturnModal = (sale: Sale) => {
    setReturnModalSale(sale);
    const initialQtys: Record<string, number> = {};
    sale.items.forEach((item) => {
      initialQtys[item.cartItemId] = 0;
    });
    setReturnQuantities(initialQtys);
  };

  const handleConfirmReturn = () => {
    if (!returnModalSale) return;

    const returnItems: SalesReturnItem[] = [];
    let totalRefund = 0;

    returnModalSale.items.forEach((item) => {
      const qtyToReturn = returnQuantities[item.cartItemId] || 0;
      if (qtyToReturn > 0) {
        const itemRefund = qtyToReturn * item.unitPrice;
        totalRefund += itemRefund;
        returnItems.push({
          productId: item.productId,
          productName: item.product.name,
          unitName: item.unitName,
          quantity: qtyToReturn,
          unitPrice: item.unitPrice,
          refundAmount: itemRefund,
          reason: returnReason,
        });
      }
    });

    if (returnItems.length === 0) return;

    const returnRecord: SalesReturn = {
      id: 'ret_' + Date.now(),
      returnNumber: 'RET-' + Math.floor(Math.random() * 900000 + 100000),
      saleId: returnModalSale.id,
      saleNumber: returnModalSale.saleNumber,
      cashierName,
      items: returnItems,
      totalRefund,
      refundMethod: 'cash',
      createdAt: new Date().toISOString(),
      notes: returnReason,
    };

    onProcessReturn(returnRecord);
    setReturnModalSale(null);
  };

  const handleExportCsv = () => {
    const exportData = sales.map((s) => ({
      SaleNumber: s.saleNumber,
      Date: s.createdAt,
      Cashier: s.cashierName,
      Customer: s.customerName || 'Walk-in',
      ItemsCount: s.items.length,
      Subtotal: s.subtotal,
      Discount: s.totalDiscount,
      Tax: s.totalTax,
      GrandTotal: s.grandTotal,
      Status: s.status,
    }));
    const csv = convertToCsv(exportData);
    downloadCsv(`Sales_Report_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  return (
    <div className="flex-1 bg-slate-950 p-4 md:p-6 overflow-y-auto space-y-5 text-white">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <ReceiptText className="w-6 h-6 text-emerald-400" />
            Sales History & Returns
          </h1>
          <p className="text-xs text-slate-400">
            Audit past completed receipts, re-print thermal tickets, and issue item refunds
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
        </div>
      </div>

      {/* Filter Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by receipt #, cashier, or customer name..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Sales Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
                <th className="p-3">Receipt #</th>
                <th className="p-3">Date & Time</th>
                <th className="p-3">Cashier</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Items</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    No sales receipts found matching your filter.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-850 transition">
                    <td className="p-3 font-bold text-emerald-400">{sale.saleNumber}</td>
                    <td className="p-3 text-slate-300">
                      {new Date(sale.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3 text-slate-300">{sale.cashierName}</td>
                    <td className="p-3 text-slate-300">{sale.customerName || 'Walk-in'}</td>
                    <td className="p-3 text-slate-300">
                      {sale.items.reduce((sum, i) => sum + i.quantity, 0)} Pcs
                    </td>
                    <td className="p-3 font-bold text-white">
                      {formatCurrency(sale.grandTotal, settings.currencySymbol)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          sale.status === 'completed'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border-rose-800'
                        }`}
                      >
                        {sale.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => setSelectedSale(sale)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="View Receipt Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => printReceipt(sale, settings)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="Print Thermal Ticket"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      {sale.status === 'completed' && (
                        <button
                          onClick={() => handleOpenReturnModal(sale)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 hover:text-rose-300 text-amber-400"
                          title="Process Return / Refund"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 text-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm">Receipt #{selectedSale.saleNumber}</h3>
              <button
                onClick={() => setSelectedSale(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Date:</span>
                <span className="text-slate-200">
                  {new Date(selectedSale.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Cashier:</span>
                <span className="text-slate-200">{selectedSale.cashierName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Customer:</span>
                <span className="text-slate-200">{selectedSale.customerName || 'Walk-in'}</span>
              </div>

              <div className="border-t border-slate-800 pt-2 space-y-1">
                <span className="font-bold text-slate-300">Items:</span>
                {selectedSale.items.map((item) => (
                  <div key={item.cartItemId} className="flex justify-between text-slate-300">
                    <span>
                      {item.product.name} ({item.quantity} {item.unitName})
                    </span>
                    <span>
                      {formatCurrency(item.subtotal, settings.currencySymbol)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-800 pt-2 space-y-1 font-bold">
                <div className="flex justify-between text-emerald-400 text-sm">
                  <span>Grand Total:</span>
                  <span>
                    {formatCurrency(selectedSale.grandTotal, settings.currencySymbol)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => printReceipt(selectedSale, settings)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt Ticket</span>
            </button>
          </div>
        </div>
      )}

      {/* Process Sales Return Modal */}
      {returnModalSale && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-amber-400" />
                Process Sales Return (#{returnModalSale.saleNumber})
              </h3>
              <button
                onClick={() => setReturnModalSale(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              <p className="text-xs text-slate-400">Select quantity of items being returned:</p>
              {returnModalSale.items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="bg-slate-800 p-3 rounded-xl flex justify-between items-center text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-200">{item.product.name}</div>
                    <div className="text-[10px] text-slate-400">
                      Bought: {item.quantity} {item.unitName} @ {formatCurrency(item.unitPrice, settings.currencySymbol)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-slate-400">Return Qty:</span>
                    <input
                      type="number"
                      min="0"
                      max={item.quantity}
                      value={returnQuantities[item.cartItemId] || 0}
                      onChange={(e) => {
                        const val = Math.min(item.quantity, Math.max(0, parseInt(e.target.value) || 0));
                        setReturnQuantities((prev) => ({ ...prev, [item.cartItemId]: val }));
                      }}
                      className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-center font-bold text-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">
                Return Reason / Notes
              </label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Customer Defect / Damage">Customer Defect / Damage</option>
                <option value="Wrong Item Purchased">Wrong Item Purchased</option>
                <option value="Expired Product">Expired Product</option>
                <option value="Customer Mind Change">Customer Mind Change</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setReturnModalSale(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReturn}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Confirm Refund & Restock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
