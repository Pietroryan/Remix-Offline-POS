/**
 * Indonesian Rupiah (IDR) Currency Formatting Utilities
 *
 * Requirements:
 * - Currency is IDR (standard symbol "Rp").
 * - Whole Rupiah amounts (without cents/decimals) in English numbering format (commas as thousands separators).
 * - No added comma and two zeros (,00) or decimal points (.00).
 *
 * Example:
 * 15000 -> "15,000" / "Rp 15,000"
 * 1250000 -> "1,250,000" / "Rp 1,250,000"
 */

/**
 * Formats a number as a whole Rupiah amount string without cents or decimals.
 * Uses English number format with comma as thousands separator.
 */
export function formatAmount(amount: number): string {
  const num = Math.round(Number(amount) || 0);
  return num.toLocaleString('en-US', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
}

/**
 * Formats a currency value with its symbol prefix as whole Rupiah without cents.
 * Default symbol is 'Rp'.
 * e.g. formatCurrency(50000) => "Rp 50,000"
 * e.g. formatCurrency(50000, "IDR") => "IDR 50,000"
 */
export function formatCurrency(amount: number, symbol: string = 'Rp'): string {
  const formatted = formatAmount(amount);
  const cleanSymbol = symbol ? symbol.trim() : '';
  if (!cleanSymbol) return formatted;
  return `${cleanSymbol} ${formatted}`;
}
