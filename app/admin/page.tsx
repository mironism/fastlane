'use client'

import Link from "next/link";
import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { getFullVendorUrl } from "@/lib/vendor-url";

export default function HomePage() {
  const [vendorUrl, setVendorUrl] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isCustomCopied, setIsCustomCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const constructVendorUrl = async () => {
      setIsLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Wait a bit for potential vendor creation trigger
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: vendor, error } = await supabase
          .from('vendors')
          .select('id, slug')
          .eq('user_id', user.id)
          .single();

        if (vendor) {
          // Get the base URL - works for localhost and Vercel
          const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
          
          // Set UUID-based URL (original)
          setVendorUrl(`${baseUrl}/vendor/${vendor.id}`);
          
          // Set custom slug URL if slug exists
          if (vendor.slug) {
            setCustomUrl(`${baseUrl}/vendor/${vendor.slug}`);
          }
        } else if (error) {
          console.error("Error fetching vendor ID:", error.message);
          console.log("Creating vendor profile...");
          
          // Fallback: Create vendor profile manually if trigger didn't work
          const { data: newVendor, error: createError } = await supabase
            .from('vendors')
            .insert({
              user_id: user.id,
              name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'New Vendor'
            })
            .select('id, slug')
            .single();
            
          if (newVendor) {
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
            
            // Set UUID-based URL (original)
            setVendorUrl(`${baseUrl}/vendor/${newVendor.id}`);
            
            // Set custom slug URL if slug exists
            if (newVendor.slug) {
              setCustomUrl(`${baseUrl}/vendor/${newVendor.slug}`);
            }
            
            console.log("Vendor profile created successfully!");
          } else {
            console.error("Failed to create vendor profile:", createError?.message);
          }
        }
      }
      setIsLoading(false);
    };

    constructVendorUrl();
  }, []);

  const handleCopy = () => {
    if (!vendorUrl) return;
    navigator.clipboard.writeText(vendorUrl);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2500);
  };

  const handleCustomCopy = () => {
    if (!customUrl) return;
    navigator.clipboard.writeText(customUrl);
    setIsCustomCopied(true);
    setTimeout(() => {
      setIsCustomCopied(false);
    }, 2500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to FastLane</CardTitle>
        <CardDescription>
          A quick guide to get you started with managing your activity business
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2 border-t pt-6">
          <h3 className="font-semibold">Step 1: Complete Your Profile</h3>
          <p className="text-sm text-muted-foreground">
            Head over to the{' '}
            <Link href="/admin/profile" className="font-medium text-primary hover:underline">
              Profile
            </Link>{' '}
            page to set up your business details. Add your name, a compelling
            description, location, and a profile picture to make a great first
            impression on your customers.
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Step 2: Build Your Activities</h3>
          <p className="text-sm text-muted-foreground">
            Visit the{' '}
            <Link href="/admin/menu" className="font-medium text-primary hover:underline">
              Activities
            </Link>{' '}
            section to create and organize your offerings. Start by adding
            categories (like Water Sports, Tours, etc.) and then populate them
            with your exciting activities. A well-structured menu helps customers
            find what they want quickly.
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Step 3: Manage Incoming Bookings</h3>
          <p className="text-sm text-muted-foreground">
            The{' '}
            <Link href="/admin/orders" className="font-medium text-primary hover:underline">
              Bookings
            </Link>{' '}
            tab is your command center for all customer bookings. Here, you can view
            new bookings as they come in and mark them as fulfilled. Speedy booking
            management is key to happy, returning customers.
          </p>
        </div>
        
        <div className="space-y-4 border-t pt-6">
          <div className="space-y-2">
            <h3 className="font-semibold">Your Public Links</h3>
            <p className="text-sm text-muted-foreground">
              Share these links with your customers so they can view your activities and make bookings.
            </p>
          </div>
          
          {/* Original UUID-based URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Original Link</label>
            <div className="flex items-center space-x-2">
              {isLoading ? (
                <Skeleton className="h-10 flex-1" />
              ) : (
                <Input value={vendorUrl} readOnly className="flex-1" />
              )}
              <Button variant="secondary" size="icon" onClick={handleCopy} disabled={isLoading || !vendorUrl}>
                <span className="sr-only">Copy</span>
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Custom slug URL */}
          {customUrl && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Custom Link</label>
              <div className="flex items-center space-x-2">
                <Input value={customUrl} readOnly className="flex-1" />
                <Button variant="secondary" size="icon" onClick={handleCustomCopy} disabled={!customUrl}>
                  <span className="sr-only">Copy</span>
                  {isCustomCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                ✨ This is your custom branded URL! Update it in your Profile settings.
              </p>
            </div>
          )}
          
          {!customUrl && !isLoading && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Custom Link</label>
              <div className="flex items-center space-x-2">
                <Input value="Not set up yet" readOnly className="flex-1 text-muted-foreground" />
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/profile">Set Up</Link>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Create a custom branded URL in your Profile settings.
              </p>
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          You're all set to start taking orders. Enjoy!
        </p>
      </CardContent>
    </Card>
  );
} 