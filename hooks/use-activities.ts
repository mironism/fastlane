'use client'

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Activity, Category } from '@/lib/types';

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const groupedItems = useMemo(() => {
    const groups: { [key: string]: Activity[] } = {};
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));
    // Add 'Uncategorized' to the map for activities with null category_id
    categoryMap.set('uncategorized', 'Uncategorized');

    // Group activities by category ID
    activities.forEach(item => {
      const categoryId = item.category_id || 'uncategorized';
      if (!groups[categoryId]) {
        groups[categoryId] = [];
      }
      groups[categoryId].push(item);
    });
    
    // Create a sorted array of groups with category names
    return Array.from(categoryMap.keys())
      .filter(categoryId => groups[categoryId] && groups[categoryId].length > 0)
      .map(categoryId => ({
        categoryName: categoryMap.get(categoryId) || 'Unknown Category',
        items: groups[categoryId],
      }))
      .sort((a, b) => a.categoryName.localeCompare(b.categoryName));

  }, [activities, categories]);


  useEffect(() => {
    const getVendorAndUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors').select('id').eq('user_id', user.id).single();
        
        if (vendorError || !vendorData) {
          toast.error('Could not find your vendor profile.');
          setLoading(false);
        } else {
          setVendorId(vendorData.id);
        }
      } else {
        toast.error('You must be logged in.');
        setLoading(false);
      }
    };
    getVendorAndUser();
  }, []);

  useEffect(() => {
    if (vendorId) {
      const fetchData = async () => {
        setLoading(true);
        
        try {
          const [categoryRes, activityRes] = await Promise.all([
            supabase.from('categories').select('*').eq('vendor_id', vendorId),
            supabase.from('activities').select('*').eq('vendor_id', vendorId)
          ]);

          if (categoryRes.error) {
            if (categoryRes.error.code === '42P01') {
              console.log('📋 Categories table not found - please run the database schema');
              toast.info('Please set up the database schema to manage activities.');
            } else {
              toast.error('Failed to fetch categories.');
            }
            setCategories([]);
          } else {
            setCategories(categoryRes.data || []);
          }

          if (activityRes.error) {
            if (activityRes.error.code === '42P01') {
              console.log('📋 Activities table not found - please run the database schema');
              toast.info('Please set up the database schema to manage activities.');
            } else {
              toast.error('Failed to fetch activities.');
            }
            setActivities([]);
          } else {
            setActivities(activityRes.data || []);
          }
        } catch (err) {
          console.error('❌ Unexpected error fetching data:', err);
          setCategories([]);
          setActivities([]);
        }
        
        setLoading(false);
      };
      fetchData();
    }
  }, [vendorId]);

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!userId) {
        toast.error("User not found for image upload.");
        return null;
    }
    const filePath = `${userId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      toast.error('Failed to upload image.');
      console.error(uploadError);
      return null;
    }
    return supabase.storage.from('media').getPublicUrl(filePath).data.publicUrl;
  };

  const addItem = async (itemData: Partial<Activity>, imageFile: File | null) => {
    if (!vendorId) {
      console.error('❌ No vendorId found');
      return;
    }
    
    console.log('🚀 Starting activity creation...');
    console.log('📝 Item data:', itemData);
    console.log('🖼️ Image file:', imageFile ? `${imageFile.name} (${imageFile.size} bytes)` : 'No image');
    
    let imageUrl = itemData.image_url || null;
    if (imageFile) {
        console.log('📤 Uploading image...');
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) {
          console.error('❌ Image upload failed, stopping activity creation');
          return; // Stop if upload fails
        }
        console.log('✅ Image uploaded:', imageUrl);
    }

    const insertData = { 
      ...itemData, 
      vendor_id: vendorId, 
      image_url: imageUrl 
    };
    
    console.log('💾 Inserting into database:', insertData);

    const { data, error } = await supabase.from('activities')
      .insert(insertData)
      .select().single();

    if (error) {
      console.error('❌ Database insert error:', error);
      toast.error(`Failed to create activity: ${error.message}`);
    } else if (data) {
      console.log('✅ Activity created successfully:', data);
      toast.success('Activity created!');
      setActivities(prev => [...prev, data]);
    } else {
      console.error('❌ No data returned from insert');
      toast.error('Failed to create activity: No data returned');
    }
  };

  const updateItem = async (itemId: string, itemData: Partial<Activity>, imageFile: File | null) => {
    let imageUrl = itemData.image_url;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
      if (!imageUrl) return;
    }
    
    // Ensure we don't send the ID in the update payload
    const { id, ...updateData } = itemData;

    const { data, error } = await supabase.from('activities')
      .update({ ...updateData, image_url: imageUrl })
      .eq('id', itemId).select().single();

    if (error) {
      toast.error('Failed to update activity.');
    } else if (data) {
      toast.success('Activity updated!');
      setActivities(prev => prev.map(i => i.id === data.id ? data : i));
    }
  };

  const deleteItem = async (itemId: string) => {
    const { error } = await supabase.from('activities').delete().eq('id', itemId);
    if (error) {
      toast.error("Failed to delete activity.");
    } else {
      toast.success("Activity deleted.");
      setActivities(prev => prev.filter(i => i.id !== itemId));
    }
  };

  return { loading, categories, groupedItems, addItem, updateItem, deleteItem };
} 