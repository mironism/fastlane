'use client'

import { useEffect, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ScanLine, CheckCircle, RotateCcw } from 'lucide-react'
import { useOrders } from '@/hooks/use-orders'
import { Order } from '@/lib/types'

export function OrderVerification() {
  const { loading, unfulfilledOrders, fulfilledOrders, fulfillOrder, unfulfillOrder } = useOrders();
  const [scannerOpen, setScannerOpen] = useState(false);

  // Handle QR code scanner setup
  useEffect(() => {
    if (!scannerOpen) return
    
    // The library requires the DOM element to be ready, hence the timeout.
    const timeoutId = setTimeout(() => {
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
    }, 100);

    return () => clearTimeout(timeoutId);

  }, [scannerOpen, unfulfilledOrders, fulfillOrder]);

  const renderOrderList = (orders: Order[], isFulfilledList: boolean) => (
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
                {!isFulfilledList ? (
                  <Button variant="outline" size="sm" onClick={() => fulfillOrder(order.id)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Fulfilled
                  </Button>
                ) : (
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
                {renderOrderList(unfulfilledOrders, false)}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="fulfilled-orders">
              <AccordionTrigger className="text-lg font-medium">Fulfilled Orders ({fulfilledOrders.length})</AccordionTrigger>
              <AccordionContent>
                {renderOrderList(fulfilledOrders, true)}
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