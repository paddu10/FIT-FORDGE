-- Add training_days_pref array to profiles
-- 0 = Sunday, 1 = Monday, ..., 6 = Saturday
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS training_days_pref INT[] DEFAULT '{1,3,5}';

-- Add is_rest_day boolean to daily_workouts
ALTER TABLE public.daily_workouts
  ADD COLUMN IF NOT EXISTS is_rest_day BOOLEAN DEFAULT false;
