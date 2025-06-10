'use client'

import { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { createClient } from '@/lib/supabase/client';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Order } from '@/lib/types';

function OrderConfirmationSkeleton() {
    return (
        <div className="container mx-auto max-w-md p-4 flex justify-center items-center min-h-screen">
            <Card className="w-full text-center">
                <CardHeader>
                    <Skeleton className="h-8 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
                </CardHeader>
                <CardContent className="flex justify-center p-8">
                    <Skeleton className="h-64 w-64" />
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
      <Card className="w-full text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Payment Confirmed!</CardTitle>
          <CardDescription>
            Show this QR code to the vendor to redeem your order.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-8">
          <QRCodeCanvas
            value={order.id}
            size={256}
            level={"H"}
            includeMargin={true}
          />
        </CardContent>
      </Card>
    </div>
  );
} 