'use client';

import { useCartStore } from '@/hooks/use-cart-store';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ChevronRight } from 'lucide-react';

interface CartIndicatorProps {
  onOpenCart: () => void;
}

export function CartIndicator({ onOpenCart }: CartIndicatorProps) {
  const { items, totalPrice } = useCartStore();

  // Don't show if cart is empty
  if (items.length === 0) return null;

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-6 md:max-w-md md:bottom-6">
      <div className="bg-blue-600 text-white rounded-xl shadow-2xl border border-blue-500 overflow-hidden">
        <div className="flex items-center justify-between gap-3 p-4 md:justify-start md:gap-8 md:px-6 md:py-5">
          {/* Cart Icon */}
          <div className="relative flex-shrink-0">
            <ShoppingCart className="h-6 w-6 md:h-7 md:w-7" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 md:h-6 md:w-6 flex items-center justify-center font-bold md:text-sm">
                {totalItems}
              </span>
            )}
          </div>
          
          {/* Total Price */}
          <div className="font-semibold text-lg md:text-xl">
            €{totalPrice().toFixed(2)}
          </div>
          
          {/* View Cart Button */}
          <Button
            onClick={onOpenCart}
            size="sm"
            variant="secondary"
            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold flex-shrink-0 md:px-4 md:py-2"
          >
            View Cart
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5 ml-1" />
          </Button>
        </div>
        
        {/* Pulse animation */}
        <div className="h-1 bg-blue-500">
          <div className="h-full bg-white/30 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
} 