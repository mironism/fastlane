'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pencil, PlusCircle, Trash2, ImageIcon } from 'lucide-react'
import { useMenuItems } from '@/hooks/use-menu-items'
import { MenuItem } from '@/lib/types'
import { Skeleton } from '../ui/skeleton'
import { cn } from '@/lib/utils'

export function MenuItemManager() {
  const { loading, categories, groupedItems, addItem, updateItem, deleteItem } = useMenuItems();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const closeDialog = () => {
    setDialogOpen(false);
    setIsSaving(false);
    setCurrentItem(null);
    setItemImageFile(null);
    setItemImagePreview(null);
    setValidationError(null);
  }

  const openDialog = (item: MenuItem | null) => {
    if (item) {
      setCurrentItem(item);
      setItemImagePreview(item.image_url);
    } else {
      setCurrentItem({ title: '', description: '', price: 0, category_id: '' });
      setItemImagePreview(null);
    }
    setItemImageFile(null);
    setValidationError(null);
    setDialogOpen(true);
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

    setValidationError(null)
    if (!currentItem.category_id) {
      toast.error('Please select a category for the menu item.')
      setValidationError('category_id')
      return
    }

    setIsSaving(true)

    if (currentItem.id) { // Update
      await updateItem(currentItem.id, currentItem, itemImageFile);
    } else { // Create
      await addItem(currentItem, itemImageFile);
    }
    
    closeDialog();
  }

  const handleDelete = async () => {
    if (!itemToDelete) return
    await deleteItem(itemToDelete.id);
    setAlertDialogOpen(false)
    setItemToDelete(null);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Menu Items</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">Manage your products here</p>
          </div>
          <Button onClick={() => openDialog(null)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Menu Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-6 w-1/3 mb-2" />
                <div className="border rounded-lg">
                  <div className="divide-y">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-12 w-12 rounded-sm" />
                          <div>
                            <Skeleton className="h-5 w-24 mb-1" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <Skeleton className="h-8 w-8" />
                           <Skeleton className="h-8 w-8" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : groupedItems.length > 0 ? (
          <div className="space-y-6">
            {groupedItems.map(({ categoryName, items }) => (
              <div key={categoryName}>
                <h3 className="text-lg font-semibold mb-2">{categoryName}</h3>
                <div className="border rounded-lg">
                  <ul className="divide-y">
                    {items.map(item => (
                      <li key={item.id} className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-4">
                          <div className="relative h-12 w-12 bg-muted rounded-sm flex-shrink-0">
                            {item.image_url ? (
                              <Image src={item.image_url} alt={item.title} fill className="rounded-sm object-cover" sizes="48px" />
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
              <DialogDescription>Fill in the details for your menu item here</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="relative w-full h-48 bg-muted rounded-sm cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    {itemImagePreview ? <Image src={itemImagePreview} alt="Item preview" fill className="object-cover rounded-sm" sizes="100vw" /> : <div className="flex h-full w-full items-center justify-center"><ImageIcon className="h-16 w-16 text-muted-foreground"/></div>}
                    <Input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                </div>
                <Input placeholder="Title" value={currentItem?.title || ''} onChange={e => setCurrentItem({...currentItem, title: e.target.value})} required/>
                <Textarea placeholder="Description" value={currentItem?.description || ''} onChange={e => setCurrentItem({...currentItem, description: e.target.value})} />
                <Input type="number" placeholder="Price" value={currentItem?.price || ''} onChange={e => setCurrentItem({...currentItem, price: parseFloat(e.target.value) || 0})} required/>
                <Select
                  value={currentItem?.category_id || ''}
                  onValueChange={value => {
                    setCurrentItem({...currentItem, category_id: value})
                    setValidationError(null)
                  }}
                  required
                >
                    <SelectTrigger className={cn("w-full", validationError === 'category_id' ? 'border-destructive' : '')}><SelectValue placeholder="Select a category" /></SelectTrigger>
                    <SelectContent>
                        {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={closeDialog}>Cancel</Button>
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