'use client'

import Image from 'next/image'
import { useCartStore } from '@/hooks/use-cart-store'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCheckout } from '@/hooks/use-checkout'

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
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
        </SheetHeader>
        <Separator />
        {items.length > 0 ? (
          <>
            <div className="flex-1 overflow-y-auto">
              <ul className="divide-y">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center gap-4 py-4">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-sm">
                      <Image
                        src={item.image_url || '/placeholder.svg'}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
            <Separator />
            <SheetFooter className="mt-4">
              <div className="w-full space-y-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${totalPrice().toFixed(2)}</span>
                </div>
                <Button className="w-full" onClick={() => handleCheckout(vendorId)} disabled={isSubmitting}>
                  {isSubmitting ? 'Processing...' : 'Proceed to Checkout'}
                </Button>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
} 