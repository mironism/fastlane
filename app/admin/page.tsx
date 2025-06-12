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

export default function HomePage() {
  const [vendorUrl, setVendorUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const constructVendorUrl = async () => {
      setIsLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: vendor, error } = await supabase
          .from('vendors')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (vendor) {
          const baseUrl = window.location.origin;
          setVendorUrl(`${baseUrl}/vendor/${vendor.id}`);
        } else if (error) {
          console.error("Error fetching vendor ID:", error.message)
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to QuickSip</CardTitle>
        <CardDescription>
          A quick guide to get you started with managing your venue
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
          <h3 className="font-semibold">Step 2: Build Your Menu</h3>
          <p className="text-sm text-muted-foreground">
            Visit the{' '}
            <Link href="/admin/menu" className="font-medium text-primary hover:underline">
              Menu
            </Link>{' '}
            section to create and organize your offerings. Start by adding
            categories (like Cocktails, Beers, etc.) and then populate them
            with your delicious menu items. A well-structured menu helps customers
            find what they want quickly.
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Step 3: Manage Incoming Orders</h3>
          <p className="text-sm text-muted-foreground">
            The{' '}
            <Link href="/admin/orders" className="font-medium text-primary hover:underline">
              Orders
            </Link>{' '}
            tab is your command center for all customer orders. Here, you can view
            new orders as they come in and mark them as fulfilled. Speedy order
            management is key to happy, returning customers.
          </p>
        </div>
        
        <div className="space-y-4 border-t pt-6">
          <div className="space-y-2">
            <h3 className="font-semibold">Your Public Link</h3>
            <p className="text-sm text-muted-foreground">
              Share this link with your customers so they can view your menu and place orders.
            </p>
          </div>
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

        <p className="text-sm text-muted-foreground">
          You're all set to start taking orders. Enjoy!
        </p>
      </CardContent>
    </Card>
  );
} 