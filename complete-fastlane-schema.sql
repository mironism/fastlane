-- Complete FastLane Database Schema
-- Run this in Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- 1. Vendors Table
CREATE TABLE IF NOT EXISTS vendors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    description TEXT,
    location TEXT,
    profile_picture_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT vendors_user_id_unique UNIQUE (user_id)
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Activities Table (FastLane main table)
CREATE TABLE IF NOT EXISTS activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    image_url TEXT,
    -- FastLane specific fields
    duration_minutes INTEGER DEFAULT 60,
    meeting_point TEXT,
    requirements TEXT,
    max_participants INTEGER DEFAULT 4,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Bookings Table (FastLane main booking table)
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    booking_details JSONB NOT NULL DEFAULT '[]',
    total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_paid BOOLEAN DEFAULT FALSE,
    is_fulfilled BOOLEAN DEFAULT FALSE,
    -- FastLane booking fields
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_whatsapp TEXT,
    booking_number TEXT UNIQUE,
    participant_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create sequence for booking numbers
CREATE SEQUENCE IF NOT EXISTS booking_number_seq START 100000;

-- 6. Function to generate booking numbers
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'FB' || LPAD(nextval('booking_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger function for auto-generating booking numbers
CREATE OR REPLACE FUNCTION set_booking_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_number IS NULL THEN
        NEW.booking_number := generate_booking_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger for booking numbers
DROP TRIGGER IF EXISTS trigger_set_booking_number ON bookings;
CREATE TRIGGER trigger_set_booking_number
    BEFORE INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION set_booking_number();

-- 9. Auto-create vendor profile function
CREATE OR REPLACE FUNCTION create_vendor_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO vendors (user_id, name, created_at)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Vendor'),
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create trigger for auto vendor creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_vendor_profile();

-- 11. Enable RLS on all tables
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- 12. RLS Policies for vendors
CREATE POLICY "Users can view all vendors" ON vendors FOR SELECT USING (true);
CREATE POLICY "Users can update own vendor" ON vendors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vendor" ON vendors FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 13. RLS Policies for categories
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Vendors can manage own categories" ON categories FOR ALL USING (
    vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
);

-- 14. RLS Policies for activities
CREATE POLICY "Anyone can view activities" ON activities FOR SELECT USING (true);
CREATE POLICY "Vendors can manage own activities" ON activities FOR ALL USING (
    vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
);

-- 15. RLS Policies for bookings
CREATE POLICY "Vendors can view own bookings" ON bookings FOR SELECT USING (
    vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
);
CREATE POLICY "Anyone can create bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Vendors can update own bookings" ON bookings FOR UPDATE USING (
    vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
);

-- 16. Create existing vendor profiles for current users
INSERT INTO vendors (user_id, name, created_at)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', 'Existing User'), 
    created_at
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM vendors WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING; 