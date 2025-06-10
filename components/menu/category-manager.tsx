'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pencil, PlusCircle, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Category = {
  id: string
  name: string
  vendor_id: string
}

export function CategoryManager() {
  const supabase = createClient()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  
  // State for the create/edit dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
  const [categoryName, setCategoryName] = useState('')

  // State for the delete confirmation dialog
  const [alertDialogOpen, setAlertDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
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

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('vendor_id', vendorData.id)
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
  }, [supabase])

  const openDialog = (category: Category | null) => {
    setCurrentCategory(category)
    setCategoryName(category?.name || '')
    setDialogOpen(true)
  }

  const openDeleteConfirm = (category: Category) => {
    setCategoryToDelete(category)
    setAlertDialogOpen(true)
  }

  const handleSave = async () => {
    if (!categoryName.trim()) {
      toast.error('Category name cannot be empty.')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: vendorData } = await supabase.from('vendors').select('id').eq('user_id', user.id).single()
    if (!vendorData) return

    if (currentCategory) {
      // Update existing category
      const { error } = await supabase
        .from('categories')
        .update({ name: categoryName })
        .eq('id', currentCategory.id)
      
      if (error) {
        toast.error('Failed to update category.')
      } else {
        toast.success('Category updated!')
        setCategories(categories.map(c => c.id === currentCategory.id ? { ...c, name: categoryName } : c))
      }
    } else {
      // Create new category
      const { data, error } = await supabase
        .from('categories')
        .insert({ name: categoryName, vendor_id: vendorData.id })
        .select()
        .single()
      
      if (error) {
        toast.error('Failed to create category.')
      } else {
        toast.success('Category created!')
        setCategories([...categories, data])
      }
    }
    setDialogOpen(false)
  }

  const handleDelete = async () => {
    if (!categoryToDelete) return

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryToDelete.id)

    if (error) {
      toast.error('Failed to delete category.')
    } else {
      toast.success('Category deleted.')
      setCategories(categories.filter(c => c.id !== categoryToDelete.id))
    }
    setAlertDialogOpen(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Categories</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">Group your menu items into categories.</p>
          </div>
          <Button onClick={() => openDialog(null)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="p-4 text-center">Loading categories...</p>
        ) : categories.length > 0 ? (
          <div className="border rounded-lg">
            <ul className="divide-y">
              {categories.map(category => (
                <li key={category.id} className="flex items-center justify-between p-4">
                  <span className="font-medium">{category.name}</span>
                  <div className="space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => openDialog(category)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteConfirm(category)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="p-4 text-center text-muted-foreground">No categories found. Add one to get started!</p>
        )}
      </CardContent>
      {/* Dialog for Create/Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentCategory ? 'Edit Category' : 'Create New Category'}</DialogTitle>
            <DialogDescription>
              {currentCategory ? 'Rename your category here.' : 'Enter the name for the new category.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Alert Dialog for Delete Confirmation */}
      <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category. Any menu items in this category will not be deleted but will become uncategorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
} 