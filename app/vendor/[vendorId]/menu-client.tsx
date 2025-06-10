'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button';
import { ShoppingCartIcon, PlusCircle } from 'lucide-react';
import { useCartStore } from '@/hooks/use-cart-store';
import { ShoppingCart } from '@/components/cart/shopping-cart';
import { VendorWithMenu, Category, MenuItem } from '@/lib/types';

export function MenuClient({ vendor }: { vendor: VendorWithMenu }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const addItemToCart = useCartStore((state) => state.addItem);
  const totalItems = useCartStore((state) => state.totalItems());

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      <ShoppingCart open={isCartOpen} onOpenChange={setIsCartOpen} vendorId={vendor.id} />
      <div className="container mx-auto max-w-2xl p-4">
        {/* Page Header with Cart Button */}
        <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-b z-10">
          <header className="container mx-auto max-w-2xl flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-4">
                <div className="relative h-8 w-8 rounded-full">
                    <Image
                        src={vendor.profile_picture_url || '/default-avatar.png'}
                        alt={`${vendor.name || 'Vendor'} profile picture`}
                        fill
                        className="rounded-full object-cover"
                        sizes="32px"
                    />
                </div>
                <h1 className="text-xl font-bold truncate">{vendor.name || 'Vendor Menu'}</h1>
            </div>
            <Button variant="ghost" size="icon" className="relative" onClick={() => setIsCartOpen(true)}>
              <ShoppingCartIcon className="h-6 w-6" />
              {isMounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full h-5 w-5 text-xs flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </header>
        </div>

        {/* Spacer for fixed header */}
        <div className="h-16" /> 

        {/* Menu Section */}
        <main className="mt-8">
          {vendor.categories.map((category) => (
            <section key={category.id} className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{category.name}</h2>
              <div className="grid gap-4">
                {category.menu_items.map((item) => (
                  <Card key={item.id} className="flex flex-row overflow-hidden">
                    <div className="flex-1 p-4">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      {item.description && <CardDescription className="mt-1">{item.description}</CardDescription>}
                      <p className="font-semibold mt-2">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center p-4">
                        {item.image_url && (
                          <div className="relative w-24 h-24 flex-shrink-0 mr-4">
                            <Image
                              src={item.image_url}
                              alt={item.title}
                              fill
                              className="object-cover rounded-md"
                              sizes="96px"
                            />
                          </div>
                        )}
                        <Button variant="outline" size="icon" onClick={() => addItemToCart(item)}>
                            <PlusCircle className="h-6 w-6" />
                        </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>
    </>
  );
} 