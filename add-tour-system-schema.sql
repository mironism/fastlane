-- Tour System Enhancement for FastLane
-- Add tour-specific fields to existing activities table
-- Run this in Supabase SQL Editor

-- 1. Add activity_type enum to activities table
DO $$ 
BEGIN
    -- Create enum type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_type_enum') THEN
        CREATE TYPE activity_type_enum AS ENUM ('regular', 'tour');
    END IF;
END $$;

-- 2. Add new columns to activities table
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS activity_type activity_type_enum DEFAULT 'regular',
ADD COLUMN IF NOT EXISTS active_days JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS fixed_start_time TIME DEFAULT NULL,
ADD COLUMN IF NOT EXISTS price_per_participant DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS max_participants_per_day INTEGER DEFAULT NULL;

-- 3. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_activities_activity_type ON activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_active_days ON activities USING GIN(active_days);

-- 4. Add constraints for tour-specific fields
-- Tours must have all required fields filled
ALTER TABLE activities 
ADD CONSTRAINT check_tour_fields 
CHECK (
    activity_type = 'regular' OR 
    (
        activity_type = 'tour' AND 
        active_days IS NOT NULL AND 
        fixed_start_time IS NOT NULL AND 
        price_per_participant IS NOT NULL AND 
        max_participants_per_day IS NOT NULL
    )
);

-- 5. Add comment to explain the schema
COMMENT ON COLUMN activities.activity_type IS 'Type of activity: regular (flexible time slots) or tour (fixed schedule)';
COMMENT ON COLUMN activities.active_days IS 'JSON array of active weekdays for tours [1,2,3,4,5,6,7] where 1=Monday, 7=Sunday';
COMMENT ON COLUMN activities.fixed_start_time IS 'Fixed start time for tours (e.g., 07:30:00)';
COMMENT ON COLUMN activities.price_per_participant IS 'Price per participant for tours (overrides base price)';
COMMENT ON COLUMN activities.max_participants_per_day IS 'Maximum number of participants allowed per day for tours'; 