-- Auto-create vendor profile when user signs up
-- Run this in Supabase SQL Editor

-- First, add unique constraint on user_id if it doesn't exist
ALTER TABLE vendors ADD CONSTRAINT vendors_user_id_unique UNIQUE (user_id);

-- Function to create vendor profile for new users
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

-- Trigger to automatically create vendor profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_vendor_profile();

-- Also create vendor profiles for existing users (if any)
INSERT INTO vendors (user_id, name, created_at)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', 'Existing User'), 
    created_at
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM vendors WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING; 