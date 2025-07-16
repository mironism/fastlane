'use client';

import { createContext, useContext, ReactNode } from 'react';
import { Currency, CurrencyContextType } from '@/lib/types';
import { 
  formatCurrency, 
  getCurrencySymbol, 
  getCurrency,
  SUPPORTED_CURRENCIES,
  SupportedCurrencyCode
} from '@/lib/currency';

// Create the currency context
const CurrencyContext = createContext<CurrencyContextType>({
  currency: SUPPORTED_CURRENCIES.EUR,
  formatPrice: (price: number) => formatCurrency(price, 'EUR'),
  formatCurrency: (amount: number, currencyCode?: string) => formatCurrency(amount, currencyCode || 'EUR'),
});

// Custom hook to use the currency context
export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

// Currency provider component
export function CurrencyProvider({ 
  children, 
  currencyCode = 'EUR' 
}: { 
  children: ReactNode;
  currencyCode?: string;
}) {
  // Get currency info or fallback to EUR
  const currencyInfo = getCurrency(currencyCode) || SUPPORTED_CURRENCIES.EUR;
  
  // Format price using the current currency
  const formatPrice = (price: number): string => {
    return formatCurrency(price, currencyInfo.code);
  };
  
  // Format currency with optional currency code override
  const formatCurrencyWithCode = (amount: number, overrideCurrencyCode?: string): string => {
    const codeToUse = overrideCurrencyCode || currencyInfo.code;
    return formatCurrency(amount, codeToUse);
  };
  
  const value: CurrencyContextType = {
    currency: currencyInfo,
    formatPrice,
    formatCurrency: formatCurrencyWithCode,
  };
  
  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

// Helper hook to get currency symbol
export const useCurrencySymbol = (currencyCode?: string) => {
  const { currency } = useCurrency();
  return getCurrencySymbol(currencyCode || currency.code);
};

// Helper hook to get all supported currencies
export const useSupportedCurrencies = () => {
  return Object.values(SUPPORTED_CURRENCIES);
}; 