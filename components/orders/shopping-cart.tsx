'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useCartStore } from '@/hooks/use-cart-store'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Minus, Plus, X, Calendar as CalendarIcon, Users, Clock } from 'lucide-react'
import { useCheckout, BookingData } from '@/hooks/use-checkout'
import { Card } from '@/components/ui/card'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export function ShoppingCart({
  open,
  onOpenChange,
  vendorId
}: {
  open: boolean,
  onOpenChange: (open: boolean) => void,
  vendorId: string
}) {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore()
  const { isSubmitting, handleBooking } = useCheckout()
  
  // Booking form state
  const [bookingDate, setBookingDate] = useState<Date | undefined>(undefined)
  const [bookingTime, setBookingTime] = useState<string>('')
  const [customerEmail, setCustomerEmail] = useState<string>('')
  const [customerPhone, setCustomerPhone] = useState<string>('')
  const [customerWhatsapp, setCustomerWhatsapp] = useState<string>('')
  const [participantCount, setParticipantCount] = useState<number>(1)

  // Generate time slots (9 AM to 6 PM, every 30 minutes)
  const timeSlots = []
  for (let hour = 9; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
      timeSlots.push({ value: timeString, label: displayTime })
    }
  }

  const handleSubmitBooking = async () => {
    if (!bookingDate || !bookingTime || !customerEmail || !customerPhone) {
      return // Validation will be handled by the form
    }

    const bookingData: BookingData = {
      booking_date: format(bookingDate, 'yyyy-MM-dd'),
      booking_time: bookingTime,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      customer_whatsapp: customerWhatsapp || undefined,
      participant_count: participantCount
    }

    await handleBooking(vendorId, bookingData)
    
    // Reset form on success
    setBookingDate(undefined)
    setBookingTime('')
    setCustomerEmail('')
    setCustomerPhone('')
    setCustomerWhatsapp('')
    setParticipantCount(1)
    onOpenChange(false)
  }

  const isFormValid = bookingDate && bookingTime && customerEmail && customerPhone

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col p-0 gap-0 w-full sm:max-w-md">
        <SheetHeader className="p-3 border-b">
          <SheetTitle className="text-lg font-semibold">Book Activities</SheetTitle>
        </SheetHeader>
        
        {items.length > 0 ? (
          <>
            {/* Selected Activities */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium text-sm">Selected Activities</h3>
                {items.map((item) => (
                  <Card key={item.id} className="p-3">
                    <div className="flex items-center gap-3">
                      {item.image_url && (
                        <div className="relative w-10 h-10 rounded-sm overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={item.image_url}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">${item.price.toFixed(2)}</p>
                        {item.duration_minutes && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Clock className="h-3 w-3" />
                            <span>{item.duration_minutes}min</span>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Booking Details Form */}
              <div className="space-y-4 pt-2 border-t">
                <h3 className="font-medium text-sm">Booking Details</h3>
                
                {/* Date Picker */}
                <div className="space-y-2">
                  <Label htmlFor="date">Select Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !bookingDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {bookingDate ? format(bookingDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={bookingDate}
                        onSelect={setBookingDate}
                        disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time Picker */}
                <div className="space-y-2">
                  <Label htmlFor="time">Select Time *</Label>
                  <Select value={bookingTime} onValueChange={setBookingTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot.value} value={slot.value}>
                          {slot.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Participant Count */}
                <div className="space-y-2">
                  <Label htmlFor="participants">Number of Participants</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setParticipantCount(Math.max(1, participantCount - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1 px-3 py-1 border rounded-md min-w-16 justify-center">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{participantCount}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setParticipantCount(participantCount + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Contact Information</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+90 555 123 4567"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp (optional)</Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      placeholder="+90 555 123 4567"
                      value={customerWhatsapp}
                      onChange={(e) => setCustomerWhatsapp(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer with Total and Book Button */}
            <div className="border-t bg-gray-50/50 p-3 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-primary">Total</span>
                <span className="text-lg font-semibold text-primary">${totalPrice().toFixed(2)}</span>
              </div>
              <Button 
                className="w-full rounded-sm" 
                size="lg"
                onClick={handleSubmitBooking}
                disabled={isSubmitting || !isFormValid}
              >
                {isSubmitting ? 'Creating Booking...' : 'Confirm Booking'}
              </Button>
              {!isFormValid && (
                <p className="text-xs text-muted-foreground text-center">
                  Please fill in all required fields
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8">
            <p className="text-muted-foreground text-sm">No activities selected</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
} 