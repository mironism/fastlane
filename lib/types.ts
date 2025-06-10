// Based on the 'vendors' table from Supabase schema
export type Vendor = {
  id: string;
  name: string | null;
  description: string | null;
  location: string | null;
  profile_picture_url: string | null;
  user_id: string;
  created_at: string;
};

// Based on the 'categories' table
export type Category = {
  id: string;
  name: string;
  vendor_id: string;
};

// Based on the 'menu_items' table
export type MenuItem = {
  id: string;
  vendor_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
};

// For the 'order_details' JSONB column in the 'orders' table
export type OrderDetail = {
  menu_item_id: string;
  quantity: number;
  name: string;
  price_at_purchase: number;
};

// Based on the 'orders'table
export type Order = {
  id: string;
  vendor_id: string;
  order_details: OrderDetail[];
  total_price: number;
  is_paid: boolean;
  is_fulfilled: boolean;
  created_at: string;
  customer_email?: string | null;
};

// For the client-side cart state (Zustand)
export type CartItem = {
  id: string; // This is the menu_item_id
  title: string;
  price: number;
  image_url: string | null;
  quantity: number;
};

// Composite type for the public vendor menu page, nesting categories and items
export type VendorWithMenu = Vendor & {
  categories: (Category & {
    menu_items: MenuItem[];
  })[];
}; 