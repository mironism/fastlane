'use client'

import { useState, FormEvent } from 'react'
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
import { Skeleton } from '../ui/skeleton'
import { EmptyState } from '../ui/empty-state'

export function CategoryManager() {
  const { categories, loading, addCategory, updateCategory, deleteCategory } = useCategories();
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
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
    setIsSaving(false);
  }

  const openDeleteConfirm = (category: Category) => {
    setCategoryToDelete(category)
    setAlertDialogOpen(true)
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast.error('Category name cannot be empty.')
      return
    }

    setIsSaving(true);

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
            <p className="text-muted-foreground text-sm mt-1">Group your menu items into categories</p>
          </div>
          <Button onClick={() => openDialog(null)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="border rounded-lg">
            <div className="divide-y">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4">
                  <Skeleton className="h-5 w-32" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>
          </div>
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
          <EmptyState message="No categories yet. Add one to get started!" />
        )}
      </CardContent>
      {/* Dialog for Create/Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>{currentCategory ? 'Edit Category' : 'Create New Category'}</DialogTitle>
              <DialogDescription>
                {currentCategory ? 'Rename your category here' : 'Enter the name for the new category'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                id="name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Category Name"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={closeDialog}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
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