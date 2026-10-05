import React from 'react';
import {
  DollarSign,
  Euro,
  PoundSterling,
  JapaneseYen,
  IndianRupee,
  Coins,
} from 'lucide-react';

interface CurrencyIconProps {
  currency?: string;
  className?: string;
}

/**
 * Dynamic Currency Icon Component
 * Seamlessly renders the corresponding currency symbol icon or SVG
 * matching standard Lucide icon dimensions (default w-4 h-4) and color.
 */
export const CurrencyIcon: React.FC<CurrencyIconProps> = ({
  currency = 'Rp',
  className = 'w-4 h-4',
}) => {
  const raw = (currency || '').trim();
  const upper = raw.toUpperCase();

  // 1. Dollar ($) and standard USD
  if (raw === '$' || upper === 'USD') {
    return <DollarSign className={className} />;
  }

  // 2. Euro (€)
  if (raw === '€' || upper === 'EUR') {
    return <Euro className={className} />;
  }

  // 3. British Pound (£)
  if (raw === '£' || upper === 'GBP') {
    return <PoundSterling className={className} />;
  }

  // 4. Japanese Yen / Chinese Yuan (¥)
  if (raw === '¥' || upper === 'JPY' || upper === 'CNY') {
    return <JapaneseYen className={className} />;
  }

  // 5. Indian Rupee (₹)
  if (raw === '₹' || upper === 'INR') {
    return <IndianRupee className={className} />;
  }

  // 6. Indonesian Rupiah (Rp / IDR)
  if (raw === 'Rp' || raw === 'rp' || upper === 'IDR') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-label="Indonesian Rupiah (Rp)"
      >
        <text
          x="12"
          y="16.5"
          textAnchor="middle"
          fontSize="12.5"
          fontWeight="900"
          letterSpacing="-0.8px"
          fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        >
          Rp
        </text>
      </svg>
    );
  }

  // 7. Compound symbols ending in $ (e.g. S$, A$, C$, HK$, NZ$)
  if (raw.endsWith('$')) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-label={raw}
      >
        <text
          x="12"
          y="16"
          textAnchor="middle"
          fontSize={raw.length > 2 ? '10' : '11.5'}
          fontWeight="900"
          letterSpacing="-0.5px"
          fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
        >
          {raw}
        </text>
      </svg>
    );
  }

  // 8. Other compact currency symbols (e.g. RM, ฿, ₱, ₫, kr, zł, CHF)
  if (raw.length > 0 && raw.length <= 4) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-label={raw}
      >
        <text
          x="12"
          y="16"
          textAnchor="middle"
          fontSize={raw.length >= 3 ? '9.5' : '12'}
          fontWeight="900"
          letterSpacing="-0.5px"
          fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
        >
          {raw}
        </text>
      </svg>
    );
  }

  // Fallback to Coins
  return <Coins className={className} />;
};
