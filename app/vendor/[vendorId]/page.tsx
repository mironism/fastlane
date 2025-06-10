import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { MenuClient } from './menu-client';
import { VendorWithMenu } from '@/lib/types';

async function getVendorData(vendorId: string): Promise<VendorWithMenu | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('vendors')
    .select(`
      id,
      name,
      description,
      profile_picture_url,
      categories (
        id,
        name,
        menu_items (
          id,
          title,
          description,
          price,
          image_url
        )
      )
    `)
    .eq('id', vendorId)
    .single();

  if (error || !data) {
    return null;
  }

  const categoriesWithItems = data.categories.filter(category => category.menu_items.length > 0);
  return { ...data, categories: categoriesWithItems } as VendorWithMenu;
}

export default async function VendorPage({ params }: any) {
  const vendor = await getVendorData(params.vendorId);

  if (!vendor) {
    notFound();
  }

  return <MenuClient vendor={vendor} />;
} 