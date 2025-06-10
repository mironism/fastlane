'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Pencil, PlusCircle, Trash2, ImageIcon } from 'lucide-react'

type MenuItem = {
  id: string
  title: string
  description: string
  price: number
  image_url: string
  category_id: string
  vendor_id: string
}

type Category = {
  id: string
  name: string
}

export function MenuItemManager() {
  const supabase = createClient()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentItem, setCurrentItem] = useState<Partial<MenuItem> | null>(null)
  const [itemImageFile, setItemImageFile] = useState<File | null>(null)
  const [itemImagePreview, setItemImagePreview] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Delete dialog state
  const [alertDialogOpen, setAlertDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null)

  const groupedItems = useMemo(() => {
    const groups: { [key: string]: MenuItem[] } = {}
    
    // First, group by category ID
    menuItems.forEach(item => {
      const categoryId = item.category_id || 'uncategorized'
      if (!groups[categoryId]) {
        groups[categoryId] = []
      }
      groups[categoryId].push(item)
    })
    
    // Then, create a sorted array of groups with category names
    const categoryMap = new Map(categories.map(c => [c.id, c.name]))
    
    return Object.entries(groups).map(([categoryId, items]) => ({
        categoryName: categoryId === 'uncategorized' ? 'Uncategorized' : categoryMap.get(categoryId) || 'Unknown Category',
        items,
    })).sort((a, b) => a.categoryName.localeCompare(b.categoryName));

  }, [menuItems, categories])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in.')
        return
      }

      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user.id)
        .single()
      
      if (vendorError || !vendorData) {
        toast.error('Could not find your vendor profile.')
        return
      }

      // Fetch both categories and menu items in parallel
      const [categoryRes, menuItemRes] = await Promise.all([
        supabase.from('categories').select('id, name').eq('vendor_id', vendorData.id),
        supabase.from('menu_items').select('*').eq('vendor_id', vendorData.id)
      ])

      if (categoryRes.error) toast.error('Failed to fetch categories.')
      else setCategories(categoryRes.data)

      if (menuItemRes.error) toast.error('Failed to fetch menu items.')
      else setMenuItems(menuItemRes.data)
      
      setLoading(false)
    }
    fetchData()
  }, [supabase])

  const openDialog = (item: MenuItem | null) => {
    if (item) {
      setCurrentItem(item)
      setItemImagePreview(item.image_url)
    } else {
      setCurrentItem({ title: '', description: '', price: 0, category_id: '' })
      setItemImagePreview(null)
    }
    setItemImageFile(null)
    setDialogOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setItemImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setItemImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentItem) return

    setValidationError(null) // Reset validation error on new submission

    if (!currentItem.category_id) {
      toast.error('Please select a category for the menu item.')
      setValidationError('category_id')
      return
    }

    setIsSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: vendorData } = await supabase.from('vendors').select('id').eq('user_id', user.id).single()
    if (!vendorData) return

    let imageUrl = currentItem.image_url || null

    if (itemImageFile) {
      const filePath = `${user.id}/${Date.now()}_${itemImageFile.name}`
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, itemImageFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        toast.error('Failed to upload image.')
        setIsSaving(false)
        return
      }
      imageUrl = supabase.storage.from('media').getPublicUrl(filePath).data.publicUrl
    }
    
    // Make a copy of the current item state to avoid mutating it directly
    const itemDataToSave = { ...currentItem }
    // The image_url is handled by the `imageUrl` variable, so we can delete it from the object
    // to prevent sending a potentially large base64 string to the DB.
    if (itemDataToSave.image_url) {
      delete itemDataToSave.image_url
    }

    const finalItemData = {
        ...itemDataToSave,
        vendor_id: vendorData.id,
        image_url: imageUrl,
    }

    if (currentItem.id) { // Update
      const { data, error } = await supabase.from('menu_items').update(finalItemData).eq('id', currentItem.id).select().single()
      if (error) toast.error('Failed to update item.')
      else {
        toast.success('Item updated!')
        setMenuItems(menuItems.map(i => i.id === data.id ? data : i))
      }
    } else { // Create
      const { data, error } = await supabase.from('menu_items').insert(finalItemData).select().single()
      if (error) toast.error('Failed to create item.')
      else {
        toast.success('Item created!')
        setMenuItems([...menuItems, data])
      }
    }
    
    setDialogOpen(false)
    setIsSaving(false)
  }

  const handleDelete = async () => {
    if (!itemToDelete) return

    const { error } = await supabase.from('menu_items').delete().eq('id', itemToDelete.id)
    if (error) toast.error("Failed to delete item.")
    else {
        toast.success("Item deleted.")
        setMenuItems(menuItems.filter(i => i.id !== itemToDelete.id))
    }
    setAlertDialogOpen(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Menu Items</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">Manage your products here.</p>
          </div>
          <Button onClick={() => openDialog(null)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center p-4">Loading...</p>
        ) : menuItems.length > 0 ? (
          <div className="space-y-6">
            {groupedItems.map(({ categoryName, items }) => (
              <div key={categoryName}>
                <h3 className="text-lg font-semibold mb-2">{categoryName}</h3>
                <div className="border rounded-lg">
                  <ul className="divide-y">
                    {items.map(item => (
                      <li key={item.id} className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-4">
                          <div className="relative h-12 w-12 bg-muted rounded-md flex-shrink-0">
                            {item.image_url ? (
                              <Image src={item.image_url} alt={item.title} fill className="rounded-md object-cover" sizes="48px" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-muted-foreground"/>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{item.title}</div>
                            <div className="text-sm text-muted-foreground">${item.price.toFixed(2)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <Button variant="ghost" size="icon" onClick={() => openDialog(item)}><Pencil className="h-4 w-4" /></Button>
                           <Button variant="ghost" size="icon" onClick={() => { setItemToDelete(item); setAlertDialogOpen(true) }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">No menu items yet. Add one to get started!</p>
        )}
      </CardContent>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>{currentItem?.id ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
              <DialogDescription>Fill in the details for your menu item here.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="relative w-full h-48 bg-muted cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    {itemImagePreview ? <Image src={itemImagePreview} alt="Item preview" fill className="object-cover" sizes="100vw" /> : <div className="flex h-full w-full items-center justify-center"><ImageIcon className="h-16 w-16 text-muted-foreground"/></div>}
                    <Input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                </div>
                <Input placeholder="Title" value={currentItem?.title || ''} onChange={e => setCurrentItem({...currentItem, title: e.target.value})} required/>
                <Textarea placeholder="Description" value={currentItem?.description || ''} onChange={e => setCurrentItem({...currentItem, description: e.target.value})} />
                <Input type="number" placeholder="Price" value={currentItem?.price || ''} onChange={e => setCurrentItem({...currentItem, price: parseFloat(e.target.value)})} required/>
                <Select
                  value={currentItem?.category_id || ''}
                  onValueChange={value => {
                    setCurrentItem({...currentItem, category_id: value})
                    setValidationError(null) // Clear error on change
                  }}
                  required
                >
                    <SelectTrigger className={validationError === 'category_id' ? 'border-red-500' : ''}><SelectValue placeholder="Select a category" /></SelectTrigger>
                    <SelectContent>
                        {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
          <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the menu item.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
} 