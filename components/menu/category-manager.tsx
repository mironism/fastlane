'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { useCategories } from '@/hooks/use-categories'
import { Category } from '@/lib/types'

export function CategoryManager() {
  const { categories, loading, addCategory, updateCategory, deleteCategory } = useCategories();
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
  const [categoryName, setCategoryName] = useState('')

  const [alertDialogOpen, setAlertDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

  const openDialog = (category: Category | null) => {
    setCurrentCategory(category)
    setCategoryName(category?.name || '')
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false);
    setCurrentCategory(null);
    setCategoryName('');
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

    if (currentCategory) {
      await updateCategory(currentCategory.id, categoryName.trim());
    } else {
      await addCategory(categoryName.trim());
    }
    closeDialog();
  }

  const handleDelete = async () => {
    if (!categoryToDelete) return

    await deleteCategory(categoryToDelete.id);
    setAlertDialogOpen(false)
    setCategoryToDelete(null);
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
            <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
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