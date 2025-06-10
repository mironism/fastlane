'use client'

import { useEffect, useState, useMemo } from 'react'
import { Html5QrcodeScanner, Html5QrcodeResult } from 'html5-qrcode'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ScanLine, CheckCircle, RotateCcw } from 'lucide-react'

// Define the shape of our data
type Order = {
  id: string
  created_at: string
  total_price: number
  is_fulfilled: boolean
  order_details: { name: string; quantity: number }[]
}

export function OrderVerification() {
  const supabase = createClient()
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [scannerOpen, setScannerOpen] = useState(false)
  
  const { unfulfilledOrders, fulfilledOrders } = useMemo(() => {
    const unfulfilled = allOrders.filter(o => !o.is_fulfilled).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const fulfilled = allOrders.filter(o => o.is_fulfilled).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return { unfulfilledOrders: unfulfilled, fulfilledOrders: fulfilled };
  }, [allOrders]);

  // Fetch initial data and set up realtime subscription
  useEffect(() => {
    const fetchInitialOrders = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single()
      if (!vendor) return

      const { data, error } = await supabase
        .from('orders')
        .select('id, created_at, total_price, is_fulfilled, order_details')
        .eq('vendor_id', vendor.id)
        .eq('is_paid', true)
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('Failed to fetch initial orders.')
      } else {
        setAllOrders(data || [])
      }
      setLoading(false)
    }

    fetchInitialOrders()

    const channel = supabase
      .channel('realtime-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          setAllOrders(currentOrders => [payload.new as Order, ...currentOrders])
          toast.info('New order received!')
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])
  
  // Fulfill order logic (used by both scan and manual button)
  const fulfillOrder = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ is_fulfilled: true })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to update order.');
    } else {
      toast.success(`Order ${orderId.substring(0, 8)}... fulfilled!`);
      // Update the client-side state for an instant UI change
      setAllOrders(currentOrders =>
        currentOrders.map(o =>
          o.id === orderId ? { ...o, is_fulfilled: true } : o
        )
      );
    }
  };
  
  const unfulfillOrder = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ is_fulfilled: false })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to update order.');
    } else {
      toast.success(`Order ${orderId.substring(0, 8)}... marked as unfulfilled.`);
      setAllOrders(currentOrders =>
        currentOrders.map(o =>
          o.id === orderId ? { ...o, is_fulfilled: false } : o
        )
      );
    }
  };

  // Handle QR code scanner setup
  useEffect(() => {
    if (!scannerOpen) return
    
    const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: { width: 250, height: 250 } }, false)

    const onScanSuccess = async (decodedText: string) => {
      scanner.clear()
      setScannerOpen(false)
      const order = unfulfilledOrders.find(o => o.id === decodedText)
      if (order) {
        await fulfillOrder(decodedText);
      } else {
        toast.error('Order not found or already fulfilled.')
      }
    }
    
    scanner.render(onScanSuccess, () => {})

    return () => {
      scanner.clear().catch(err => console.error("Failed to clear scanner", err));
    }
  }, [scannerOpen, unfulfilledOrders, supabase]);

  const renderOrderList = (orders: Order[]) => (
    <div className="border rounded-lg">
      {orders.length > 0 ? (
        <ul className="divide-y">
          {orders.map(order => (
            <li key={order.id} className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono text-sm">#{order.id.substring(0, 8)}</p>
                  <p className="font-semibold text-lg">${order.total_price.toFixed(2)}</p>
                </div>
                {!order.is_fulfilled && (
                  <Button variant="outline" size="sm" onClick={() => fulfillOrder(order.id)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Fulfilled
                  </Button>
                )}
                {order.is_fulfilled && (
                  <Button variant="secondary" size="sm" onClick={() => unfulfillOrder(order.id)}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Mark as Unfulfilled
                  </Button>
                )}
              </div>
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                {order.order_details.map((detail, index) => (
                  <li key={index}>{detail.quantity}x {detail.name}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : <p className="text-center text-muted-foreground p-8">No orders in this category.</p>}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Live Orders</CardTitle>
            <CardDescription>New paid orders will appear here automatically.</CardDescription>
          </div>
          <Button onClick={() => setScannerOpen(true)}>
            <ScanLine className="mr-2 h-4 w-4" /> Scan to Verify
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? <p className="text-center p-4">Loading orders...</p> : (
          <Accordion type="multiple" defaultValue={['new-orders']} className="w-full">
            <AccordionItem value="new-orders">
              <AccordionTrigger className="text-lg font-medium">New Orders ({unfulfilledOrders.length})</AccordionTrigger>
              <AccordionContent>
                {renderOrderList(unfulfilledOrders)}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="fulfilled-orders">
              <AccordionTrigger className="text-lg font-medium">Fulfilled Orders ({fulfilledOrders.length})</AccordionTrigger>
              <AccordionContent>
                {renderOrderList(fulfilledOrders)}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>

      <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Scan Customer QR Code</DialogTitle></DialogHeader>
          <div id="qr-reader" className="w-full"></div>
        </DialogContent>
      </Dialog>
    </Card>
  )
} 