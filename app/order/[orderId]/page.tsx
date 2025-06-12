'use client'

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Order } from '@/lib/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

function OrderConfirmationSkeleton() {
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

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const params = useParams();
  const orderId = params.orderId as string;

  useEffect(() => {
    const checkOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      };

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (error || !data) {
        setOrder(null);
      } else {
        setOrder(data);
      }
      setLoading(false);
    };
    checkOrder();
  }, [orderId, supabase]);

  if (loading) {
    return <OrderConfirmationSkeleton />;
  }

  if (!order) {
    return notFound();
  }

  return (
    <div className="container mx-auto max-w-md p-4 flex justify-center items-center min-h-screen">
      <Card className="w-full shadow-xl">
        {/* Receipt Header */}
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-mono">
            ORDER #{order.id.substring(0, 8).toUpperCase()}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(order.created_at), "MMM d, yyyy 'at' h:mm a")}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Status */}
          <div className="flex justify-center">
            <Badge 
              variant={order.is_fulfilled ? "default" : "secondary"}
              className="font-mono text-xs"
            >
              {order.is_fulfilled ? "FULFILLED" : "PENDING"}
            </Badge>
          </div>

          {/* Dashed separator */}
          <div className="border-b-2 border-dashed border-gray-300" />

          {/* Order Items */}
          <div className="space-y-6">
            {order.order_details.map((item, index) => (
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
            <span className="font-mono font-bold text-lg">${order.total_price.toFixed(2)}</span>
          </div>

          {/* Footer */}
          <div className="space-y-6">
            <div className="border-b-2 border-dashed border-gray-300" />
            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">Please show this receipt to collect your order</p>
              <p className="text-xs text-muted-foreground font-semibold">THANK YOU FOR YOUR ORDER 🥰</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 