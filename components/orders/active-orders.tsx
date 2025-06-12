'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useOrders } from '@/hooks/use-orders'
import { Order } from '@/lib/types'
import { OrderCard } from './order-card'
import { Skeleton } from '../ui/skeleton'

export function ActiveOrders() {
  const { loading, unfulfilledOrders, fulfillOrder } = useOrders();

  const renderOrderList = (orders: Order[]) => (
    <div className="border rounded-lg">
      {orders.length > 0 ? (
        <ul className="divide-y">
          {orders.map(order => (
            <OrderCard 
              key={order.id} 
              order={order}
              actionSlot={
                <Button variant="outline" size="sm" onClick={() => fulfillOrder(order.id)}>
                  Done
                </Button>
              }
            />
          ))}
        </ul>
      ) : <p className="text-center text-muted-foreground p-8">No active orders</p>}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Orders</CardTitle>
        <CardDescription>Active paid orders will appear here automatically</CardDescription>
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
          renderOrderList(unfulfilledOrders)
        )}
      </CardContent>
    </Card>
  )
} 