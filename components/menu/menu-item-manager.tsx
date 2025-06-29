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
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Pencil, PlusCircle, Trash2, ImageIcon, Clock, Users, MapPin, Calendar, CircuitBoard } from 'lucide-react'
import { useActivities } from '@/hooks/use-activities'
import { Activity } from '@/lib/types'
import { Skeleton } from '../ui/skeleton'
import { cn } from '@/lib/utils'
import { EmptyState } from '../ui/empty-state'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function MenuItemManager() {
  const { loading, categories, groupedItems, addItem, updateItem, deleteItem } = useActivities();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentItem, setCurrentItem] = useState<Partial<Activity> | null>(null)
  const [itemImageFile, setItemImageFile] = useState<File | null>(null)
  const [itemImagePreview, setItemImagePreview] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Tour system states
  const [showDescription, setShowDescription] = useState(false)

  // Delete dialog state
  const [alertDialogOpen, setAlertDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Activity | null>(null)

  const closeDialog = () => {
    setDialogOpen(false);
    setIsSaving(false);
    setCurrentItem(null);
    setItemImageFile(null);
    setItemImagePreview(null);
    setValidationError(null);
    setShowDescription(false);
  }

  const openDialog = (item: Activity | null) => {
    if (item) {
      setCurrentItem(item);
      setItemImagePreview(item.image_url);
      setShowDescription(!!item.description);
    } else {
      setCurrentItem({ 
        title: '', 
        description: '', 
        price: 0, 
        category_id: '', 
        duration_minutes: 60,
        max_participants: 4,
        // Tour system defaults
        activity_type: 'regular',
        active_days: null,
        fixed_start_time: null,
        price_per_participant: null,
        max_participants_per_day: null
      });
      setItemImagePreview(null);
      setShowDescription(false);
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

  const handleActivityTypeChange = (activityType: 'regular' | 'tour') => {
    setCurrentItem(prev => ({
      ...prev,
      activity_type: activityType,
      // Reset tour fields when switching to regular
      ...(activityType === 'regular' && {
        active_days: null,
        fixed_start_time: null,
        price_per_participant: null,
        max_participants_per_day: null
      }),
      // Set defaults when switching to tour
      ...(activityType === 'tour' && {
        active_days: [1, 2, 3, 4, 5], // Weekdays by default
        fixed_start_time: '09:00',
        price_per_participant: currentItem?.price || 0,
        max_participants_per_day: 10
      })
    }))
  }

  const handleDayToggle = (day: number, checked: boolean) => {
    setCurrentItem(prev => {
      const activeDays = prev?.active_days || [];
      if (checked) {
        return { ...prev, active_days: [...activeDays, day].sort() };
      } else {
        return { ...prev, active_days: activeDays.filter(d => d !== day) };
      }
    });
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentItem) return

    setValidationError(null)
    
    // Validation
    if (!currentItem.category_id) {
      toast.error('Please select a category for the activity.')
      setValidationError('category_id')
      return
    }

    if (currentItem.activity_type === 'tour') {
      if (!currentItem.active_days || currentItem.active_days.length === 0) {
        toast.error('Please select at least one active day for the tour.')
        setValidationError('active_days')
        return
      }
      if (!currentItem.fixed_start_time) {
        toast.error('Please set a start time for the tour.')
        setValidationError('fixed_start_time')
        return
      }
      if (!currentItem.price_per_participant || currentItem.price_per_participant <= 0) {
        toast.error('Please set a valid price per participant for the tour.')
        setValidationError('price_per_participant')
        return
      }
      if (!currentItem.max_participants_per_day || currentItem.max_participants_per_day <= 0) {
        toast.error('Please set a valid maximum participants per day for the tour.')
        setValidationError('max_participants_per_day')
        return
      }
    }

    // Clean up description if checkbox is unchecked
    const itemToSave = {
      ...currentItem,
      description: showDescription ? currentItem.description : null
    };

    setIsSaving(true)

    if (currentItem.id) { // Update
      await updateItem(currentItem.id, itemToSave, itemImageFile);
    } else { // Create
      await addItem(itemToSave, itemImageFile);
    }
    
    closeDialog();
  }

  const handleDelete = async () => {
    if (!itemToDelete) return
    await deleteItem(itemToDelete.id);
    setAlertDialogOpen(false)
    setItemToDelete(null);
  }

  const daysOfWeek = [
    { value: 1, label: 'Mon', fullLabel: 'Monday' },
    { value: 2, label: 'Tue', fullLabel: 'Tuesday' },
    { value: 3, label: 'Wed', fullLabel: 'Wednesday' },
    { value: 4, label: 'Thu', fullLabel: 'Thursday' },
    { value: 5, label: 'Fri', fullLabel: 'Friday' },
    { value: 6, label: 'Sat', fullLabel: 'Saturday' },
    { value: 7, label: 'Sun', fullLabel: 'Sunday' }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Beach Activities</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">Manage your activities and tours</p>
          </div>
          {categories.length === 0 ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button disabled>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Activity
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create categories first before adding activities</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button onClick={() => openDialog(null)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Activity
            </Button>
          )}
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
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{item.title}</span>
                              {item.activity_type === 'tour' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  <CircuitBoard className="h-3 w-3 mr-1" />
                                  Tour
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {item.activity_type === 'tour' && item.price_per_participant
                                ? `€${item.price_per_participant.toFixed(2)}/person`
                                : `€${item.price.toFixed(2)}`}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              {item.activity_type === 'tour' && item.fixed_start_time && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{item.fixed_start_time}</span>
                                </div>
                              )}
                              {item.activity_type === 'tour' && item.active_days && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{item.active_days.map(d => daysOfWeek.find(day => day.value === d)?.label).join(', ')}</span>
                                </div>
                              )}
                              {item.activity_type === 'regular' && item.duration_minutes && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{item.duration_minutes}min</span>
                                </div>
                              )}
                              {item.max_participants && item.activity_type === 'regular' && (
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  <span>Max {item.max_participants}</span>
                                </div>
                              )}
                              {item.max_participants_per_day && item.activity_type === 'tour' && (
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  <span>{item.max_participants_per_day}/day</span>
                                </div>
                              )}
                              {item.meeting_point && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate max-w-20">{item.meeting_point}</span>
                                </div>
                              )}
                            </div>
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
          <EmptyState message="No activities yet. Add one to get started!" />
        )}
      </CardContent>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>{currentItem?.id ? 'Edit Activity' : 'Add New Activity'}</DialogTitle>
              <DialogDescription>Fill in the details for your beach activity or tour</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="relative w-full h-48 bg-muted rounded-sm cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    {itemImagePreview ? <Image src={itemImagePreview} alt="Activity preview" fill className="object-cover rounded-sm" sizes="100vw" /> : <div className="flex h-full w-full items-center justify-center"><ImageIcon className="h-16 w-16 text-muted-foreground"/></div>}
                    <Input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="title">Activity Name *</Label>
                  <Input 
                    id="title"
                    placeholder="e.g., Jet Ski Adventure" 
                    value={currentItem?.title || ''} 
                    onChange={e => setCurrentItem({...currentItem, title: e.target.value})} 
                    required
                  />
                </div>

                {/* Optional Description Checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="show-description" 
                    checked={showDescription}
                    onCheckedChange={(checked) => setShowDescription(checked === true)}
                  />
                  <Label htmlFor="show-description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Add description
                  </Label>
                </div>
                
                {/* Conditional Description Field */}
                {showDescription && (
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description"
                      placeholder="Describe your activity experience..." 
                      value={currentItem?.description || ''} 
                      onChange={e => setCurrentItem({...currentItem, description: e.target.value})} 
                      rows={3}
                    />
                  </div>
                )}

                {/* Activity Type Selection */}
                <div className="grid gap-3">
                  <Label>Activity Type *</Label>
                  <RadioGroup 
                    value={currentItem?.activity_type || 'regular'} 
                    onValueChange={handleActivityTypeChange}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="regular" id="regular" />
                      <Label htmlFor="regular">Regular Activity</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tour" id="tour" />
                      <Label htmlFor="tour">Tour</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Conditional Tour Fields */}
                {currentItem?.activity_type === 'tour' && (
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900">Tour Configuration</h4>
                    
                    {/* Active Days */}
                    <div className="grid gap-2">
                      <Label className={cn(validationError === 'active_days' && 'text-destructive')}>Active Days *</Label>
                      <div className="flex gap-2 flex-wrap">
                        {daysOfWeek.map(day => (
                          <div key={day.value} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`day-${day.value}`}
                              checked={currentItem?.active_days?.includes(day.value) || false}
                              onCheckedChange={(checked) => handleDayToggle(day.value, checked as boolean)}
                            />
                            <Label htmlFor={`day-${day.value}`} className="text-sm">{day.label}</Label>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => setCurrentItem(prev => ({ ...prev, active_days: [1,2,3,4,5] }))}
                        >
                          Weekdays
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => setCurrentItem(prev => ({ ...prev, active_days: [6,7] }))}
                        >
                          Weekends
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => setCurrentItem(prev => ({ ...prev, active_days: [1,2,3,4,5,6,7] }))}
                        >
                          All Days
                        </Button>
                      </div>
                    </div>

                    {/* Fixed Start Time */}
                    <div className="grid gap-2">
                      <Label htmlFor="start-time" className={cn(validationError === 'fixed_start_time' && 'text-destructive')}>Start Time *</Label>
                      <Input 
                        id="start-time"
                        type="time" 
                        value={currentItem?.fixed_start_time || ''} 
                        onChange={e => setCurrentItem({...currentItem, fixed_start_time: e.target.value})} 
                        className={cn(validationError === 'fixed_start_time' && 'border-destructive')}
                      />
                    </div>

                    {/* Price per Participant */}
                    <div className="grid gap-2">
                      <Label htmlFor="price-per-participant" className={cn(validationError === 'price_per_participant' && 'text-destructive')}>Price per Participant (EUR) *</Label>
                      <Input 
                        id="price-per-participant"
                        type="number" 
                        placeholder="40" 
                        value={currentItem?.price_per_participant || ''} 
                        onChange={e => setCurrentItem({...currentItem, price_per_participant: parseFloat(e.target.value) || undefined})} 
                        className={cn(validationError === 'price_per_participant' && 'border-destructive')}
                      />
                    </div>

                    {/* Tour Duration */}
                    <div className="grid gap-2">
                      <Label htmlFor="tour-duration">Tour Duration (hours) *</Label>
                      <Input 
                        id="tour-duration"
                        type="number" 
                        step="0.5"
                        placeholder="3.5" 
                        value={currentItem?.duration_minutes ? (currentItem.duration_minutes / 60).toString() : ''} 
                        onChange={e => setCurrentItem({...currentItem, duration_minutes: parseFloat(e.target.value) * 60 || undefined})} 
                      />
                    </div>

                    {/* Max Participants per Day */}
                    <div className="grid gap-2">
                      <Label htmlFor="max-per-day" className={cn(validationError === 'max_participants_per_day' && 'text-destructive')}>Max Participants per Day *</Label>
                      <Input 
                        id="max-per-day"
                        type="number" 
                        placeholder="10" 
                        value={currentItem?.max_participants_per_day || ''} 
                        onChange={e => setCurrentItem({...currentItem, max_participants_per_day: parseInt(e.target.value) || undefined})} 
                        className={cn(validationError === 'max_participants_per_day' && 'border-destructive')}
                      />
                    </div>
                  </div>
                )}

                {/* Regular Activity Fields */}
                {currentItem?.activity_type === 'regular' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="price">Price (EUR) *</Label>
                        <Input 
                          id="price"
                          type="number" 
                          placeholder="50" 
                          value={currentItem?.price || ''} 
                          onChange={e => setCurrentItem({...currentItem, price: parseFloat(e.target.value) || 0})} 
                          required
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input 
                          id="duration"
                          type="number" 
                          placeholder="60" 
                          value={currentItem?.duration_minutes || ''} 
                          onChange={e => setCurrentItem({...currentItem, duration_minutes: parseInt(e.target.value) || undefined})} 
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="max_participants">Max Participants</Label>
                      <Input 
                        id="max_participants"
                        type="number" 
                        placeholder="4" 
                        value={currentItem?.max_participants || ''} 
                        onChange={e => setCurrentItem({...currentItem, max_participants: parseInt(e.target.value) || undefined})} 
                      />
                    </div>
                  </>
                )}
                
                <div className="grid gap-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={currentItem?.category_id || ''} 
                    onValueChange={value => setCurrentItem({...currentItem, category_id: value})}
                  >
                    <SelectTrigger className={cn(validationError === 'category_id' && 'border-destructive')}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="meeting_point">Meeting Point</Label>
                  <Input 
                    id="meeting_point"
                    placeholder="e.g., Main Beach Dock A" 
                    value={currentItem?.meeting_point || ''} 
                    onChange={e => setCurrentItem({...currentItem, meeting_point: e.target.value})} 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="requirements">Requirements/Notes</Label>
                  <Textarea 
                    id="requirements"
                    placeholder="e.g., Must know how to swim, Minimum age 16..." 
                    value={currentItem?.requirements || ''} 
                    onChange={e => setCurrentItem({...currentItem, requirements: e.target.value})} 
                    rows={2}
                  />
                </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog} disabled={isSaving}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : (currentItem?.id ? 'Update Activity' : 'Add Activity')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{itemToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
} 