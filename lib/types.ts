// Based on the 'currencies' table
export type Currency = {
  code: string;
  symbol: string;
  name: string;
  decimal_places: number;
  is_active: boolean;
  created_at?: string;
};

// Based on the 'vendors' table from Supabase schema
export type Vendor = {
  id: string;
  name: string | null;
  description: string | null;
  location: string | null;
  currency: string; // ISO 4217 currency code
  profile_picture_url: string | null;
  cover_image_url: string | null;
  how_to_book: string | null;
  user_id: string;
  slug: string | null; // Custom URL slug
  created_at: string;
};

// Based on the 'categories' table
export type Category = {
  id: string;
  name: string;
  vendor_id: string;
};

// Based on the 'activities' table (formerly menu_items)
export type Activity = {
  id: string;
  vendor_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  // FastLane additions
  duration_minutes: number;
  meeting_point: string | null;
  requirements: string | null;
  max_participants: number;
  // Tour system additions
  activity_type: 'regular' | 'tour';
  active_days: number[] | null; // [1,2,3,4,5,6,7] where 1=Monday, 7=Sunday
  fixed_start_time: string | null; // HH:MM:SS format
  price_per_participant: number | null; // For tours
  max_participants_per_day: number | null; // For tours
  created_at?: string;
};

// For backward compatibility - alias Activity as MenuItem
export type MenuItem = Activity;

// For the 'booking_details' JSONB column in the 'bookings' table
export type BookingDetail = {
  activity_id: string; // using activity_id for the new schema
  quantity: number;
  name: string;
  price_at_purchase: number;
};

// For backward compatibility
export type OrderDetail = BookingDetail;

// Based on the 'bookings' table (database table name)
export type Booking = {
  id: string;
  vendor_id: string;
  booking_details: BookingDetail[]; // using the actual database field name
  total_price: number;
  is_paid: boolean;
  is_fulfilled: boolean;
  created_at: string;
  customer_email?: string | null;
  // FastLane additions
  booking_date: string;
  booking_time: string;
  customer_name: string;
  customer_whatsapp?: string | null;
  comments?: string | null;
  booking_number: string;
  participant_count: number;
};

// For backward compatibility - alias Booking as Order
export type Order = Booking;

// For the client-side cart state (Zustand) - updated for FastLane
export type CartItem = {
  id: string; // This is the activity_id
  title: string;
  description?: string | null;
  price: number;
  image_url: string | null;
  quantity: number;
  // FastLane additions for booking
  duration_minutes?: number;
  meeting_point?: string | null;
  max_participants?: number;
  // Tour system additions
  activity_type?: 'regular' | 'tour';
  active_days?: number[] | null; // [1,2,3,4,5,6,7] where 1=Monday, 7=Sunday
  fixed_start_time?: string | null;
  price_per_participant?: number | null;
  max_participants_per_day?: number | null;
};

// Composite type for the public vendor page, nesting categories and activities
export type VendorWithActivities = Vendor & {
  categories: (Category & {
    activities: Activity[];
  })[];
};

// For backward compatibility
export type VendorWithMenu = VendorWithActivities;

export interface Lead {
  id: string
  business_name: string
  contact_email: string
  business_type: string
  message?: string
  created_at: string
  updated_at: string
}

// Currency context type for React context
export type CurrencyContextType = {
  currency: Currency;
  formatPrice: (price: number) => string;
  formatCurrency: (amount: number, currencyCode?: string) => string;
}; 