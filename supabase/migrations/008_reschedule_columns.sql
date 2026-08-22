-- Add columns to support exact workout rescheduling
ALTER TABLE public.daily_workouts
ADD COLUMN original_scheduled_date DATE,
ADD COLUMN is_rescheduled BOOLEAN DEFAULT false;
