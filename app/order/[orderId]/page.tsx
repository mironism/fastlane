'use client'

import { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { createClient } from '@/lib/supabase/client';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function OrderConfirmationPage() {
  const [loading, setLoading] = useState(true);
  const [isValidOrder, setIsValidOrder] = useState(false);
  const supabase = createClient();
  const params = useParams();
  const orderId = params.orderId as string;

  useEffect(() => {
    const checkOrder = async () => {
      if (!orderId) return;

      const { data, error } = await supabase
        .from('orders')
        .select('id')
        .eq('id', orderId)
        .single();
      
      if (error || !data) {
        setIsValidOrder(false);
      } else {
        setIsValidOrder(true);
      }
      setLoading(false);
    };
    checkOrder();
  }, [orderId, supabase]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Verifying order...</div>;
  }

  if (!isValidOrder) {
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
            value={orderId}
            size={256}
            level={"H"}
            includeMargin={true}
          />
        </CardContent>
      </Card>
    </div>
  );
} 