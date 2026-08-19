-- 011_fix_food_items_rls.sql
-- Fix: food_items table had no RLS policy so authenticated users couldn't read it.
-- Also add diet_preference to profiles if missing.

-- Enable RLS on food_items (safe to run again)
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read food_items (shared reference data)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'food_items'
          AND policyname = 'Anyone can view food_items'
    ) THEN
        CREATE POLICY "Anyone can view food_items"
            ON public.food_items FOR SELECT
            USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
    END IF;
END $$;

-- Add diet_preference column to profiles if it doesn't already exist
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS diet_preference TEXT DEFAULT 'non_vegetarian';
