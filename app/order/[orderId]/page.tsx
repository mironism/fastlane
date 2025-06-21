'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Booking } from '@/lib/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Phone, Mail, MessageCircle } from 'lucide-react';

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

          {/* Booking Details */}
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-sm">Booking Details</h3>
            
            <div className="space-y-3 text-sm">
              {/* Date and Time */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{format(new Date(booking.booking_date), "EEEE, MMMM d, yyyy")}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{format(new Date(`2000-01-01T${booking.booking_time}`), "h:mm a")}</span>
              </div>

              {/* Participants */}
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{booking.participant_count} participant{booking.participant_count > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-sm">Contact Information</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="break-all">{booking.customer_email}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{booking.customer_phone}</span>
              </div>

              {booking.customer_whatsapp && (
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.customer_whatsapp}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dashed separator */}
          <div className="border-b-2 border-dashed border-gray-300" />

          {/* Booked Activities */}
          <div className="space-y-6">
            <h3 className="font-semibold text-sm">Booked Activities</h3>
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

          {/* Dashed separator */}
          <div className="border-b-2 border-dashed border-gray-300" />

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg">Total</span>
            <span className="font-mono font-bold text-lg">${booking.total_price.toFixed(2)}</span>
          </div>

          {/* Footer */}
          <div className="space-y-6">
            <div className="border-b-2 border-dashed border-gray-300" />
            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">Please show this confirmation to the activity provider</p>
              <p className="text-xs text-muted-foreground font-semibold">THANK YOU FOR YOUR BOOKING! 🏖️</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 