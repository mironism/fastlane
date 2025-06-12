'use client'

import { Order } from '@/lib/types'
import { format } from 'date-fns'

interface OrderCardProps {
  order: Order;
  actionSlot: React.ReactNode;
}

export function OrderCard({ order, actionSlot }: OrderCardProps) {
  return (
    <li className="flex flex-col gap-4 p-4">
      <div className="flex justify-between gap-4">
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">#{order.id.substring(0, 8)}</span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(order.created_at), "MMM d, h:mm a")}
            </span>
          </div>
          <ul className="space-y-1 text-sm">
            {order.order_details.map((detail, index) => (
              <li key={index} className="flex justify-between">
                <span>{detail.quantity}x {detail.name}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col justify-between items-end flex-shrink-0">
          <p className="font-bold text-lg">${order.total_price.toFixed(2)}</p>
          {actionSlot}
        </div>
      </div>
    </li>
  )
} 