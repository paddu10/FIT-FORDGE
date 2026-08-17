-- 010_diet_plans.sql
-- Create food_items and diet_plans tables to track user daily nutrition

-- 1. Create the food_items table (since it didn't exist)
CREATE TABLE IF NOT EXISTS public.food_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    food_name TEXT NOT NULL,
    category TEXT, -- Breakfast, Lunch, Snack, Dinner
    calories NUMERIC,
    protein NUMERIC,
    carbs NUMERIC,
    fat NUMERIC,
    fiber NUMERIC,
    sugar NUMERIC,
    sodium NUMERIC,
    vegetarian BOOLEAN DEFAULT false,
    vegan BOOLEAN DEFAULT false,
    description TEXT,
    serving_size TEXT,
    health_benefits TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Insert some starter food items
INSERT INTO public.food_items (food_name, category, calories, protein, carbs, fat, vegetarian, vegan, serving_size, description, health_benefits) VALUES
('Oatmeal with Banana & Peanut Butter', 'Breakfast', 450, 15, 60, 18, true, true, '1 Bowl', 'Hearty oats cooked in almond milk with sliced bananas.', 'High in fiber and heart-healthy fats.'),
('Greek Yogurt with Berries', 'Breakfast', 250, 20, 30, 5, true, false, '1 Cup', 'Thick Greek yogurt topped with fresh mixed berries.', 'High in protein and antioxidants.'),
('Scrambled Eggs with Avocado Toast', 'Breakfast', 400, 22, 30, 25, true, false, '2 Eggs + 1 Toast', 'Farm fresh eggs scrambled with whole wheat avocado toast.', 'Rich in healthy fats and quality protein.'),
('Chickpea & Spinach Curry', 'Lunch', 500, 18, 70, 15, true, true, '1 Bowl + Rice', 'Rich tomato-based curry with chickpeas and spinach.', 'High in iron and plant-based protein.'),
('Grilled Chicken Salad', 'Lunch', 450, 40, 15, 20, false, false, '1 Large Bowl', 'Mixed greens, grilled chicken breast, olive oil dressing.', 'Lean protein for muscle recovery.'),
('Lentil Soup (Dal)', 'Lunch', 350, 18, 55, 5, true, true, '1 Bowl', 'Comforting yellow lentil soup with cumin and turmeric.', 'Excellent source of fiber and folate.'),
('Roasted Almonds', 'Snack', 200, 7, 6, 18, true, true, '1 Handful (30g)', 'Lightly salted roasted almonds.', 'Healthy monounsaturated fats.'),
('Protein Shake', 'Snack', 150, 25, 5, 2, true, false, '1 Scoop (30g)', 'Whey protein isolate mixed with water.', 'Fast-absorbing protein for muscle repair.'),
('Paneer Tikka', 'Snack', 300, 18, 10, 22, true, false, '150g', 'Grilled cottage cheese cubes marinated in yogurt and spices.', 'Rich in calcium and casein protein.'),
('Grilled Salmon with Asparagus', 'Dinner', 550, 45, 10, 30, false, false, '1 Fillet', 'Fresh caught salmon baked with lemon and herbs.', 'High in Omega-3 fatty acids.'),
('Tofu Stir-fry with Quinoa', 'Dinner', 450, 22, 55, 15, true, true, '1 Bowl', 'Firm tofu tossed with broccoli, bell peppers, and soy sauce.', 'Complete plant-based protein profile.'),
('Chicken Breast with Sweet Potato', 'Dinner', 600, 50, 65, 10, false, false, '200g Chicken', 'Oven-roasted chicken breast with baked sweet potato.', 'Perfect post-workout complex carbs and protein.')
ON CONFLICT DO NOTHING;

-- 3. Create the diet_plans table
CREATE TABLE IF NOT EXISTS public.diet_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    food_id UUID REFERENCES public.food_items(id) ON DELETE CASCADE,
    plan_date DATE NOT NULL,
    meal_type TEXT,
    quantity NUMERIC DEFAULT 1,
    unit TEXT DEFAULT 'serving',
    status TEXT DEFAULT 'pending', -- 'pending', 'eaten'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own diet plans
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'diet_plans' AND policyname = 'Users can view own diet plans'
    ) THEN
        CREATE POLICY "Users can view own diet plans" ON public.diet_plans FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'diet_plans' AND policyname = 'Users can insert own diet plans'
    ) THEN
        CREATE POLICY "Users can insert own diet plans" ON public.diet_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'diet_plans' AND policyname = 'Users can update own diet plans'
    ) THEN
        CREATE POLICY "Users can update own diet plans" ON public.diet_plans FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'diet_plans' AND policyname = 'Users can delete own diet plans'
    ) THEN
        CREATE POLICY "Users can delete own diet plans" ON public.diet_plans FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;
