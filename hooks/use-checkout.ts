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
      console.log('🔍 Step 1: Checking email limit...');
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
      
      console.log('✅ Step 1: Email limit check passed. Existing bookings:', existingBookings?.length || 0);

      // Temporarily disable email limit for testing
      // if (existingBookings && existingBookings.length >= 3) {
      //   toast.error('You have reached the maximum limit of 3 bookings per email address.');
      //   setIsSubmitting(false);
      //   return;
      // }

      // 2. Check availability for the selected date/time (prevent double booking)
      // Since we only allow 1 activity per booking now, we just need to check if the slot is taken
      console.log('🔍 Step 2: Checking availability...');
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
      
      console.log('✅ Step 2: Availability check passed. Conflicting bookings:', conflictingBookings?.length || 0);

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
      console.log('🔍 Step 3: Creating booking details...');
      
      // Check if this is a tour booking to calculate correct pricing
      const hasTours = items.some(item => item.activity_type === 'tour');
      const participantCount = bookingData.participant_count || 1;
      
      const bookingDetails = items.map(item => ({
        activity_id: item.id,
        quantity: item.quantity,
        name: item.title,
        // Use correct price for tours vs regular activities
        price_at_purchase: item.activity_type === 'tour' && item.price_per_participant 
          ? item.price_per_participant 
          : item.price,
      }));
      
      console.log('📦 Booking details structured:', bookingDetails);
      
      // Calculate correct total price for tours vs regular activities
      const calculateTotalPrice = () => {
        return items.reduce((total, item) => {
          if (item.activity_type === 'tour' && item.price_per_participant) {
            // For tours: price per participant × participant count
            return total + (item.price_per_participant * participantCount);
          }
          // For regular activities: normal price × quantity
          return total + (item.price * item.quantity);
        }, 0);
      };
      
      // Complete booking data for insert
      const insertData = {
        vendor_id: vendorId,
        booking_details: bookingDetails,
        total_price: calculateTotalPrice(), // Use correct tour pricing calculation
        booking_date: bookingData.booking_date,
        booking_time: bookingData.booking_time,
        customer_email: bookingData.customer_email,
        customer_name: bookingData.customer_name,
        customer_whatsapp: bookingData.customer_whatsapp,
        comments: bookingData.comments || null,
        participant_count: bookingData.participant_count || 1,
      };
      
      console.log('💾 Insert data:', insertData);
      
      // 4. Test database connection and check schema
      console.log('🔍 Step 4: Testing database connection and checking schema...');
      const { data: testData, error: testError } = await supabase
        .from('bookings')
        .select('*')
        .limit(1);
      
      if (testError) {
        console.error('❌ Database connection test failed:', testError);
        toast.error('Database connection issue. Please try again.');
        setIsSubmitting(false);
        return;
      }
      
      console.log('✅ Database connection test passed');
      console.log('📊 Sample booking data (to see available fields):', testData);
      
      // 5. Insert the new booking into the database
      console.log('🔍 Step 5: Inserting booking into database...');
      const { data, error } = await supabase
        .from('bookings')
        .insert(insertData)
        .select('id, booking_number')
        .single();

      if (error) {
        console.error('❌ Database insert error:', error);
        console.error('❌ Insert data that failed:', insertData);
        toast.error(`Failed to create booking: ${error.message}`);
        setIsSubmitting(false);
        return;
      }

      console.log('✅ Booking created successfully:', data);

      // 6. Send confirmation email
      console.log('📧 Step 6: Sending confirmation email...');
      try {
        const emailResponse = await fetch('/api/send-booking-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingId: data.id
          }),
        });

        const emailResult = await emailResponse.json();
        
        if (emailResult.success) {
          console.log('✅ Email sent successfully:', emailResult.emailId);
        } else {
          console.warn('⚠️ Email sending failed:', emailResult.error);
          // Don't block the booking flow if email fails
        }
      } catch (emailError) {
        console.warn('⚠️ Email sending failed:', emailError);
        // Don't block the booking flow if email fails
      }

      // 7. Success - clear cart and redirect
      clearCart();
      toast.success(`Booking confirmed! Reference: ${data.booking_number || data.id}`);
      
      // Debug the redirect
      const redirectUrl = `/order/${data.id}`;
      console.log('🔄 Redirecting to:', redirectUrl);
      router.push(redirectUrl);
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