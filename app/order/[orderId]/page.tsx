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
;
  const params = useParams();
  const bookingId = params.orderId as string; // Keep orderId for backward compatibility

  useEffect(() => {
    const checkBooking = async () => {
      if (!bookingId) {
        setLoading(false);
        return;
      };

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();
      
      if (error || !data) {
        setBooking(null);
      } else {
        setBooking(data);
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
    <div className="container mx-auto max-w-md p-4 flex justify-center items-center min-h-screen">
      <Card className="w-full shadow-xl">
        {/* Booking Header */}
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-mono">
            BOOKING {booking.booking_number}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(booking.created_at), "MMM d, yyyy 'at' h:mm a")}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Status */}
          <div className="flex justify-center">
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
                      {item.quantity} × ${item.price_at_purchase.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-mono font-medium ml-4">
                    ${(item.quantity * item.price_at_purchase).toFixed(2)}
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
                <span className="font-medium">{format(new Date(`2000-01-01T${booking.booking_time}`), "h:mm a")}</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-2 border-t border-primary/20">
              <span className="font-bold text-lg">Total</span>
              <span className="font-mono font-bold text-lg">${booking.total_price.toFixed(2)}</span>
            </div>
          </div>

          {/* 2. NEXT STEPS */}
          <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">→</span>
              Next Steps
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                <p><strong>Arrive 15 minutes early</strong> at the meeting point for check-in</p>
              </div>
              
              <div className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                <p><strong>Bring cash or card</strong> for payment (payment due at location)</p>
              </div>
              
              <div className="flex items-start gap-2">
                <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                <p><strong>Show this confirmation</strong> to the activity provider</p>
              </div>
            </div>

            {/* Booking Conditions Reminder */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
              <h5 className="text-xs font-semibold text-amber-800 mb-2">Important Reminder</h5>
              <p className="text-xs text-amber-700">
                This booking is <strong>not financially binding</strong>. Payment will be collected at the activity location.
              </p>
            </div>
          </div>

          {/* 3. LOCATION INFORMATION */}
          <div className="space-y-4 bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-600" />
              Location & Meeting Point
            </h3>
            
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                Meeting point details will be provided by the activity provider.
              </p>
              <p className="text-xs text-green-700">
                <strong>Tip:</strong> Contact the provider via WhatsApp for specific directions if needed.
              </p>
            </div>
          </div>

          {/* 4. CONTACT INFORMATION - Moved to bottom */}
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-sm">Your Contact Information</h3>
            
            <div className="space-y-3 text-sm">
              {booking.customer_name && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.customer_name}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="break-all">{booking.customer_email}</span>
              </div>
              
              {booking.customer_whatsapp && (
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.customer_whatsapp}</span>
                </div>
              )}

              {booking.comments && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-muted-foreground mb-1">Your Comments:</p>
                  <p className="text-sm">{booking.comments}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="space-y-6">
            <div className="border-b-2 border-dashed border-gray-300" />
            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">Please save this confirmation for your records</p>
              <p className="text-xs text-muted-foreground font-semibold">THANK YOU FOR YOUR BOOKING! 🏖️</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 