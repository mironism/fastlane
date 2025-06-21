'use client'

import { Booking } from '@/lib/types'
import { format } from 'date-fns'
import { Calendar, Clock, Users, Phone } from 'lucide-react'

interface BookingCardProps {
  order: Booking;
  actionSlot: React.ReactNode;
}

export function OrderCard({ order, actionSlot }: BookingCardProps) {
  // Handle booking_details - it might be a string or array
  const bookingDetails = typeof order.booking_details === 'string' 
    ? JSON.parse(order.booking_details) 
    : order.booking_details;
  
  // Ensure it's an array
  const detailsArray = Array.isArray(bookingDetails) ? bookingDetails : [bookingDetails];

  return (
    <li className="flex flex-col gap-4 p-4">
      <div className="flex justify-between gap-4">
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">#{order.booking_number || order.id.substring(0, 8)}</span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(order.created_at), "MMM d, h:mm a")}
            </span>
          </div>
          
          {/* Customer Email */}
          <div className="text-sm text-muted-foreground mb-2">
            {order.customer_email}
          </div>
          
          {/* Booking Details - Only show if FastLane fields exist */}
          {(order.booking_date || order.booking_time || order.participant_count || order.customer_phone) && (
            <div className="space-y-2 text-sm mb-3">
              {order.booking_date && order.booking_time && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(order.booking_date), "MMM d, yyyy")}</span>
                  <Clock className="h-3 w-3 ml-2" />
                  <span>{format(new Date(`2000-01-01T${order.booking_time}`), "h:mm a")}</span>
                </div>
              )}
              
              <div className="flex items-center gap-4 text-muted-foreground">
                {order.participant_count && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{order.participant_count} guest{order.participant_count > 1 ? 's' : ''}</span>
                  </div>
                )}
                {order.customer_phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span className="truncate max-w-32">{order.customer_phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Activities */}
          <ul className="space-y-1 text-sm">
            {detailsArray.map((detail, index) => (
              <li key={index} className="flex justify-between">
                <span>{detail.quantity}x {detail.name}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col justify-between items-end flex-shrink-0">
          <p className="font-bold text-lg">${order.total_price?.toFixed(2) || '0.00'}</p>
          {actionSlot}
        </div>
      </div>
    </li>
  )
} 