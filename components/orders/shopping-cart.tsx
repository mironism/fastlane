'use client'

import Image from 'next/image'
import { useCartStore } from '@/hooks/use-cart-store'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Minus, Plus, X } from 'lucide-react'
import { useCheckout } from '@/hooks/use-checkout'
import { Card } from '@/components/ui/card'

export function ShoppingCart({
  open,
  onOpenChange,
  vendorId
}: {
  open: boolean,
  onOpenChange: (open: boolean) => void,
  vendorId: string
}) {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore()
  const { isSubmitting, handleCheckout } = useCheckout();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col p-0 gap-0 w-full sm:max-w-md">
        <SheetHeader className="p-3 border-b">
          <SheetTitle className="text-lg font-semibold">Your Cart</SheetTitle>
        </SheetHeader>
        
        {items.length > 0 ? (
          <>
            <div className="flex-1 overflow-y-auto p-3">
              <div className="space-y-2">
                {items.map((item) => (
                  <Card key={item.id} className="p-3">
                    <div className="flex items-center gap-3">
                      {item.image_url && (
                        <div className="relative w-10 h-10 rounded-sm overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={item.image_url}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{item.title}</h3>
                        <p className="text-xs text-muted-foreground">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <button
                          className="h-5 w-5 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-medium tabular-nums">{item.quantity}</span>
                        <button
                          className="h-5 w-5 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            
            <div className="border-t bg-gray-50/50 p-3 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-primary">Total</span>
                <span className="text-lg font-semibold text-primary">${totalPrice().toFixed(2)}</span>
              </div>
              <Button 
                className="w-full rounded-sm" 
                size="lg"
                onClick={() => handleCheckout(vendorId)} 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Proceed to Checkout'}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8">
            <p className="text-muted-foreground text-sm">Your cart is empty</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
} 