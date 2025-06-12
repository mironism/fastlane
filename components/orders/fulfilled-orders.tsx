'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useOrders } from '@/hooks/use-orders'
import { Order } from '@/lib/types'
import { OrderCard } from './order-card'
import { Skeleton } from '../ui/skeleton'

export function FulfilledOrders() {
  const { loading, fulfilledOrders, unfulfillOrder } = useOrders();

  const renderOrderList = (orders: Order[]) => (
    <div className="border rounded-lg">
      {orders.length > 0 ? (
        <ul className="divide-y">
          {orders.map(order => (
             <OrderCard 
              key={order.id} 
              order={order}
              actionSlot={
                <Button variant="outline" size="sm" onClick={() => unfulfillOrder(order.id)}>
                  Re-Open
                </Button>
              }
            />
          ))}
        </ul>
      ) : <p className="text-center text-muted-foreground p-8">No fulfilled orders yet</p>}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fulfilled Orders</CardTitle>
        <CardDescription>Previously completed orders are shown here</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
           <div className="border rounded-lg">
            <ul className="divide-y">
              {[...Array(3)].map((_, i) => (
                <li key={i} className="flex flex-col gap-4 p-4">
                  <div className="flex justify-between gap-4">
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="space-y-2 text-sm">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                    </div>
                    <div className="flex flex-col justify-between items-end flex-shrink-0">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-9 w-20" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          renderOrderList(fulfilledOrders)
        )}
      </CardContent>
    </Card>
  )
} 