'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/hooks/use-cart-store';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

// FastLane booking data interface
export interface BookingData {
  booking_date: string; // YYYY-MM-DD format
  booking_time: string; // HH:MM format
  customer_name: string;
  customer_email: string;
  customer_whatsapp: string; // Now required
  comments?: string;
  participant_count: number;
}

export function useCheckout() {
  const { items, totalPrice, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();


  const handleBooking = async (vendorId: string, bookingData: BookingData) => {
    console.log('🚀 Starting booking creation...');
    console.log('📝 Vendor ID:', vendorId);
    console.log('📝 Booking data:', bookingData);
    console.log('📝 Cart items:', items);
    
    if (items.length === 0) {
        toast.error("No activities selected.");
        return;
    }

    // Validate required booking fields
    if (!bookingData.booking_date || !bookingData.booking_time || 
        !bookingData.customer_name || !bookingData.customer_email || !bookingData.customer_whatsapp) {
        toast.error("Please fill in all required booking information.");
        return;
    }

    setIsSubmitting(true);
    
    try {
      // 1. Check email booking limit (max 3 bookings per email)
      const { data: existingBookings, error: emailCheckError } = await supabase
        .from('bookings')
        .select('id')
        .eq('customer_email', bookingData.customer_email)
        .eq('vendor_id', vendorId);

      if (emailCheckError) {
        console.error('❌ Email check error:', emailCheckError);
        toast.error('Unable to validate booking limit. Please try again.');
        setIsSubmitting(false);
        return;
      }

      if (existingBookings && existingBookings.length >= 3) {
        toast.error('You have reached the maximum limit of 3 bookings per email address.');
        setIsSubmitting(false);
        return;
      }

      // 2. Check availability for the selected date/time (prevent double booking)
      // Since we only allow 1 activity per booking now, we just need to check if the slot is taken
      const { data: conflictingBookings, error: availabilityError } = await supabase
        .from('bookings')
        .select('id, booking_details')
        .eq('vendor_id', vendorId)
        .eq('booking_date', bookingData.booking_date)
        .eq('booking_time', bookingData.booking_time);

      if (availabilityError) {
        console.error('❌ Availability check error:', availabilityError);
        toast.error('Unable to check availability. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Check if any of the conflicting bookings include our selected activity
      if (conflictingBookings && conflictingBookings.length > 0) {
        for (const conflictBooking of conflictingBookings) {
          const conflictDetails = Array.isArray(conflictBooking.booking_details) 
            ? conflictBooking.booking_details 
            : [conflictBooking.booking_details];
          
          // Check if any of our selected activities conflict
          for (const item of items) {
            const hasConflict = conflictDetails.some((detail: any) => 
              detail.activity_id === item.id
            );
            
            if (hasConflict) {
              toast.error(`Sorry, this time slot is already booked for ${item.title}. Please choose a different time.`);
              setIsSubmitting(false);
              return;
            }
          }
        }
      }

      // 3. All checks passed, proceed with booking creation
      const bookingDetails = items.map(item => ({
        activity_id: item.id,
        quantity: item.quantity,
        name: item.title,
        price_at_purchase: item.price,
      }));
      
      console.log('📦 Booking details structured:', bookingDetails);
      
      const insertData = {
        vendor_id: vendorId,
        booking_details: bookingDetails,
        total_price: totalPrice(),
        is_paid: false,
        booking_date: bookingData.booking_date,
        booking_time: bookingData.booking_time,
        customer_name: bookingData.customer_name,
        customer_email: bookingData.customer_email,
        customer_whatsapp: bookingData.customer_whatsapp,
        comments: bookingData.comments,
        participant_count: bookingData.participant_count,
      };
      
      console.log('💾 Insert data:', insertData);
      
      // 4. Insert the new booking into the database
      const { data, error } = await supabase
        .from('bookings')
        .insert(insertData)
        .select('id, booking_number')
        .single();

      if (error) {
        console.error('❌ Database insert error:', error);
        toast.error('Failed to create booking. Please try again.');
        setIsSubmitting(false);
        return;
      }

      console.log('✅ Booking created successfully:', data);

      // 5. Success - clear cart and redirect
      clearCart();
      toast.success(`Booking confirmed! Reference: ${data.booking_number || data.id}`);
      router.push(`/order/${data.id}`);
      setIsSubmitting(false);
      
    } catch (error) {
      console.error('❌ Unexpected booking error:', error);
      toast.error('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Legacy method for backward compatibility
  const handleCheckout = async (vendorId: string) => {
    toast.error("Please use the new booking flow with date and contact information.");
  };

  return { isSubmitting, handleBooking, handleCheckout };
} 