import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { VendorWithMenu } from '@/lib/types';
import { isUUID } from '@/lib/slug-utils';

export function useVendor(vendorIdOrSlug: string) {
  const [vendor, setVendor] = useState<VendorWithMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchVendorData() {
      // Determine if we're looking up by UUID or slug
      const isLookupByUUID = isUUID(vendorIdOrSlug);
      const lookupField = isLookupByUUID ? 'id' : 'slug';

      const { data, error } = await supabase
        .from('vendors')
        .select(`
          id,
          name,
          description,
          location,
          currency,
          profile_picture_url,
          cover_image_url,
          how_to_book,
          user_id,
          slug,
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
        .eq(lookupField, vendorIdOrSlug)
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
  }, [vendorIdOrSlug]);

  return { vendor, loading, error };
} 