'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { User, Pencil } from 'lucide-react'

// Define the type for our vendor data
type Vendor = {
  id: string
  name: string
  description: string
  location: string
  profile_picture_url: string
  user_id: string
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchVendorData = async () => {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in to view this page.')
        router.push('/auth')
        return
      }

      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        toast.error('Failed to fetch vendor data.')
        console.error(error)
      } else if (data) {
        setVendor(data)
        setName(data.name || '')
        setDescription(data.description || '')
        setLocation(data.location || '')
        setProfilePicturePreview(data.profile_picture_url || null)
      }
      setIsLoading(false)
    }

    fetchVendorData()
  }, [router, supabase])

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setProfilePictureFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSaving(true)

    if (!vendor) {
      toast.error("Vendor data not found. Cannot update.")
      setIsSaving(false)
      return
    }

    let profilePictureUrl = vendor.profile_picture_url

    // 1. Handle file upload if a new file is selected
    if (profilePictureFile) {
      const filePath = `${vendor.user_id}/${Date.now()}_${profilePictureFile.name}`
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, profilePictureFile, {
            cacheControl: '3600',
            upsert: false
        })

      if (uploadError) {
        toast.error('Failed to upload profile picture.')
        console.error(uploadError)
        setIsSaving(false)
        return
      }

      const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath)
      profilePictureUrl = urlData.publicUrl
    }

    // 2. Update the vendor data in the database
    const { error: updateError } = await supabase
      .from('vendors')
      .update({
        name,
        description,
        location,
        profile_picture_url: profilePictureUrl,
      })
      .eq('id', vendor.id)
    
    if (updateError) {
      toast.error('Failed to update profile.')
      console.error(updateError)
    } else {
      toast.success('Profile updated successfully!')
      // Refresh the page data to show the new profile picture URL
      router.refresh()
    }

    setIsSaving(false)
  }

  if (isLoading) {
    return <div>Loading profile...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor Profile</CardTitle>
        <CardDescription>
          This is how your business appears to customers. Update your information below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
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
              <div className="absolute inset-0 rounded-full flex items-center justify-center">
                <Pencil className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
            <Input
              id="picture"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
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
              placeholder="e.g., Downtown, Waterfront"
            />
          </div>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 