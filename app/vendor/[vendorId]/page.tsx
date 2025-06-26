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
import { CalendarDays, Plus, User, MapPin, Clock, Check, X } from 'lucide-react';
import { useCartStore } from '@/hooks/use-cart-store';
import { ShoppingCart } from '@/components/orders/shopping-cart';
import { CartIndicator } from '@/components/orders/cart-indicator';
import { EmptyState } from '@/components/ui/empty-state';
import { useVendor } from '@/hooks/use-vendor';

export default function VendorPage({ 
  params 
}: { 
  params: Promise<{ vendorId: string }> 
}) {
  const { vendorId } = use(params);
  const { vendor, loading, error } = useVendor(vendorId);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const addItemToCart = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const cartItems = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.totalItems());
  
  const isActivityInCart = (activityId: string) => {
    return cartItems.some(item => item.id === activityId);
  };
  
  const hasItemsInCart = totalItems > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading activities...</p>
        </div>
      </div>
    );
  }

  if (error || !vendor) {
    notFound();
  }

  return (
    <>
      <ShoppingCart open={isBookingOpen} onOpenChange={setIsBookingOpen} vendorId={vendor.id} />
      <CartIndicator onOpenCart={() => setIsBookingOpen(true)} />
      <div className="min-h-screen bg-gray-50/50 pb-24">
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
                <h1 className="text-lg font-semibold truncate">{vendor.name || 'Beach Activities'}</h1>
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              className="relative shadow-sm hover:shadow-md transition-shadow h-9 w-9" 
              onClick={() => setIsBookingOpen(true)}
            >
              <CalendarDays className="h-4 w-4" />
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
          {/* Cover Image */}
          {vendor.cover_image_url && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4 shadow-sm">
              <Image
                src={vendor.cover_image_url}
                alt={`${vendor.name || 'Vendor'} cover image`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
            </div>
          )}

          {/* Vendor Info Card */}
          {(vendor.description || vendor.location) && (
            <Card className="mb-4 p-0 bg-background/60 border border-primary/30 rounded-lg">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3">
                  {/* How to Book Guide */}
                  {(vendor.how_to_book || vendor.description || vendor.location) && (
                    <div>
                      <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        How to Book
                      </h3>
                      <div className="text-xs text-muted-foreground space-y-1">
                        {vendor.how_to_book ? (
                          vendor.how_to_book.split('\n').map((line, index) => (
                            <p key={index}>{line}</p>
                          ))
                        ) : (
                          <>
                            <p><strong>1.</strong> Select your activities and tap the calendar icon</p>
                            <p><strong>2.</strong> Choose your date and time, then enter your details</p>
                            <p><strong>3.</strong> Confirm your booking and you're all set!</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  
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

          {/* Activities Section */}
          <main>
            {vendor.categories.length > 0 ? (
              vendor.categories.map((category, categoryIndex) => (
                <section key={category.id} className={categoryIndex > 0 ? "mt-4" : ""}>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">{category.name}</h2>
                  <div className="grid gap-2">
                    {category.activities.map((activity) => (
                      <Card 
                        key={activity.id} 
                        className="group hover:shadow-md transition-all duration-200 overflow-hidden border-gray-100 py-0"
                      >
                        <div className="flex items-center p-3">
                          {activity.image_url && (
                            <div className="relative w-10 h-10 rounded-sm overflow-hidden bg-gray-100 flex-shrink-0 mr-3">
                              <Image
                                src={activity.image_url}
                                alt={activity.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-200"
                                sizes="40px"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0 flex items-center gap-3">
                            <div className="flex-1">
                              <h3 className="font-medium text-sm leading-tight truncate">{activity.title}</h3>
                              {activity.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                  {activity.description}
                                </p>
                              )}
                              {/* Activity-specific details */}
                              <div className="flex items-center gap-2 mt-1">
                                {activity.duration_minutes && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>{activity.duration_minutes}min</span>
                                  </div>
                                )}
                                {activity.max_participants && (
                                  <div className="text-xs text-muted-foreground">
                                    Max {activity.max_participants} people
                                  </div>
                                )}
                              </div>
                            </div>
                            <span className="font-semibold text-sm text-primary whitespace-nowrap">
                              €{activity.price.toFixed(2)}
                            </span>
                          </div>
                          {isActivityInCart(activity.id) ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8 w-8 p-0 rounded-sm shadow-sm bg-green-50 border-green-200 text-green-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all ml-3"
                              onClick={() => removeItem(activity.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className={`h-8 w-8 p-0 rounded-sm shadow-sm transition-all ml-3 ${
                                hasItemsInCart 
                                  ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-400' 
                                  : 'hover:shadow-md hover:bg-primary hover:text-primary-foreground'
                              }`}
                              onClick={() => !hasItemsInCart && addItemToCart(activity)}
                              disabled={hasItemsInCart}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <EmptyState message="No activities available yet. Please check back later!" />
            )}
          </main>
        </div>
      </div>
    </>
  );
} 