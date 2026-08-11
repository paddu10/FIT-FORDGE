-- Seed Data for FitForge

-- Exercises
INSERT INTO public.exercises (name, description, muscle_group, difficulty, equipment, instructions, default_sets, default_reps, rest_duration_seconds) VALUES
('Push-ups', 'A classic upper body exercise.', 'Chest', 'Intermediate', 'None', 'Keep body straight. Lower until chest is near floor. Push up.', 3, 12, 60),
('Incline push-ups', 'Easier push-up variation.', 'Chest', 'Beginner', 'None', 'Hands on elevated surface. Lower and push up.', 3, 12, 60),
('Knee push-ups', 'Beginner push-up variation.', 'Chest', 'Beginner', 'None', 'Knees on floor. Lower and push up.', 3, 12, 60),
('Squats', 'Lower body staple.', 'Legs', 'Beginner', 'None', 'Keep chest up, lower hips until thighs are parallel to floor.', 3, 15, 60),
('Reverse lunges', 'Great for glutes and quads.', 'Legs', 'Intermediate', 'None', 'Step back and lower hips until both knees are bent at 90 degrees.', 3, 12, 60),
('Forward lunges', 'Standard lunge.', 'Legs', 'Intermediate', 'None', 'Step forward and lower hips.', 3, 12, 60),
('Bulgarian split squat', 'Advanced single-leg exercise.', 'Legs', 'Advanced', 'None', 'Rear foot elevated. Lower hips.', 3, 10, 90),
('Glute bridge', 'Activates the glutes.', 'Glutes', 'Beginner', 'None', 'Lie on back, knees bent. Lift hips toward ceiling.', 3, 15, 60),
('Plank', 'Core isometric hold.', 'Core', 'Intermediate', 'None', 'Hold body straight supported by forearms and toes.', 3, NULL, 60),
('Side plank', 'Oblique hold.', 'Core', 'Intermediate', 'None', 'Hold body straight on one side.', 3, NULL, 60),
('Mountain climbers', 'Dynamic core and cardio.', 'Core', 'Beginner', 'None', 'From plank, alternately bring knees to chest fast.', 3, 30, 60),
('Burpees', 'Full body cardio.', 'Full Body', 'Advanced', 'None', 'Drop to floor, jump feet back, push up, jump feet in, jump up.', 3, 10, 60),
('Jumping jacks', 'Warmup cardio.', 'Full Body', 'Beginner', 'None', 'Jump legs apart and arms up.', 3, 30, 45),
('Crunches', 'Basic abdominal exercise.', 'Core', 'Beginner', 'None', 'Lie on back, lift shoulders off floor.', 3, 20, 45),
('Dumbbell curl', 'Bicep isolation.', 'Arms', 'Beginner', 'Dumbbells', 'Curl weights toward shoulders.', 3, 12, 60),
('Dumbbell shoulder press', 'Overhead pressing.', 'Shoulders', 'Intermediate', 'Dumbbells', 'Press weights overhead.', 3, 10, 60),
('Dumbbell lateral raise', 'Shoulder width.', 'Shoulders', 'Intermediate', 'Dumbbells', 'Raise weights to sides.', 3, 12, 60),
('Dumbbell row', 'Back thickness.', 'Back', 'Intermediate', 'Dumbbells', 'Bend over, pull weight to hip.', 3, 10, 60),
('Resistance band pull-apart', 'Upper back health.', 'Back', 'Beginner', 'Resistance bands', 'Pull band apart in front of chest.', 3, 15, 45);

-- Meals
INSERT INTO public.meals (name, meal_type, diet_type, calories, protein, carbs, fat, ingredients, instructions) VALUES
('Oats + Milk + Banana + Peanut Butter', 'Breakfast', 'Vegetarian', 520, 22, 65, 18, 'Oats, Milk, Banana, Peanut Butter', 'Mix oats with milk, slice banana, top with peanut butter.'),
('Scrambled Eggs with Toast', 'Breakfast', 'Eggetarian', 450, 25, 30, 20, 'Eggs, Whole Wheat Bread, Butter', 'Scramble 3 eggs, serve with 2 slices of toasted bread.'),
('Chicken Salad', 'Lunch', 'Non-vegetarian', 600, 45, 15, 25, 'Chicken Breast, Mixed Greens, Olive Oil, Tomatoes', 'Grill chicken, toss with greens and dressing.'),
('Rice + Dal + Paneer + Vegetables', 'Lunch', 'Vegetarian', 720, 35, 80, 25, 'Rice, Dal, Paneer, Mixed Veggies', 'Cook rice and dal. Sauté paneer with vegetables.'),
('Banana + Milk + Nuts', 'Snack', 'Vegetarian', 350, 15, 35, 18, 'Banana, Milk, Almonds', 'Eat together or blend into a smoothie.'),
('Grilled Chicken and Sweet Potato', 'Dinner', 'Non-vegetarian', 700, 50, 60, 15, 'Chicken Breast, Sweet Potato, Broccoli', 'Grill chicken, bake sweet potato, steam broccoli.'),
('Chapati + Paneer + Vegetables', 'Dinner', 'Vegetarian', 700, 40, 75, 20, 'Whole Wheat Flour, Paneer, Veggies', 'Make chapatis, serve with paneer curry and veggies.');

-- Achievements
INSERT INTO public.achievements (name, description, condition_type, condition_value, icon_name) VALUES
('First Workout', 'Complete your first workout!', 'workouts_completed', 1, 'Trophy'),
('7 Day Streak', 'Keep a streak for 7 days.', 'streak_days', 7, 'Flame'),
('14 Day Streak', 'Keep a streak for 14 days.', 'streak_days', 14, 'Flame'),
('30 Day Streak', 'Keep a streak for 30 days.', 'streak_days', 30, 'Flame'),
('50 Workouts', 'Complete 50 workouts.', 'workouts_completed', 50, 'Activity'),
('100 Workouts', 'Complete 100 workouts.', 'workouts_completed', 100, 'Activity'),
('10 Tasks Completed', 'Complete 10 daily tasks.', 'tasks_completed', 10, 'CheckCircle'),
('100 Tasks Completed', 'Complete 100 daily tasks.', 'tasks_completed', 100, 'CheckCircle');
