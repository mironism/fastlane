import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { VendorWithMenu } from '@/lib/types';

export function useVendor(vendorId: string) {
  const [vendor, setVendor] = useState<VendorWithMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchVendorData() {
    

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
            vendor_id,
            activities (
              id,
              title,
              description,
              price,
              image_url,
              vendor_id,
              category_id,
              duration_minutes,
              meeting_point,
              requirements,
              max_participants
            )
          )
        `)
        .eq('id', vendorId)
        .single();

      if (error || !data) {
        setError(true);
      } else {
        const transformedCategories = data.categories
          .filter(category => category.activities.length > 0)
          .map(category => ({
            ...category,
            activities: category.activities
          }));
        
        setVendor({ 
          ...data, 
          categories: transformedCategories 
        } as VendorWithMenu);
      }
      
      setLoading(false);
    }

    fetchVendorData();
  }, [vendorId]);

  return { vendor, loading, error };
} 