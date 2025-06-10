'use client'

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { MenuItem, Category } from '@/lib/types';

export function useMenuItems() {
  const supabase = createClient();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const groupedItems = useMemo(() => {
    const groups: { [key: string]: MenuItem[] } = {};
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));
    // Add 'Uncategorized' to the map for items with null category_id
    categoryMap.set('uncategorized', 'Uncategorized');

    // Group items by category ID
    menuItems.forEach(item => {
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

  }, [menuItems, categories]);


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
  }, [supabase]);

  useEffect(() => {
    if (vendorId) {
      const fetchData = async () => {
        setLoading(true);
        const [categoryRes, menuItemRes] = await Promise.all([
          supabase.from('categories').select('*').eq('vendor_id', vendorId),
          supabase.from('menu_items').select('*').eq('vendor_id', vendorId)
        ]);

        if (categoryRes.error) toast.error('Failed to fetch categories.');
        else setCategories(categoryRes.data || []);

        if (menuItemRes.error) toast.error('Failed to fetch menu items.');
        else setMenuItems(menuItemRes.data || []);
        
        setLoading(false);
      };
      fetchData();
    }
  }, [vendorId, supabase]);

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

  const addItem = async (itemData: Partial<MenuItem>, imageFile: File | null) => {
    if (!vendorId) return;
    let imageUrl = itemData.image_url || null;
    if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) return; // Stop if upload fails
    }

    const { data, error } = await supabase.from('menu_items')
      .insert({ ...itemData, vendor_id: vendorId, image_url: imageUrl })
      .select().single();

    if (error) {
      toast.error('Failed to create item.');
    } else if (data) {
      toast.success('Item created!');
      setMenuItems(prev => [...prev, data]);
    }
  };

  const updateItem = async (itemId: string, itemData: Partial<MenuItem>, imageFile: File | null) => {
    let imageUrl = itemData.image_url;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
      if (!imageUrl) return;
    }
    
    // Ensure we don't send the ID in the update payload
    const { id, ...updateData } = itemData;

    const { data, error } = await supabase.from('menu_items')
      .update({ ...updateData, image_url: imageUrl })
      .eq('id', itemId).select().single();

    if (error) {
      toast.error('Failed to update item.');
    } else if (data) {
      toast.success('Item updated!');
      setMenuItems(prev => prev.map(i => i.id === data.id ? data : i));
    }
  };

  const deleteItem = async (itemId: string) => {
    const { error } = await supabase.from('menu_items').delete().eq('id', itemId);
    if (error) {
      toast.error("Failed to delete item.");
    } else {
      toast.success("Item deleted.");
      setMenuItems(prev => prev.filter(i => i.id !== itemId));
    }
  };

  return { loading, categories, groupedItems, addItem, updateItem, deleteItem };
} 