-- Fix Row Level Security for workouts and daily_workout_exercises inserts
-- This enables the WorkoutEngine to generate custom workout templates

-- 1. Allow authenticated users to create new workout templates
CREATE POLICY "Authenticated users can create workouts" 
    ON public.workouts FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- 2. Ensure daily_workout_exercises has an explicit INSERT policy
-- (It currently only has an ALL policy with a USING clause, which works for INSERT but this is safer)
CREATE POLICY "Users can insert daily_workout_exercises" 
    ON public.daily_workout_exercises FOR INSERT 
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.daily_workouts dw 
        WHERE dw.id = daily_workout_id AND dw.user_id = auth.uid()
      )
    );
