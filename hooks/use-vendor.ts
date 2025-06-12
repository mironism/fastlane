import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { VendorWithMenu } from '@/lib/types';

export function useVendor(vendorId: string) {
  const [vendor, setVendor] = useState<VendorWithMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchVendorData() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('vendors')
        .select(`
          id,
          name,
          description,
          location,
          profile_picture_url,
          user_id,
          created_at,
          categories (
            id,
            name,
            menu_items (
              id,
              title,
              description,
              price,
              image_url,
              vendor_id,
              category_id
            )
          )
        `)
        .eq('id', vendorId)
        .single();

      if (error || !data) {
        setError(true);
      } else {
        const categoriesWithItems = data.categories.filter(category => category.menu_items.length > 0);
        setVendor({ ...data, categories: categoriesWithItems } as VendorWithMenu);
      }
      
      setLoading(false);
    }

    fetchVendorData();
  }, [vendorId]);

  return { vendor, loading, error };
} 