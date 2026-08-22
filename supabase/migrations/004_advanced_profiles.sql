-- Add advanced profiling columns to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS push_up_ability TEXT,
  ADD COLUMN IF NOT EXISTS pull_up_ability TEXT,
  ADD COLUMN IF NOT EXISTS plank_ability TEXT,
  ADD COLUMN IF NOT EXISTS training_location TEXT,
  ADD COLUMN IF NOT EXISTS limitations TEXT[];

-- Ensure personal_records table exists
CREATE TABLE IF NOT EXISTS public.personal_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    record_type TEXT NOT NULL, -- e.g., 'reps', 'weight', 'time'
    record_value NUMERIC NOT NULL,
    achieved_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for personal_records
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own personal_records" 
    ON public.personal_records FOR ALL 
    USING (auth.uid() = user_id);
