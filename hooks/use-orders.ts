'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Order } from '@/lib/types'

export function useOrders() {
  const supabase = createClient()
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [vendorId, setVendorId] = useState<string | null>(null);

  // Memoize orders into unfulfilled and fulfilled lists
  const { unfulfilledOrders, fulfilledOrders } = useMemo(() => {
    const unfulfilled = allOrders
      .filter(o => !o.is_fulfilled)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const fulfilled = allOrders
      .filter(o => o.is_fulfilled)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return { unfulfilledOrders: unfulfilled, fulfilledOrders: fulfilled };
  }, [allOrders]);

  // Fetch initial data and set up realtime subscription
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to view orders.");
        setLoading(false);
        return;
      }

      const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single();
      if (!vendor) {
        toast.error("Could not find your vendor profile.");
        setLoading(false);
        return;
      }
      setVendorId(vendor.id);

      const { data, error } = await supabase
        .from('orders')
        .select('*, order_details(*)') // Assuming order_details is a view or relation; if it is jsonb, '*, order_details' is fine
        .eq('vendor_id', vendor.id)
        .eq('is_paid', true)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to fetch initial orders.');
      } else {
        setAllOrders(data as Order[] || []);
      }
      setLoading(false);
    };

    initialize();
  }, [supabase]);
  
  // Set up Supabase real-time subscription
  useEffect(() => {
    if (!vendorId) return;

    const channel = supabase
      .channel('realtime-orders')
      .on<Order>(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'orders',
          filter: `vendor_id=eq.${vendorId}`
        },
        (payload) => {
          const newOrder = payload.new as Order;
          const oldOrder = payload.old as Order;

          if (payload.eventType === 'INSERT') {
            setAllOrders(currentOrders => [newOrder, ...currentOrders]);
            toast.info('New order received!');
          } else if (payload.eventType === 'UPDATE') {
             setAllOrders(currentOrders =>
              currentOrders.map(o => (o.id === newOrder.id ? newOrder : o))
            );
          } else if (payload.eventType === 'DELETE') {
             setAllOrders(currentOrders =>
              currentOrders.filter(o => o.id !== oldOrder.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, vendorId]);
  
  const fulfillOrder = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ is_fulfilled: true })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to update order.');
    } else {
      toast.success(`Order fulfilled!`);
      // UI will update via realtime subscription
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
      toast.info(`Order marked as unfulfilled.`);
      // UI will update via realtime subscription
    }
  };

  return { loading, unfulfilledOrders, fulfilledOrders, fulfillOrder, unfulfillOrder };
} 