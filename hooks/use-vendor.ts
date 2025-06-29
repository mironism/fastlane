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
          cover_image_url,
          how_to_book,
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
              max_participants,
              activity_type,
              active_days,
              fixed_start_time,
              price_per_participant,
              max_participants_per_day
            )
          )
        `)
        .eq('id', vendorId)
        .single();

      if (error || !data) {
        setError(true);
      } else {
        const transformedCategories = data.categories
          .filter((category: any) => category.activities.length > 0)
          .map((category: any) => ({
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