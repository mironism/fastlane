'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Clock, Users, Mail, MapPin, MessageCircle } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { formatTimeWithoutSeconds } from '@/lib/utils'

interface SimpleBooking {
  id: string
  customer_email: string
  booking_details: any
  total_price: number
  created_at: string
  is_fulfilled: boolean
  booking_date?: string
  booking_time?: string
  participant_count?: number
  customer_name?: string
  customer_whatsapp?: string
  comments?: string
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<SimpleBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          setError('Not authenticated')
          setLoading(false)
          return
        }
        
        // Get vendor
        const { data: vendor, error: vendorError } = await supabase
          .from('vendors')
          .select('id')
          .eq('user_id', user.id)
          .single()
        
        if (vendorError || !vendor) {
          setError('Vendor not found')
          setLoading(false)
          return
        }
        
        // Get bookings
        const { data, error: bookingsError } = await supabase
          .from('bookings')
          .select('*')
          .eq('vendor_id', vendor.id)
          .order('created_at', { ascending: false })
        
        if (bookingsError) {
          console.error('❌ Bookings error:', bookingsError)
          setError(`Failed to fetch bookings: ${bookingsError.message}`)
        } else {
          setBookings(data || [])
        }
        
      } catch (err) {
        console.error('❌ Unexpected error:', err)
        setError(`Unexpected error: ${err}`)
      } finally {
        setLoading(false)
      }
    }
    
    fetchBookings()
  }, [])

  const fulfillBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ is_fulfilled: true })
        .eq('id', bookingId)

      if (error) {
        toast.error('Failed to update booking')
      } else {
        toast.success('Booking marked as complete!')
        setBookings(prev => 
          prev.map(b => b.id === bookingId ? { ...b, is_fulfilled: true } : b)
        )
      }
    } catch (err) {
      toast.error('Failed to update booking')
    }
  }

  const unfulfillBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ is_fulfilled: false })
        .eq('id', bookingId)

      if (error) {
        toast.error('Failed to update booking')
      } else {
        toast.success('Booking marked as active!')
        setBookings(prev => 
          prev.map(b => b.id === bookingId ? { ...b, is_fulfilled: false } : b)
        )
      }
    } catch (err) {
      toast.error('Failed to update booking')
    }
  }

  const BookingCard = ({ booking }: { booking: SimpleBooking }) => {
    // Parse booking details
    const details = typeof booking.booking_details === 'string' 
      ? JSON.parse(booking.booking_details) 
      : booking.booking_details
    
    const detailsArray = Array.isArray(details) ? details : [details]

    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">
                #{booking.id.substring(0, 8)}
              </CardTitle>
              <Badge variant={booking.is_fulfilled ? "secondary" : "default"}>
                {booking.is_fulfilled ? "Completed" : "Active"}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {format(new Date(booking.created_at), "MMM d, h:mm a")}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Customer Info */}
            <div className="flex items-center gap-4 text-sm">
              {booking.customer_name && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">{booking.customer_name}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{booking.customer_email}</span>
              </div>
              {booking.customer_whatsapp && (
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.customer_whatsapp}</span>
                </div>
              )}
            </div>

            {/* Booking Details */}
            {(booking.booking_date || booking.booking_time || booking.participant_count) && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {booking.booking_date && booking.booking_time && (
                  <>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(booking.booking_date), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatTimeWithoutSeconds(booking.booking_time)}</span>
                    </div>
                  </>
                )}
                {booking.participant_count && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{booking.participant_count} guest{booking.participant_count > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            )}

            {/* Activities */}
            <div className="space-y-2">
              {detailsArray.map((detail, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="font-medium">
                    {booking.participant_count && booking.participant_count > 1
                      ? `${booking.participant_count} participants - ${detail.name}`
                      : `${detail.quantity}x ${detail.name}`}
                  </span>
                </div>
              ))}
            </div>

            {/* Price and Actions */}
            <div className="flex justify-between items-center pt-2 border-t">
              <div className="text-xl font-bold">
                €{booking.total_price?.toFixed(2) || '0.00'}
              </div>
              <div className="flex gap-2">
                {booking.is_fulfilled ? (
                  <Button variant="outline" size="sm" onClick={() => unfulfillBooking(booking.id)}>
                    Mark Active
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => fulfillBooking(booking.id)}>
                    Complete
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-muted-foreground">
            Manage your activity bookings and customer requests
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading bookings...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-muted-foreground">
            Manage your activity bookings and customer requests
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-500">
              <p>Error: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const activeBookings = bookings.filter(b => !b.is_fulfilled)
  const completedBookings = bookings.filter(b => b.is_fulfilled)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bookings</h1>
        <p className="text-muted-foreground">
          Manage your activity bookings and customer requests
        </p>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active Bookings ({activeBookings.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed Bookings ({completedBookings.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          {activeBookings.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No active bookings</h3>
                  <p>New bookings will appear here when customers book your activities.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div>
              {activeBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {completedBookings.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No completed bookings</h3>
                  <p>Completed bookings will appear here after you mark them as done.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div>
              {completedBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 