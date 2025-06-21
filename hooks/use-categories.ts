'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Category } from '@/lib/types'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [vendorId, setVendorId] = useState<string | null>(null);

  // Fetch vendor ID first
  useEffect(() => {
    const getVendor = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('id')
          .eq('user_id', user.id)
          .single()
        if (vendorError || !vendorData) {
          toast.error('Could not find your vendor profile.')
          setLoading(false)
        } else {
          setVendorId(vendorData.id)
        }
      } else {
         toast.error('You must be logged in.')
         setLoading(false)
      }
    };
    getVendor();
  }, [])

  // Fetch categories once vendor ID is available
  useEffect(() => {
    if (vendorId) {
      const fetchCategories = async () => {
        setLoading(true)
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('vendor_id', vendorId)
          .order('name', { ascending: true })

        if (error) {
          toast.error('Failed to fetch categories.')
          console.error(error)
        } else {
          setCategories(data)
        }
        setLoading(false)
      }
      fetchCategories()
    }
  }, [vendorId])


  const addCategory = async (name: string) => {
    if (!vendorId) {
      toast.error('Vendor not identified. Cannot add category.');
      return;
    }
    const { data, error } = await supabase
      .from('categories')
      .insert({ name, vendor_id: vendorId })
      .select()
      .single()
    
    if (error) {
      toast.error('Failed to create category.')
    } else {
      toast.success('Category created!')
      setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    }
  }

  const updateCategory = async (id: string, name: string) => {
    const { error } = await supabase
      .from('categories')
      .update({ name })
      .eq('id', id)
    
    if (error) {
      toast.error('Failed to update category.')
    } else {
      toast.success('Category updated!')
      setCategories(prev => prev.map(c => c.id === id ? { ...c, name } : c).sort((a, b) => a.name.localeCompare(b.name)))
    }
  }

  const deleteCategory = async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Failed to delete category.')
    } else {
      toast.success('Category deleted.')
      setCategories(prev => prev.filter(c => c.id !== id))
    }
  }

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
  }
} 