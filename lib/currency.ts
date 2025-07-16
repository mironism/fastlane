import { Currency } from './types';

// Supported currencies configuration
export const SUPPORTED_CURRENCIES = {
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimal_places: 2, is_active: true },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', decimal_places: 2, is_active: true },
  TRY: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', decimal_places: 2, is_active: true },
  IDR: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', decimal_places: 0, is_active: true }
} as const;

export type SupportedCurrencyCode = keyof typeof SUPPORTED_CURRENCIES;

/**
 * Format a price with the appropriate currency symbol and decimal places
 * @param amount - The numeric amount to format
 * @param currencyCode - The ISO 4217 currency code (defaults to EUR)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currencyCode: string = 'EUR'): string {
  const currency = SUPPORTED_CURRENCIES[currencyCode as SupportedCurrencyCode];
  if (!currency) {
    console.warn(`Unknown currency code: ${currencyCode}, falling back to EUR`);
    return formatCurrency(amount, 'EUR');
  }
  
  const decimals = currency.decimal_places;
  // Use toLocaleString for proper number formatting with commas
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  
  // Handle different currency symbol positions
  switch (currencyCode) {
    case 'CHF':
    case 'IDR':
      return `${currency.symbol} ${formattedAmount}`;
    case 'TRY':
      return `${formattedAmount} ${currency.symbol}`;
    case 'EUR':
    default:
      return `${currency.symbol}${formattedAmount}`;
  }
}

/**
 * Get the symbol for a given currency code
 * @param currencyCode - The ISO 4217 currency code
 * @returns The currency symbol
 */
export function getCurrencySymbol(currencyCode: string): string {
  const currency = SUPPORTED_CURRENCIES[currencyCode as SupportedCurrencyCode];
  return currency?.symbol || '€';
}

/**
 * Get the decimal places for a given currency code
 * @param currencyCode - The ISO 4217 currency code
 * @returns The number of decimal places
 */
export function getCurrencyDecimalPlaces(currencyCode: string): number {
  const currency = SUPPORTED_CURRENCIES[currencyCode as SupportedCurrencyCode];
  return currency?.decimal_places || 2;
}

/**
 * Get currency information for a given code
 * @param currencyCode - The ISO 4217 currency code
 * @returns Currency object or null if not found
 */
export function getCurrency(currencyCode: string): Currency | null {
  const currency = SUPPORTED_CURRENCIES[currencyCode as SupportedCurrencyCode];
  return currency ? { ...currency, created_at: new Date().toISOString() } : null;
}

/**
 * Get all supported currencies as an array
 * @returns Array of all supported currencies
 */
export function getAllSupportedCurrencies(): Currency[] {
  return Object.values(SUPPORTED_CURRENCIES).map(currency => ({
    ...currency,
    created_at: new Date().toISOString()
  }));
}

/**
 * Check if a currency code is supported
 * @param currencyCode - The ISO 4217 currency code to check
 * @returns True if supported, false otherwise
 */
export function isSupportedCurrency(currencyCode: string): boolean {
  return currencyCode in SUPPORTED_CURRENCIES;
} 