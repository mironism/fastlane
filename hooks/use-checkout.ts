'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/hooks/use-cart-store';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function useCheckout() {
  const { items, totalPrice, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleCheckout = async (vendorId: string) => {
    if (items.length === 0) {
        toast.error("Your cart is empty.");
        return;
    }

    setIsSubmitting(true);
    
    // 1. Structure the order details from cart items
    const orderDetails = items.map(item => ({
      menu_item_id: item.id,
      quantity: item.quantity,
      name: item.title,
      price_at_purchase: item.price,
    }));
    
    // 2. Insert the new order into the database
    const { data, error } = await supabase
      .from('orders')
      .insert({
        vendor_id: vendorId,
        order_details: orderDetails,
        total_price: totalPrice(),
        is_paid: true, // This simulates a successful payment for the MVP
      })
      .select('id')
      .single();

    if (error) {
      toast.error('Failed to create order. Please try again.');
      console.error(error);
      setIsSubmitting(false);
      return;
    }

    // 3. On success, clear the cart and redirect to the confirmation page
    clearCart();
    router.push(`/order/${data.id}`);
  };

  return { isSubmitting, handleCheckout };
} 