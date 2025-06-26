'use client'

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Vendor } from '@/lib/types';

export function useVendorProfile() {
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [howToBook, setHowToBook] = useState('');
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchVendorData = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to view this page.');
        router.push('/auth');
        return;
      }
      setUserId(user.id);

      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        toast.error('Failed to fetch vendor data.');
        console.error(error);
      } else if (data) {
        setVendor(data);
        setName(data.name || '');
        setDescription(data.description || '');
        setLocation(data.location || '');
        setHowToBook(data.how_to_book || '');
        setProfilePicturePreview(data.profile_picture_url || null);
      }
      setIsLoading(false);
    };

    fetchVendorData();
  }, [router]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    if (!vendor || !userId) {
      toast.error("Vendor data not found. Cannot update.");
      setIsSaving(false);
      return;
    }

    let profilePictureUrl = vendor.profile_picture_url;

    if (profilePictureFile) {
      const filePath = `${userId}/${Date.now()}_${profilePictureFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, profilePictureFile, {
            cacheControl: '3600',
            upsert: false // Set to true if you want to allow overwriting
        });

      if (uploadError) {
        toast.error('Failed to upload profile picture.');
        console.error(uploadError);
        setIsSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);
      profilePictureUrl = urlData.publicUrl;
    }

    const { error: updateError } = await supabase
      .from('vendors')
      .update({
        name,
        description,
        location,
        how_to_book: howToBook,
        profile_picture_url: profilePictureUrl,
      })
      .eq('id', vendor.id);
    
    if (updateError) {
      toast.error('Failed to update profile.');
      console.error(updateError);
    } else {
      toast.success('Profile updated successfully!');
      router.refresh();
    }

    setIsSaving(false);
  };

  return {
    vendor,
    name,
    setName,
    description,
    setDescription,
    location,
    setLocation,
    howToBook,
    setHowToBook,
    profilePicturePreview,
    isLoading,
    isSaving,
    fileInputRef,
    handleImageClick,
    handleFileChange,
    handleSubmit
  };
} 