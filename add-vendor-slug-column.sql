-- Add slug column to vendors table for custom URLs
-- This migration adds a slug column and generates initial slugs based on vendor names

-- Step 1: Add slug column to vendors table
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS slug TEXT;

-- Step 2: Add unique constraint on slug (will be added after populating data)
-- We'll add this constraint after generating slugs to avoid conflicts

-- Step 3: Generate initial slugs for existing vendors
-- This function creates URL-friendly slugs from vendor names
CREATE OR REPLACE FUNCTION generate_vendor_slug(vendor_name TEXT, vendor_id UUID)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Create base slug from vendor name
    base_slug := LOWER(TRIM(vendor_name));
    base_slug := REGEXP_REPLACE(base_slug, '[^a-z0-9\s-]', '', 'g'); -- Remove special chars
    base_slug := REGEXP_REPLACE(base_slug, '\s+', '-', 'g'); -- Replace spaces with hyphens
    base_slug := REGEXP_REPLACE(base_slug, '-+', '-', 'g'); -- Replace multiple hyphens with single
    base_slug := TRIM(base_slug, '-'); -- Remove leading/trailing hyphens
    
    -- If base_slug is empty, use vendor-{id}
    IF base_slug = '' OR base_slug IS NULL THEN
        base_slug := 'vendor-' || SUBSTRING(vendor_id::TEXT FROM 1 FOR 8);
    END IF;
    
    -- Ensure slug is unique
    final_slug := base_slug;
    WHILE EXISTS (SELECT 1 FROM vendors WHERE slug = final_slug AND id != vendor_id) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Update existing vendors with generated slugs
UPDATE vendors 
SET slug = generate_vendor_slug(COALESCE(name, 'vendor'), id)
WHERE slug IS NULL;

-- Step 5: Add unique constraint on slug
ALTER TABLE vendors ADD CONSTRAINT vendors_slug_unique UNIQUE (slug);

-- Step 6: Add index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_vendors_slug ON vendors(slug);

-- Step 7: Clean up the temporary function
DROP FUNCTION IF EXISTS generate_vendor_slug(TEXT, UUID);

-- Step 8: Add a trigger to automatically generate slugs for new vendors
CREATE OR REPLACE FUNCTION auto_generate_vendor_slug()
RETURNS TRIGGER AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Only generate slug if it's not provided
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        -- Create base slug from vendor name
        base_slug := LOWER(TRIM(COALESCE(NEW.name, 'vendor')));
        base_slug := REGEXP_REPLACE(base_slug, '[^a-z0-9\s-]', '', 'g');
        base_slug := REGEXP_REPLACE(base_slug, '\s+', '-', 'g');
        base_slug := REGEXP_REPLACE(base_slug, '-+', '-', 'g');
        base_slug := TRIM(base_slug, '-');
        
        -- If base_slug is empty, use vendor-{id}
        IF base_slug = '' OR base_slug IS NULL THEN
            base_slug := 'vendor-' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 8);
        END IF;
        
        -- Ensure slug is unique
        final_slug := base_slug;
        WHILE EXISTS (SELECT 1 FROM vendors WHERE slug = final_slug AND id != NEW.id) LOOP
            counter := counter + 1;
            final_slug := base_slug || '-' || counter;
        END LOOP;
        
        NEW.slug := final_slug;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating slugs
DROP TRIGGER IF EXISTS trigger_auto_generate_vendor_slug ON vendors;
CREATE TRIGGER trigger_auto_generate_vendor_slug
    BEFORE INSERT OR UPDATE ON vendors
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_vendor_slug();

-- Verification query (optional - for testing)
-- SELECT id, name, slug FROM vendors ORDER BY created_at; 