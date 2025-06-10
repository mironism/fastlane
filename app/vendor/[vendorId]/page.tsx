import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { MenuClient } from './menu-client';

type Props = {
  params: {
    vendorId: string;
  };
};

// Keep the types separate or import them if they are defined elsewhere
type MenuItem = {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
};

type Category = {
  id: string;
  name: string;
  menu_items: MenuItem[];
};

type Vendor = {
  id: string;
  name: string;
  description: string;
  profile_picture_url: string;
  categories: Category[];
};

async function getVendorData(vendorId: string): Promise<Vendor | null> {
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
  return { ...data, categories: categoriesWithItems };
}

export default async function VendorPage({ params }: Props) {
  const vendor = await getVendorData(params.vendorId);

  if (!vendor) {
    notFound();
  }

  return <MenuClient vendor={vendor} />;
} 