'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Booking } from '@/lib/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Mail, MessageCircle, MapPin, User } from 'lucide-react';
import { formatTimeWithoutSeconds } from '@/lib/utils';
import { CurrencyProvider, useCurrency } from '@/contexts/CurrencyContext';

// Inner component that uses currency context
function BookingContent({ booking, isTourBooking }: { booking: Booking; isTourBooking: boolean }) {
  const { formatPrice } = useCurrency();
  
  return (
    <Card className="w-full shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">
          Booking Confirmed ✓
        </CardTitle>
        <CardDescription className="text-base">
          Your booking has been successfully submitted
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Booking ID */}
        <div className="text-center">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            Booking ID
          </div>
          <div className="text-sm font-mono font-medium mt-1">
            {booking.booking_number}
          </div>
        </div>

        {/* Status */}
        <div className="text-center">
          <Badge 
            variant={booking.is_fulfilled ? "default" : "secondary"}
            className="font-mono text-xs"
          >
            {booking.is_fulfilled ? "CONFIRMED" : "PENDING"}
          </Badge>
        </div>

        {/* 1. BOOKED ACTIVITIES - Grouped at top */}
        <div className="space-y-4 bg-primary/5 p-4 rounded-lg">
          <h3 className="font-semibold text-sm">Booked Activities</h3>
          
          {/* Activity Details */}
          <div className="space-y-3">
            {booking.booking_details.map((item, index) => (
              <div key={index} className="flex justify-between items-start text-sm">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {booking.participant_count && booking.participant_count > 1 
                      ? `${booking.participant_count} participants × ${formatPrice(item.price_at_purchase)}/person`
                      : `${item.quantity} × ${formatPrice(item.price_at_purchase)}`}
                  </p>
                </div>
                <p className="font-mono font-medium ml-4">
                  {booking.participant_count && booking.participant_count > 1 
                    ? formatPrice(booking.participant_count * item.price_at_purchase)
                    : formatPrice(item.quantity * item.price_at_purchase)}
                </p>
              </div>
            ))}
          </div>

          {/* Date and Time */}
          <div className="space-y-2 pt-2 border-t border-primary/20">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-medium">{format(new Date(booking.booking_date), "EEEE, MMMM d, yyyy")}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-medium">{formatTimeWithoutSeconds(booking.booking_time)}</span>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-2 border-t border-primary/20">
            <span className="font-bold text-lg">Total</span>
            <span className="font-mono font-bold text-lg">{formatPrice(booking.total_price)}</span>
          </div>
        </div>

        {/* 2. NEXT STEPS */}
        <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">→</span>
            Next Steps
          </h3>
          
          <div className="space-y-3 text-sm">
            <p>
              <strong>1. Show this confirmation</strong> to the activity provider when you arrive
            </p>
            
            <p>
              <strong>2. Arrive 15 minutes early</strong> at the specified meeting point
            </p>
            
            <p>
              <strong>3. {isTourBooking ? 'Tour starts' : 'Activity begins'}</strong> at your scheduled time
            </p>
          </div>
        </div>

        {/* 3. CONTACT INFO */}
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <span className="bg-gray-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">i</span>
            Contact Information
          </h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Email:</span>
              <span className="font-mono text-xs">{booking.customer_email}</span>
            </div>
            
            {booking.customer_name && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Name:</span>
                <span>{booking.customer_name}</span>
              </div>
            )}
            
            {booking.customer_whatsapp && (
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">WhatsApp:</span>
                <span className="font-mono text-xs">{booking.customer_whatsapp}</span>
              </div>
            )}
            
            {booking.participant_count && booking.participant_count > 1 && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Participants:</span>
                <span>{booking.participant_count} people</span>
              </div>
            )}
          </div>
        </div>
        
        {/* 4. IMPORTANT NOTES */}
        <div className="space-y-4 bg-amber-50 p-4 rounded-lg">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <span className="bg-amber-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">!</span>
            Important Notes
          </h3>
          
          <div className="space-y-3 text-sm">
            <p>
              <strong>• Payment:</strong> This booking is not financially binding. Payment will be collected at the activity location.
            </p>
            
            <p>
              <strong>• Cancellation:</strong> Please contact the activity provider directly if you need to cancel or reschedule.
            </p>
            
            <p>
              <strong>• Weather:</strong> {isTourBooking ? 'Tours' : 'Activities'} may be cancelled due to weather conditions. You'll be notified in advance.
            </p>
          </div>
        </div>
        
        {/* 5. BOOKING SUMMARY */}
        {booking.comments && (
          <div className="space-y-4 bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">💬</span>
              Your Message
            </h3>
            
            <p className="text-sm italic">
              "{booking.comments}"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BookingConfirmationSkeleton() {
    return (
        <div className="container mx-auto max-w-md p-4 flex justify-center items-center min-h-screen">
            <Card className="w-full shadow-xl">
                <CardHeader className="text-center">
                    <Skeleton className="h-7 w-48 mx-auto" />
                    <Skeleton className="h-4 w-40 mt-2 mx-auto" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-5 w-20 mx-auto" />
                    <Skeleton className="h-px w-full" />
                    <div className="space-y-6">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                    <Skeleton className="h-px w-full" />
                    <Skeleton className="h-6 w-24 ml-auto" />
                </CardContent>
            </Card>
        </div>
    );
}

export default function BookingConfirmationPage() {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTourBooking, setIsTourBooking] = useState(false);
  const [vendorCurrency, setVendorCurrency] = useState<string>('EUR');
  const params = useParams();
  const bookingId = params.orderId as string; // Keep orderId for backward compatibility

  useEffect(() => {
    const checkBooking = async () => {
      if (!bookingId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();
      
      if (error || !data) {
        setBooking(null);
        setLoading(false);
        return;
      }

      setBooking(data);

      // Get vendor currency
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('currency')
        .eq('id', data.vendor_id)
        .single();
      
      if (vendorData && !vendorError) {
        setVendorCurrency(vendorData.currency || 'EUR');
      }

      // Check if this is a tour booking by looking up the activity details
      if (data.booking_details && data.booking_details.length > 0) {
        const firstActivityId = data.booking_details[0].activity_id;
        
        const { data: activityData, error: activityError } = await supabase
          .from('activities')
          .select('activity_type')
          .eq('id', firstActivityId)
          .single();
        
        if (!activityError && activityData?.activity_type === 'tour') {
          setIsTourBooking(true);
        }
      }
      
      setLoading(false);
    };
    checkBooking();
  }, [bookingId]);

  if (loading) {
    return <BookingConfirmationSkeleton />;
  }

  if (!booking) {
    return notFound();
  }

  return (
    <CurrencyProvider currencyCode={vendorCurrency}>
      <div className="container mx-auto max-w-md p-4 flex justify-center items-center min-h-screen">
        <BookingContent booking={booking} isTourBooking={isTourBooking} />
      </div>
    </CurrencyProvider>
  );
}
        {/* Booking Header */}
