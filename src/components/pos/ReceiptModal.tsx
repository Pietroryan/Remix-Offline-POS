import React, { useState } from 'react';
import { Sale, StoreSettings, ReceiptTemplateId } from '../../types/pos';
import { printReceipt, generateReceiptHtml } from '../../services/receipt';
import { Printer, Download, CheckCircle, ArrowRight, X, FileText, Gift, Receipt } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

interface ReceiptModalProps {
  sale: Sale;
  settings: StoreSettings;
  onNewTransaction: () => void;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  sale,
  settings,
  onNewTransaction,
  onClose,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ReceiptTemplateId>(
    settings.receiptTemplate || (settings.paperWidth === '58mm' ? 'compact-58' : 'standard-80')
  );

  const title = (settings.h1Title || settings.storeName || 'Receipt').trim();
  const address = (settings.h2Address !== undefined ? settings.h2Address : (settings.address || '')).trim();
  const footnote1 = (settings.footnote1 || '').trim();
  const footnote2 = (settings.footnote2 || '').trim();
  const is58 = selectedTemplate === 'compact-58' || (selectedTemplate === 'standard-80' && settings.paperWidth === '58mm');

  const handlePrint = () => {
    printReceipt(sale, settings, selectedTemplate);
  };

  const handleDownloadHtml = () => {
    const html = generateReceiptHtml(sale, settings, selectedTemplate);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${sale.saleNumber}_${selectedTemplate}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 text-white shadow-2xl space-y-4 max-h-[92vh] flex flex-col font-sans">
        {/* Success Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Sale Completed #{sale.saleNumber}</h2>
              <p className="text-xs text-slate-400">
                Total: {formatCurrency(sale.grandTotal, settings.currencySymbol)} • Change: {formatCurrency(sale.changeAmount, settings.currencySymbol)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt Template Selector Tabs */}
        <div>
          <label className="text-[11px] font-mono text-slate-400 mb-1.5 block uppercase tracking-wider">
            Select Receipt Template:
          </label>
          <div className="grid grid-cols-4 gap-1 bg-[#0F172A] p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
            <button
              onClick={() => setSelectedTemplate('standard-80')}
              className={`py-1.5 px-2 rounded flex flex-col items-center justify-center transition-colors ${
                selectedTemplate === 'standard-80'
                  ? 'bg-blue-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 mb-0.5" />
              <span>80mm POS</span>
            </button>

            <button
              onClick={() => setSelectedTemplate('compact-58')}
              className={`py-1.5 px-2 rounded flex flex-col items-center justify-center transition-colors ${
                selectedTemplate === 'compact-58'
                  ? 'bg-blue-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Printer className="w-3.5 h-3.5 mb-0.5" />
              <span>58mm Mini</span>
            </button>

            <button
              onClick={() => setSelectedTemplate('tax-invoice')}
              className={`py-1.5 px-2 rounded flex flex-col items-center justify-center transition-colors ${
                selectedTemplate === 'tax-invoice'
                  ? 'bg-blue-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 mb-0.5" />
              <span>Tax Invoice</span>
            </button>

            <button
              onClick={() => setSelectedTemplate('gift-slip')}
              className={`py-1.5 px-2 rounded flex flex-col items-center justify-center transition-colors ${
                selectedTemplate === 'gift-slip'
                  ? 'bg-blue-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Gift className="w-3.5 h-3.5 mb-0.5" />
              <span>Gift Slip</span>
            </button>
          </div>
        </div>

        {/* Paper Preview Container (Rendered preview HTML) */}
        <div className={`mx-auto w-full bg-white text-black p-3.5 rounded-xl shadow-inner font-mono text-xs overflow-y-auto max-h-64 border border-slate-300 transition-all ${is58 ? 'max-w-[230px]' : 'max-w-[310px]'}`}>
          {selectedTemplate === 'tax-invoice' ? (
            <div className="space-y-2 text-[11px] font-sans break-words">
              <div className="text-center border-b pb-1 font-bold">
                <div className="text-xs uppercase break-words">{title}</div>
                {address && <div className="text-[10px] text-gray-600 break-words mt-0.5">{address}</div>}
                {settings.phone && <div className="text-[9px] text-gray-500">Tel: {settings.phone}</div>}
                <div className="text-[10px] text-gray-700 font-semibold mt-1">OFFICIAL TAX INVOICE • #{sale.saleNumber}</div>
                <div className="text-[9px] text-gray-500">VAT REG: TX-{Math.abs(title.length * 991203).toString().slice(0, 8)}</div>
              </div>
              <div className="text-[10px] text-gray-600 flex justify-between">
                <span>Date: {new Date(sale.createdAt).toLocaleDateString()}</span>
                <span>Cashier: {sale.cashierName}</span>
              </div>
              <table className="w-full border-t border-b text-[10px] my-1">
                <thead>
                  <tr className="border-b bg-gray-100">
                    <th className="text-left py-0.5">Item</th>
                    <th className="text-center py-0.5">Qty</th>
                    <th className="text-right py-0.5">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items.map((it) => (
                    <tr key={it.cartItemId} className="border-b border-gray-100">
                      <td className="py-1 break-words">{it.product.name}</td>
                      <td className="text-center">{it.quantity}</td>
                      <td className="text-right">{formatCurrency(it.subtotal, settings.currencySymbol)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-right space-y-0.5 text-[10px]">
                <div>Subtotal: {formatCurrency(sale.subtotal, settings.currencySymbol)}</div>
                {sale.totalDiscount > 0 && <div className="text-amber-600">Disc: -{formatCurrency(sale.totalDiscount, settings.currencySymbol)}</div>}
                <div>VAT ({settings.taxRate}%): {formatCurrency(sale.totalTax, settings.currencySymbol)}</div>
                <div className="font-bold text-xs border-t pt-0.5">TOTAL DUE: {formatCurrency(sale.grandTotal, settings.currencySymbol)}</div>
              </div>
              {footnote1 && <div className="text-center text-[9px] text-gray-700 mt-2 break-words">{footnote1}</div>}
              {footnote2 && <div className="text-center text-[9px] text-gray-700 mt-0.5 break-words">{footnote2}</div>}
            </div>
          ) : selectedTemplate === 'gift-slip' ? (
            <div className="space-y-2 text-center text-[11px] break-words">
              <div className="font-bold text-xs uppercase">*** GIFT RECEIPT ***</div>
              <div className="text-xs font-semibold break-words">{title}</div>
              {address && <div className="text-[10px] text-gray-600 break-words mt-0.5">{address}</div>}
              <div className="text-[10px] text-gray-600">Tx #{sale.saleNumber} • {new Date(sale.createdAt).toLocaleDateString()}</div>
              <div className="border-b border-dashed border-gray-400 my-1.5" />
              <div className="text-left space-y-1 text-[10px]">
                <div className="font-bold uppercase text-[9px] text-gray-600">Items Included:</div>
                {sale.items.map((it) => (
                  <div key={it.cartItemId} className="flex justify-between">
                    <span className="break-words">{it.product.name}</span>
                    <span className="font-bold shrink-0 ml-2">Qty: {it.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-b border-dashed border-gray-400 my-1.5" />
              <div className="text-[12px] font-mono font-bold tracking-widest my-1">|||| || ||||| |||| |||</div>
              {footnote1 && <div className="text-center text-[9px] text-gray-700 mt-1 break-words">{footnote1}</div>}
              {footnote2 && <div className="text-center text-[9px] text-gray-700 mt-0.5 break-words">{footnote2}</div>}
              <div className="text-[9px] text-gray-500 mt-1">Prices masked for gift recipient. Return or exchange valid within 30 days.</div>
            </div>
          ) : (
            <div className="break-words">
              <div className="text-center font-bold text-xs uppercase break-words leading-tight">{title}</div>
              {address && (
                <div className="text-center text-[10px] text-gray-600 break-words mt-0.5 whitespace-pre-wrap leading-tight">{address}</div>
              )}
              {settings.phone && <div className="text-center text-[10px] text-gray-600 mt-0.5">Tel: {settings.phone}</div>}
              {settings.receiptHeader && (
                <div className="text-center text-[10px] italic text-gray-600 mt-1 break-words whitespace-pre-wrap">{settings.receiptHeader}</div>
              )}

              <div className="border-b border-dashed border-gray-400 my-1.5" />

              <div className="flex justify-between text-[10px]">
                <span>Receipt #:</span>
                <span className="font-bold">{sale.saleNumber}</span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-600">
                <span>Date:</span>
                <span>{new Date(sale.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-600 mb-1.5">
                <span>Cashier:</span>
                <span>{sale.cashierName}</span>
              </div>

              <div className="border-b border-dashed border-gray-400 my-1.5" />

              <div className="space-y-1 my-1.5">
                {sale.items.map((item) => (
                  <div key={item.cartItemId} className="space-y-0.5">
                    <div className="font-semibold text-[10px] break-words">{item.product.name}</div>
                    <div className="flex justify-between text-[10px] text-gray-600">
                      <span>
                        {item.quantity} {item.unitName} @ {formatCurrency(item.unitPrice, settings.currencySymbol)}
                      </span>
                      <span>
                        {formatCurrency(item.subtotal, settings.currencySymbol)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-b border-dashed border-gray-400 my-1.5" />

              <div className="flex justify-between text-[10px]">
                <span>Subtotal:</span>
                <span>{formatCurrency(sale.subtotal, settings.currencySymbol)}</span>
              </div>
              {sale.totalDiscount > 0 && (
                <div className="flex justify-between text-[10px] text-amber-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(sale.totalDiscount, settings.currencySymbol)}</span>
                </div>
              )}
              {sale.totalTax > 0 && (
                <div className="flex justify-between text-[10px]">
                  <span>Tax ({settings.taxRate}%):</span>
                  <span>{formatCurrency(sale.totalTax, settings.currencySymbol)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xs pt-1 border-t border-gray-300 my-1">
                <span>TOTAL:</span>
                <span>{formatCurrency(sale.grandTotal, settings.currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>Paid:</span>
                <span>{formatCurrency(sale.totalPaid, settings.currencySymbol)}</span>
              </div>
              <div className="flex justify-between font-bold text-[10px]">
                <span>Change:</span>
                <span>{formatCurrency(sale.changeAmount, settings.currencySymbol)}</span>
              </div>
              <div className="text-center font-mono font-bold tracking-widest my-1 text-[11px]">||| |||| || ||||| |||</div>
              <div className="text-center text-[10px] text-gray-700">{sale.saleNumber}</div>
              {settings.receiptFooter && (
                <div className="text-center text-[9px] text-gray-600 mt-1 whitespace-pre-wrap break-words">{settings.receiptFooter}</div>
              )}
              {footnote1 && (
                <div className="text-center text-[9px] text-slate-800 font-medium break-words leading-tight mt-1">{footnote1}</div>
              )}
              {footnote2 && (
                <div className="text-center text-[9px] text-slate-800 font-medium break-words leading-tight mt-0.5">{footnote2}</div>
              )}
              <div className="text-center text-[8px] text-gray-400 mt-1.5">*** OFFLINE POS SYSTEM • CERTIFIED ***</div>
            </div>
          )}
        </div>

        {/* Print / Download Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handlePrint}
            className="bg-[#1E293B] hover:bg-slate-800 text-slate-100 p-2 rounded text-xs font-mono font-semibold flex items-center justify-center space-x-2 border border-slate-800 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>PRINT ({selectedTemplate.toUpperCase()})</span>
          </button>
          <button
            onClick={handleDownloadHtml}
            className="bg-[#1E293B] hover:bg-slate-800 text-slate-100 p-2 rounded text-xs font-mono font-semibold flex items-center justify-center space-x-2 border border-slate-800 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>SAVE AS HTML</span>
          </button>
        </div>

        <button
          onClick={() => {
            onNewTransaction();
            onClose();
          }}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded text-xs font-mono font-bold flex items-center justify-center space-x-2 shadow transition-colors"
        >
          <span>START NEW TRANSACTION</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
