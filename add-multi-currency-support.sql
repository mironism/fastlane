-- Add Multi-Currency Support to FastLane
-- Run this in Supabase SQL Editor

-- 1. Add currency field to vendors table
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'EUR' NOT NULL;

-- 2. Create currencies table for supported currencies
CREATE TABLE IF NOT EXISTS currencies (
    code VARCHAR(3) PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL,
    name VARCHAR(50) NOT NULL,
    decimal_places INTEGER DEFAULT 2,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Insert supported currencies
INSERT INTO currencies (code, symbol, name, decimal_places) VALUES
('EUR', '€', 'Euro', 2),
('CHF', 'CHF', 'Swiss Franc', 2),
('TRY', '₺', 'Turkish Lira', 2),
('IDR', 'Rp', 'Indonesian Rupiah', 0)
ON CONFLICT (code) DO NOTHING;

-- 4. Add index for currency lookups
CREATE INDEX IF NOT EXISTS idx_vendors_currency ON vendors(currency);

-- 5. Add foreign key constraint (optional, for data integrity)
ALTER TABLE vendors 
ADD CONSTRAINT fk_vendors_currency 
FOREIGN KEY (currency) REFERENCES currencies(code);

-- 6. Enable RLS on currencies table
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;

-- 7. Create policy to allow anyone to view currencies
CREATE POLICY "Anyone can view currencies" ON currencies
  FOR SELECT 
  USING (true);

-- 8. Create policy to allow authenticated users to manage currencies (admin only)
CREATE POLICY "Authenticated users can manage currencies" ON currencies
  FOR ALL 
  USING (auth.role() = 'authenticated');

-- 9. Update existing vendors to have EUR as default currency (if not already set)
UPDATE vendors SET currency = 'EUR' WHERE currency IS NULL;

-- 10. Add comment to explain the currency field
COMMENT ON COLUMN vendors.currency IS 'ISO 4217 currency code (EUR, CHF, TRY, IDR)';
COMMENT ON TABLE currencies IS 'Supported currencies for vendor pricing'; 