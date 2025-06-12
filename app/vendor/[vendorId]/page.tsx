'use client'

import { useState, use } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCartIcon, Plus, User, MapPin, Clock } from 'lucide-react';
import { useCartStore } from '@/hooks/use-cart-store';
import { ShoppingCart } from '@/components/orders/shopping-cart';
import { EmptyState } from '@/components/ui/empty-state';
import { useVendor } from '@/hooks/use-vendor';

export default function VendorPage({ 
  params 
}: { 
  params: Promise<{ vendorId: string }> 
}) {
  const { vendorId } = use(params);
  const { vendor, loading, error } = useVendor(vendorId);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const addItemToCart = useCartStore((state) => state.addItem);
  const totalItems = useCartStore((state) => state.totalItems());

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error || !vendor) {
    notFound();
  }

  return (
    <>
      <ShoppingCart open={isCartOpen} onOpenChange={setIsCartOpen} vendorId={vendor.id} />
      <div className="min-h-screen bg-gray-50/50">
        {/* Fixed Header */}
        <div className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-md border-b z-10 shadow-sm">
          <header className="container mx-auto max-w-3xl flex items-center justify-between h-14 px-4">
            <div className="flex items-center gap-3">
                <div className="relative h-9 w-9 rounded-full bg-muted flex items-center justify-center ring-2 ring-background shadow-sm">
                    {vendor.profile_picture_url ? (
                        <Image
                            src={vendor.profile_picture_url}
                            alt={`${vendor.name || 'Vendor'} profile picture`}
                            fill
                            className="rounded-full object-cover"
                            sizes="36px"
                        />
                    ) : (
                        <User className="h-5 w-5 text-muted-foreground" />
                    )}
                </div>
                <h1 className="text-lg font-semibold truncate">{vendor.name || 'Vendor Menu'}</h1>
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              className="relative shadow-sm hover:shadow-md transition-shadow h-9 w-9" 
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCartIcon className="h-4 w-4" />
              {totalItems > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </header>
        </div>

        {/* Spacer for fixed header */}
        <div className="h-14" /> 

        {/* Main Content */}
        <div className="container mx-auto max-w-3xl p-4">
          {/* Vendor Info Card */}
          {(vendor.description || vendor.location) && (
            <Card className="mb-4 p-0 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3">
                  {vendor.description && (
                    <p className="text-sm text-muted-foreground">{vendor.description}</p>
                  )}
                  {vendor.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{vendor.location}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Menu Section */}
          <main>
            {vendor.categories.length > 0 ? (
              vendor.categories.map((category, categoryIndex) => (
                <section key={category.id} className={categoryIndex > 0 ? "mt-4" : ""}>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">{category.name}</h2>
                  <div className="grid gap-2">
                    {category.menu_items.map((item) => (
                      <Card 
                        key={item.id} 
                        className="group hover:shadow-md transition-all duration-200 overflow-hidden border-gray-100 py-0"
                      >
                        <div className="flex items-center p-3">
                          {item.image_url && (
                            <div className="relative w-10 h-10 rounded-sm overflow-hidden bg-gray-100 flex-shrink-0 mr-3">
                              <Image
                                src={item.image_url}
                                alt={item.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-200"
                                sizes="40px"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0 flex items-center gap-3">
                            <div className="flex-1">
                              <h3 className="font-medium text-sm leading-tight truncate">{item.title}</h3>
                              {item.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <span className="font-semibold text-sm text-primary whitespace-nowrap">
                              ${item.price.toFixed(2)}
                            </span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 w-8 p-0 rounded-sm shadow-sm hover:shadow-md hover:bg-primary hover:text-primary-foreground transition-all ml-3"
                            onClick={() => addItemToCart(item)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <EmptyState message="No menu items available yet. Please check back later!" />
            )}
          </main>
        </div>
      </div>
    </>
  );
} 