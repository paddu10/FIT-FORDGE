-- Row Level Security (RLS) Policies for FitForge

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read and update their own profile
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Reference Data: Authenticated users can read reference data
CREATE POLICY "Anyone can view exercises" 
    ON public.exercises FOR SELECT 
    USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Anyone can view workouts" 
    ON public.workouts FOR SELECT 
    USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Anyone can view workout_exercises" 
    ON public.workout_exercises FOR SELECT 
    USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Anyone can view meals" 
    ON public.meals FOR SELECT 
    USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Anyone can view achievements" 
    ON public.achievements FOR SELECT 
    USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- User Data: Users can only read, insert, update, and delete their own data
-- Daily Workouts
CREATE POLICY "Users can manage own daily_workouts" 
    ON public.daily_workouts FOR ALL 
    USING (auth.uid() = user_id);

-- Daily Workout Exercises
CREATE POLICY "Users can manage own daily_workout_exercises" 
    ON public.daily_workout_exercises FOR ALL 
    USING (
      EXISTS (
        SELECT 1 FROM public.daily_workouts dw 
        WHERE dw.id = daily_workout_id AND dw.user_id = auth.uid()
      )
    );

-- Daily Tasks
CREATE POLICY "Users can manage own daily_tasks" 
    ON public.daily_tasks FOR ALL 
    USING (auth.uid() = user_id);

-- Daily Meal Plans
CREATE POLICY "Users can manage own daily_meal_plans" 
    ON public.daily_meal_plans FOR ALL 
    USING (auth.uid() = user_id);

-- Progress Measurements
CREATE POLICY "Users can manage own progress_measurements" 
    ON public.progress_measurements FOR ALL 
    USING (auth.uid() = user_id);

-- User Achievements
CREATE POLICY "Users can manage own user_achievements" 
    ON public.user_achievements FOR ALL 
    USING (auth.uid() = user_id);
