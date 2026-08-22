-- Initial Schema for FitForge

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    age INTEGER,
    gender TEXT,
    height NUMERIC,
    weight NUMERIC,
    goal TEXT,
    fitness_level TEXT,
    equipment TEXT[],
    training_days INTEGER,
    training_duration INTEGER,
    diet_preference TEXT,
    allergies TEXT,
    bmi NUMERIC,
    bmr NUMERIC,
    tdee NUMERIC,
    calorie_target NUMERIC,
    protein_target NUMERIC,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_completed_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercises table (Reference data)
CREATE TABLE public.exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    muscle_group TEXT,
    difficulty TEXT,
    equipment TEXT,
    instructions TEXT,
    default_sets INTEGER,
    default_reps INTEGER,
    duration_seconds INTEGER,
    rest_duration_seconds INTEGER,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workout Templates
CREATE TABLE public.workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    goal TEXT,
    fitness_level TEXT,
    duration_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workout template exercises
CREATE TABLE public.workout_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE,
    sort_order INTEGER,
    sets INTEGER,
    reps INTEGER,
    rest_duration_seconds INTEGER
);

-- Daily workouts for users
CREATE TABLE public.daily_workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    workout_id UUID REFERENCES public.workouts(id),
    scheduled_date DATE NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, completed
    completed_at TIMESTAMPTZ,
    actual_duration_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily workout exercises for users
CREATE TABLE public.daily_workout_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    daily_workout_id UUID REFERENCES public.daily_workouts(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE,
    sort_order INTEGER,
    sets INTEGER,
    reps INTEGER,
    rest_duration_seconds INTEGER,
    completed_sets INTEGER DEFAULT 0
);

-- Daily tasks for users
CREATE TABLE public.daily_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- workout, water, meal, step, sleep
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meals table (Reference data)
CREATE TABLE public.meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    meal_type TEXT, -- Breakfast, Lunch, Snack, Dinner
    diet_type TEXT, -- Vegetarian, Eggetarian, Non-vegetarian
    calories INTEGER,
    protein INTEGER,
    carbs INTEGER,
    fat INTEGER,
    ingredients TEXT,
    instructions TEXT,
    portion_info TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Meal Plans for users
CREATE TABLE public.daily_meal_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    meal_id UUID REFERENCES public.meals(id),
    meal_type TEXT,
    status TEXT DEFAULT 'pending', -- pending, eaten
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progress Measurements
CREATE TABLE public.progress_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    weight NUMERIC,
    waist NUMERIC,
    chest NUMERIC,
    arms NUMERIC,
    thighs NUMERIC,
    bmi NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements (Reference data)
CREATE TABLE public.achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    condition_type TEXT,
    condition_value INTEGER,
    icon_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Achievements
CREATE TABLE public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Function to handle user creation automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when auth.user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
