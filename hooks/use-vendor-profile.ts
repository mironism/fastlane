'use client'

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Vendor } from '@/lib/types';
import { validateSlug, generateSlugSuggestion } from '@/lib/slug-utils';

export function useVendorProfile() {
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [howToBook, setHowToBook] = useState('');
  const [slug, setSlug] = useState('');
  const [slugError, setSlugError] = useState<string | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
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
        setCurrency(data.currency || 'EUR');
        setHowToBook(data.how_to_book || '');
        setSlug(data.slug || '');
        setProfilePicturePreview(data.profile_picture_url || null);
        setCoverImagePreview(data.cover_image_url || null);
      }
      setIsLoading(false);
    };

    fetchVendorData();
  }, [router]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleCoverImageClick = () => {
    coverImageInputRef.current?.click();
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

  const handleCoverImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSlugChange = (value: string) => {
    setSlug(value);
    
    // Validate slug in real-time
    const validation = validateSlug(value);
    setSlugError(validation.isValid ? null : validation.error || null);
  };

  const generateSlugFromName = () => {
    if (!name.trim()) {
      toast.error('Please enter a business name first');
      return;
    }
    
    const suggestion = generateSlugSuggestion(name);
    setSlug(suggestion);
    setSlugError(null);
  };

  const checkSlugAvailability = async (slugToCheck: string) => {
    if (!slugToCheck || slugToCheck === vendor?.slug) return true;
    
    const { data, error } = await supabase
      .from('vendors')
      .select('id')
      .eq('slug', slugToCheck)
      .neq('id', vendor?.id || '')
      .single();
    
    if (error && error.code === 'PGRST116') {
      // No rows found, slug is available
      return true;
    }
    
    return !data; // If data exists, slug is taken
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    if (!vendor || !userId) {
      toast.error("Vendor data not found. Cannot update.");
      setIsSaving(false);
      return;
    }

    // Validate slug before saving
    if (slug) {
      const validation = validateSlug(slug);
      if (!validation.isValid) {
        setSlugError(validation.error || 'Invalid slug');
        setIsSaving(false);
        return;
      }

      // Check if slug is available
      const isAvailable = await checkSlugAvailability(slug);
      if (!isAvailable) {
        setSlugError('This URL is already taken. Please choose a different one.');
        setIsSaving(false);
        return;
      }
    }

    let profilePictureUrl = vendor.profile_picture_url;
    let coverImageUrl = vendor.cover_image_url;

    if (profilePictureFile) {
      const filePath = `${userId}/${Date.now()}_profile_${profilePictureFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, profilePictureFile, {
            cacheControl: '3600',
            upsert: false
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

    if (coverImageFile) {
      const filePath = `${userId}/${Date.now()}_cover_${coverImageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, coverImageFile, {
            cacheControl: '3600',
            upsert: false
        });

      if (uploadError) {
        toast.error('Failed to upload cover image.');
        console.error(uploadError);
        setIsSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);
      coverImageUrl = urlData.publicUrl;
    }

    const { error: updateError } = await supabase
      .from('vendors')
      .update({
        name,
        description,
        location,
        currency,
        how_to_book: howToBook,
        slug: slug || null,
        profile_picture_url: profilePictureUrl,
        cover_image_url: coverImageUrl,
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
    currency,
    setCurrency,
    howToBook,
    setHowToBook,
    slug,
    setSlug: handleSlugChange,
    slugError,
    generateSlugFromName,
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
  };
} 