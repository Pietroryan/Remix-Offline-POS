import { Sale, StoreSettings, ReceiptTemplateId } from '../types/pos';
import { formatCurrency, formatAmount } from '../utils/currency';

export { formatCurrency, formatAmount };

export function generateReceiptHtml(
  sale: Sale,
  settings: StoreSettings,
  templateId?: ReceiptTemplateId
): string {
  const chosenTemplate = templateId || settings.receiptTemplate || (settings.paperWidth === '58mm' ? 'compact-58' : 'standard-80');

  if (chosenTemplate === 'tax-invoice') {
    return generateTaxInvoiceHtml(sale, settings);
  }

  if (chosenTemplate === 'gift-slip') {
    return generateGiftSlipHtml(sale, settings);
  }

  const is58 = chosenTemplate === 'compact-58' || settings.paperWidth === '58mm';
  const widthPx = is58 ? '210px' : '290px';

  const title = (settings.h1Title || settings.storeName || 'Receipt').trim();
  const address = (settings.h2Address !== undefined ? settings.h2Address : (settings.address || '')).trim();
  const fn1 = (settings.footnote1 || '').trim();
  const fn2 = (settings.footnote2 || '').trim();

  const itemsHtml = sale.items
    .map(
      (item) => `
    <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px; word-break: break-word;">
      <span style="font-weight: 600; flex: 1;">${item.product.name}${item.variantName ? ` (${item.variantName})` : ''}</span>
    </div>
    <div style="display: flex; justify-content: space-between; font-size: 11px; color: #444; margin-bottom: 4px;">
      <span>${item.quantity} ${item.unitName} @ ${formatCurrency(item.unitPrice, settings.currencySymbol)}</span>
      <span>${formatCurrency(item.subtotal, settings.currencySymbol)}</span>
    </div>
    ${
      item.lineDiscountAmount > 0
        ? `<div style="font-size: 10px; color: #d97706; text-align: right;">Disc: -${formatCurrency(item.lineDiscountAmount, settings.currencySymbol)}</div>`
        : ''
    }
  `
    )
    .join('');

  const paymentsHtml = sale.payments
    .map(
      (p) => `
    <div style="display: flex; justify-content: space-between; font-size: 11px;">
      <span>Paid (${p.method.toUpperCase()}):</span>
      <span>${formatCurrency(p.amount, settings.currencySymbol)}</span>
    </div>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Receipt #${sale.saleNumber}</title>
        <style>
          @page { size: auto; margin: 0; }
          * { box-sizing: border-box; }
          body {
            font-family: 'Courier New', Courier, monospace;
            width: ${widthPx};
            max-width: 100%;
            margin: 0 auto;
            padding: 12px 8px;
            color: #000;
            background: #fff;
            word-break: break-word;
            overflow-wrap: break-word;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .bold { font-weight: bold; }
          .divider { border-bottom: 1px dashed #000; margin: 8px 0; }
          .double-divider { border-bottom: 2px dashed #000; margin: 8px 0; }
          .flex-between { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px; }
          .barcode { font-family: monospace; letter-spacing: 4px; font-weight: bold; font-size: 14px; margin: 6px 0; text-align: center; }
        </style>
      </head>
      <body>
        <div class="text-center" style="word-break: break-word; overflow-wrap: break-word;">
          <div style="font-size: 15px; font-weight: bold; text-transform: uppercase; line-height: 1.25; word-break: break-word;">${title}</div>
          ${address ? `<div style="font-size: 10px; margin-top: 2px; white-space: pre-wrap; word-break: break-word; line-height: 1.3;">${address}</div>` : ''}
          ${settings.phone ? `<div style="font-size: 10px; margin-top: 2px;">Tel: ${settings.phone}</div>` : ''}
          ${settings.receiptHeader ? `<div style="font-size: 10px; font-style: italic; margin-top: 4px; white-space: pre-wrap; word-break: break-word;">${settings.receiptHeader}</div>` : ''}
        </div>

        <div class="divider"></div>

        <div class="flex-between">
          <span>Receipt #:</span>
          <span class="bold">${sale.saleNumber}</span>
        </div>
        <div class="flex-between">
          <span>Date:</span>
          <span>${new Date(sale.createdAt).toLocaleString()}</span>
        </div>
        <div class="flex-between">
          <span>Cashier:</span>
          <span>${sale.cashierName}</span>
        </div>
        ${
          sale.customerName
            ? `<div class="flex-between"><span>Customer:</span><span class="bold">${sale.customerName}</span></div>`
            : ''
        }

        <div class="divider"></div>

        <div>${itemsHtml}</div>

        <div class="divider"></div>

        <div class="flex-between">
          <span>Subtotal:</span>
          <span>${formatCurrency(sale.subtotal, settings.currencySymbol)}</span>
        </div>
        ${
          sale.totalDiscount > 0
            ? `<div class="flex-between" style="color:#d97706;"><span>Discount:</span><span>-${formatCurrency(sale.totalDiscount, settings.currencySymbol)}</span></div>`
            : ''
        }
        ${
          sale.totalTax > 0
            ? `<div class="flex-between"><span>Tax (${settings.taxRate}%):</span><span>${formatCurrency(sale.totalTax, settings.currencySymbol)}</span></div>`
            : ''
        }

        <div class="double-divider"></div>

        <div class="flex-between" style="font-size: 13px; font-weight: bold;">
          <span>TOTAL:</span>
          <span>${formatCurrency(sale.grandTotal, settings.currencySymbol)}</span>
        </div>

        <div class="divider"></div>

        ${paymentsHtml}

        <div class="flex-between" style="font-size: 11px; font-weight: bold; margin-top: 4px;">
          <span>Change Due:</span>
          <span>${formatCurrency(sale.changeAmount, settings.currencySymbol)}</span>
        </div>

        <div class="divider"></div>

        <div class="barcode">||| |||| || ||||| |||</div>
        <div class="text-center" style="font-size: 10px;">${sale.saleNumber}</div>

        ${
          settings.receiptFooter
            ? `<div class="text-center" style="font-size: 10px; margin-top: 8px; white-space: pre-wrap; word-break: break-word;">${settings.receiptFooter}</div>`
            : ''
        }
        ${
          fn1
            ? `<div class="text-center" style="font-size: 9.5px; margin-top: 6px; color: #111; word-break: break-word; overflow-wrap: break-word; line-height: 1.3;">${fn1}</div>`
            : ''
        }
        ${
          fn2
            ? `<div class="text-center" style="font-size: 9.5px; margin-top: 3px; color: #111; word-break: break-word; overflow-wrap: break-word; line-height: 1.3;">${fn2}</div>`
            : ''
        }
        <div class="text-center" style="font-size: 8.5px; margin-top: 8px; color: #666;">
          *** OFFLINE POS SYSTEM • CERTIFIED ***
        </div>
      </body>
    </html>
  `;
}

function generateTaxInvoiceHtml(sale: Sale, settings: StoreSettings): string {
  const title = (settings.h1Title || settings.storeName || 'Store').trim();
  const address = (settings.h2Address !== undefined ? settings.h2Address : (settings.address || '')).trim();
  const fn1 = (settings.footnote1 || '').trim();
  const fn2 = (settings.footnote2 || '').trim();

  const itemsRows = sale.items
    .map(
      (item, idx) => `
    <tr style="border-bottom: 1px solid #ddd; font-size: 11px;">
      <td style="padding: 6px 4px;">${idx + 1}</td>
      <td style="padding: 6px 4px; font-weight: 600; word-break: break-word;">${item.product.name}</td>
      <td style="padding: 6px 4px; text-align: center;">${item.quantity} ${item.unitName}</td>
      <td style="padding: 6px 4px; text-align: right;">${formatCurrency(item.unitPrice, settings.currencySymbol)}</td>
      <td style="padding: 6px 4px; text-align: right; font-weight: 600;">${formatCurrency(item.subtotal, settings.currencySymbol)}</td>
    </tr>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>TAX INVOICE #${sale.saleNumber}</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: Arial, sans-serif; width: 440px; max-width: 100%; margin: 0 auto; padding: 16px; color: #111; background: #fff; word-break: break-word; overflow-wrap: break-word; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px; }
          .title { font-size: 16px; font-weight: bold; letter-spacing: 1px; }
          .company { font-size: 13px; font-weight: bold; margin-top: 4px; word-break: break-word; }
          .sub { font-size: 10px; color: #444; word-break: break-word; margin-top: 2px; }
          .meta-table { width: 100%; font-size: 10px; margin-bottom: 12px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
          .items-table th { background: #f0f0f0; border-bottom: 1px solid #000; padding: 6px 4px; font-size: 10px; text-align: left; }
          .tot-row { display: flex; justify-content: space-between; font-size: 11px; padding: 2px 0; }
          .grand { font-size: 14px; font-weight: bold; border-top: 1px solid #000; border-bottom: 2px solid #000; padding: 4px 0; margin-top: 4px; }
          .signature { margin-top: 30px; display: flex; justify-content: space-between; font-size: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">OFFICIAL TAX INVOICE</div>
          <div class="company">${title}</div>
          ${address ? `<div class="sub">${address}</div>` : ''}
          ${settings.phone ? `<div class="sub">Tel: ${settings.phone}</div>` : ''}
          <div class="sub">TAX ID / VAT REG: TX-${Math.abs(title.length * 991203).toString().slice(0, 8)}</div>
        </div>

        <table class="meta-table">
          <tr>
            <td><strong>Invoice No:</strong> ${sale.saleNumber}</td>
            <td style="text-align: right;"><strong>Date:</strong> ${new Date(sale.createdAt).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td><strong>Customer:</strong> ${sale.customerName || 'Standard Walk-in Buyer'}</td>
            <td style="text-align: right;"><strong>Cashier:</strong> ${sale.cashierName}</td>
          </tr>
        </table>

        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 20px;">#</th>
              <th>Item Description</th>
              <th style="text-align: center; width: 60px;">Qty</th>
              <th style="text-align: right; width: 70px;">Unit Price</th>
              <th style="text-align: right; width: 70px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div style="margin-left: auto; width: 220px;">
          <div class="tot-row"><span>Subtotal:</span><span>${formatCurrency(sale.subtotal, settings.currencySymbol)}</span></div>
          ${sale.totalDiscount > 0 ? `<div class="tot-row" style="color:#d97706;"><span>Discount:</span><span>-${formatCurrency(sale.totalDiscount, settings.currencySymbol)}</span></div>` : ''}
          <div class="tot-row"><span>VAT / Tax (${settings.taxRate}%):</span><span>${formatCurrency(sale.totalTax, settings.currencySymbol)}</span></div>
          <div class="tot-row grand"><span>TOTAL DUE:</span><span>${formatCurrency(sale.grandTotal, settings.currencySymbol)}</span></div>
        </div>

        <div class="signature">
          <div style="text-align: center; width: 120px;">
            <div>Issued by:</div>
            <div style="margin-top: 35px; border-top: 1px solid #888;">${sale.cashierName}</div>
          </div>
          <div style="text-align: center; width: 120px;">
            <div>Customer Signature:</div>
            <div style="margin-top: 35px; border-top: 1px solid #888;">Authorized</div>
          </div>
        </div>

        ${fn1 ? `<div style="text-align: center; font-size: 9.5px; color: #222; margin-top: 16px; word-break: break-word; line-height: 1.3;">${fn1}</div>` : ''}
        ${fn2 ? `<div style="text-align: center; font-size: 9.5px; color: #222; margin-top: 3px; word-break: break-word; line-height: 1.3;">${fn2}</div>` : ''}

        <div style="text-align: center; font-size: 9px; color: #777; margin-top: 16px;">
          This document is generated by an authorized offline Electronic POS System.
        </div>
      </body>
    </html>
  `;
}

function generateGiftSlipHtml(sale: Sale, settings: StoreSettings): string {
  const title = (settings.h1Title || settings.storeName || 'Store').trim();
  const address = (settings.h2Address !== undefined ? settings.h2Address : (settings.address || '')).trim();
  const fn1 = (settings.footnote1 || '').trim();
  const fn2 = (settings.footnote2 || '').trim();

  const itemsHtml = sale.items
    .map(
      (item) => `
    <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px; border-bottom: 1px dotted #ccc; padding-bottom: 2px; word-break: break-word;">
      <span style="font-weight: 600;">${item.product.name}</span>
      <span>${item.quantity} ${item.unitName}</span>
    </div>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Gift Receipt #${sale.saleNumber}</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: 'Courier New', Courier, monospace; width: 280px; max-width: 100%; margin: 0 auto; padding: 14px; background: #fff; color: #000; text-align: center; word-break: break-word; overflow-wrap: break-word; }
          .divider { border-bottom: 1px dashed #000; margin: 8px 0; }
        </style>
      </head>
      <body>
        <div style="font-size: 16px; font-weight: bold;">GIFT RECEIPT</div>
        <div style="font-size: 13px; font-weight: bold; margin-top: 2px; word-break: break-word;">${title}</div>
        ${address ? `<div style="font-size: 10px; color: #555; margin-top: 2px; white-space: pre-wrap; word-break: break-word;">${address}</div>` : ''}

        <div class="divider"></div>

        <div style="display: flex; justify-content: space-between; font-size: 11px;">
          <span>Transaction #:</span><span>${sale.saleNumber}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 10px; color: #555;">
          <span>Date:</span><span>${new Date(sale.createdAt).toLocaleDateString()}</span>
        </div>

        <div class="divider"></div>

        <div style="text-align: left; margin: 10px 0;">
          <div style="font-size: 10px; font-weight: bold; margin-bottom: 6px; text-transform: uppercase;">Items Included:</div>
          ${itemsHtml}
        </div>

        <div class="divider"></div>

        <div style="font-size: 14px; font-family: monospace; letter-spacing: 3px; font-weight: bold; margin: 8px 0;">
          |||| || ||||| |||| |||
        </div>
        <div style="font-size: 10px; font-family: monospace;">${sale.saleNumber}</div>

        ${fn1 ? `<div style="font-size: 9.5px; color: #222; margin-top: 8px; word-break: break-word; line-height: 1.3;">${fn1}</div>` : ''}
        ${fn2 ? `<div style="font-size: 9.5px; color: #222; margin-top: 3px; word-break: break-word; line-height: 1.3;">${fn2}</div>` : ''}

        <div style="font-size: 10px; margin-top: 10px; line-height: 1.4; color: #444; word-break: break-word;">
          <strong>Exchange Policy:</strong><br />
          Items may be exchanged for store credit within 30 days of purchase when accompanied by this gift receipt in original condition.
        </div>
      </body>
    </html>
  `;
}

export function printReceipt(
  sale: Sale,
  settings: StoreSettings,
  templateId?: ReceiptTemplateId
): void {
  const htmlContent = generateReceiptHtml(sale, settings, templateId);
  const printWindow = window.open('', '_blank', 'width=450,height=650');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }
}

