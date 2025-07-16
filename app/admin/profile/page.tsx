'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User, Pencil, Image as ImageIcon } from 'lucide-react'
import { useVendorProfile } from '@/hooks/use-vendor-profile'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProfilePage() {
  const {
    name,
    setName,
    description,
    setDescription,
    location,
    setLocation,
    currency,
    setCurrency,
    howToBook,
    setHowToBook,
    profilePicturePreview,
    coverImagePreview,
    isLoading,
    isSaving,
    fileInputRef,
    coverImageInputRef,
    handleImageClick,
    handleCoverImageClick,
    handleFileChange,
    handleCoverImageChange,
    handleSubmit
  } = useVendorProfile();


  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-7 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-full max-w-lg" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          This is how your business appears to customers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label>Profile Picture</Label>
            <div
              className="group relative h-24 w-24 rounded-full bg-muted flex items-center justify-center cursor-pointer transition-colors"
              onClick={handleImageClick}
            >
              {profilePicturePreview ? (
                <Image
                  src={profilePicturePreview}
                  alt="Profile Preview"
                  fill
                  sizes="96px"
                  className="rounded-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-muted-foreground" />
              )}
              <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <Pencil className="h-6 w-6 text-white" />
              </div>
            </div>
            <Input
              id="picture"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </div>
          
          <div className="space-y-4">
            <Label>Cover Image</Label>
            <p className="text-sm text-muted-foreground">This image will appear at the top of your activity page</p>
            <div
              className="group relative w-full h-32 rounded-lg bg-muted flex items-center justify-center cursor-pointer transition-colors border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50"
              onClick={handleCoverImageClick}
            >
              {coverImagePreview ? (
                <Image
                  src={coverImagePreview}
                  alt="Cover Preview"
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="rounded-lg object-cover"
                />
              ) : (
                <div className="text-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload cover image</p>
                </div>
              )}
              <div className="absolute inset-0 rounded-lg flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <Pencil className="h-6 w-6 text-white" />
              </div>
            </div>
            <Input
              id="coverImage"
              type="file"
              ref={coverImageInputRef}
              onChange={handleCoverImageChange}
              className="hidden"
              accept="image/*"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Business Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., The Tipsy Turtle Bar"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short, catchy description of your business."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Downtown, Waterfront"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">🇪🇺 Euro (€)</SelectItem>
                <SelectItem value="CHF">🇨🇭 Swiss Franc (CHF)</SelectItem>
                <SelectItem value="TRY">🇹🇷 Turkish Lira (₺)</SelectItem>
                <SelectItem value="IDR">🇮🇩 Indonesian Rupiah (Rp)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This will be used for all pricing throughout your activity listings and booking confirmations.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="howToBook">How to Book Instructions</Label>
            <Textarea
              id="howToBook"
              value={howToBook}
              onChange={(e) => setHowToBook(e.target.value)}
              placeholder="Customize your booking instructions (e.g., 1. Select activities 2. Choose date/time 3. Confirm booking)"
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              These instructions will appear on your activity page to guide customers through the booking process.
            </p>
          </div>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 