-- 009_more_exercises.sql
-- A comprehensive list of gym, calisthenics, and dumbbell exercises to provide maximum variety for the WorkoutEngine.

-- CHEST (Push)
INSERT INTO public.exercises (name, description, muscle_group, difficulty, equipment, instructions, default_sets, default_reps, rest_duration_seconds) VALUES
('Bench Press', 'Classic barbell chest press.', 'Chest', 'Intermediate', 'Barbell', 'Lie on bench, unrack barbell, lower to chest, press up.', 4, 10, 90),
('Incline Dumbbell Press', 'Upper chest focus.', 'Chest', 'Intermediate', 'Dumbbells', 'Set bench to 30-45 degrees, press dumbbells overhead.', 3, 12, 90),
('Cable Crossover', 'Chest isolation.', 'Chest', 'Intermediate', 'Cables', 'Stand between pulleys, pull handles together in front of chest.', 3, 15, 60),
('Dumbbell Flyes', 'Chest stretch and squeeze.', 'Chest', 'Intermediate', 'Dumbbells', 'Lie on bench, lower dumbbells in wide arc, bring together.', 3, 12, 60),
('Pike Push-up', 'Shoulder and upper chest focus bodyweight.', 'Chest', 'Intermediate', 'None', 'Start in downward dog, bend elbows to lower head to floor, push up.', 3, 10, 60);

-- BACK (Pull)
INSERT INTO public.exercises (name, description, muscle_group, difficulty, equipment, instructions, default_sets, default_reps, rest_duration_seconds) VALUES
('Barbell Row', 'Heavy horizontal pull.', 'Back', 'Intermediate', 'Barbell', 'Hinge at hips, pull barbell to lower chest.', 4, 10, 90),
('Lat Pulldown', 'Vertical cable pull.', 'Back', 'Beginner', 'Cables', 'Sit at machine, pull bar to upper chest.', 3, 12, 60),
('Seated Cable Row', 'Horizontal cable pull.', 'Back', 'Beginner', 'Cables', 'Sit at machine, pull handle to stomach.', 3, 12, 60),
('Face Pulls', 'Rear delts and upper back health.', 'Back', 'Beginner', 'Cables', 'Pull cable attachment to face, separating hands.', 3, 15, 60),
('T-Bar Row', 'Mid-back thickness.', 'Back', 'Intermediate', 'Machine', 'Stand over bar, pull handle to chest.', 3, 10, 90);

-- LEGS (Squat / Quads)
INSERT INTO public.exercises (name, description, muscle_group, difficulty, equipment, instructions, default_sets, default_reps, rest_duration_seconds) VALUES
('Barbell Back Squat', 'King of leg exercises.', 'Legs', 'Intermediate', 'Barbell', 'Barbell on traps, squat down until thighs break parallel, stand up.', 4, 8, 120),
('Leg Press', 'Quad focused machine.', 'Legs', 'Beginner', 'Machine', 'Sit in machine, press platform away.', 3, 12, 90),
('Leg Extension', 'Quad isolation.', 'Legs', 'Beginner', 'Machine', 'Sit in machine, extend legs.', 3, 15, 60),
('Goblet Squat', 'Front loaded squat.', 'Legs', 'Beginner', 'Dumbbells', 'Hold dumbbell at chest, squat down.', 3, 12, 60),
('Walking Lunges', 'Dynamic leg movement.', 'Legs', 'Intermediate', 'Dumbbells', 'Hold dumbbells, step forward into lunge, alternate legs.', 3, 20, 90),
('Calf Raises', 'Calf building.', 'Calves', 'Beginner', 'None', 'Stand on edge, raise heels up.', 3, 20, 45);

-- GLUTES / HAMSTRINGS (Hinge)
INSERT INTO public.exercises (name, description, muscle_group, difficulty, equipment, instructions, default_sets, default_reps, rest_duration_seconds) VALUES
('Romanian Deadlift (RDL)', 'Hamstring stretch and hinge.', 'Hamstrings', 'Intermediate', 'Barbell', 'Keep legs mostly straight, hinge at hips, lower barbell, squeeze glutes to stand.', 4, 10, 90),
('Conventional Deadlift', 'Ultimate full body pull.', 'Hamstrings', 'Advanced', 'Barbell', 'Lift barbell from floor by driving with legs and extending hips.', 3, 5, 180),
('Leg Curl', 'Hamstring isolation.', 'Hamstrings', 'Beginner', 'Machine', 'Lie or sit in machine, curl weight with legs.', 3, 15, 60),
('Hip Thrust', 'Maximal glute activation.', 'Glutes', 'Intermediate', 'Barbell', 'Upper back on bench, barbell on hips, drive hips up.', 3, 12, 90),
('Kettlebell Swing', 'Explosive hinge.', 'Glutes', 'Intermediate', 'Kettlebell', 'Hinge hips, explosively swing kettlebell to eye level.', 3, 15, 60);

-- SHOULDERS (Overhead)
INSERT INTO public.exercises (name, description, muscle_group, difficulty, equipment, instructions, default_sets, default_reps, rest_duration_seconds) VALUES
('Overhead Barbell Press', 'Strict military press.', 'Shoulders', 'Intermediate', 'Barbell', 'Press barbell overhead from collarbone.', 4, 8, 90),
('Arnold Press', 'Rotational shoulder press.', 'Shoulders', 'Intermediate', 'Dumbbells', 'Start with palms facing you, rotate palms away as you press up.', 3, 10, 60),
('Cable Lateral Raise', 'Constant tension delts.', 'Shoulders', 'Intermediate', 'Cables', 'Pull cable from low position out to side.', 3, 15, 60),
('Reverse Pec Deck', 'Rear delt isolation.', 'Shoulders', 'Beginner', 'Machine', 'Sit facing pad, pull handles backward.', 3, 15, 60),
('Front Raise', 'Anterior delt isolation.', 'Shoulders', 'Beginner', 'Dumbbells', 'Raise dumbbells straight in front of you.', 3, 12, 60);

-- ARMS (Biceps & Triceps)
INSERT INTO public.exercises (name, description, muscle_group, difficulty, equipment, instructions, default_sets, default_reps, rest_duration_seconds) VALUES
('Barbell Bicep Curl', 'Heavy bicep builder.', 'Arms', 'Beginner', 'Barbell', 'Curl barbell up to chest.', 3, 10, 60),
('Hammer Curl', 'Brachialis focus.', 'Arms', 'Beginner', 'Dumbbells', 'Curl dumbbells with neutral grip (palms facing each other).', 3, 12, 60),
('Tricep Pushdown', 'Cable tricep isolation.', 'Arms', 'Beginner', 'Cables', 'Push cable attachment down, locking out elbows.', 3, 15, 60),
('Overhead Tricep Extension', 'Long head tricep focus.', 'Arms', 'Intermediate', 'Dumbbells', 'Lower dumbbell behind head, extend arms up.', 3, 12, 60),
('Skullcrushers', 'Heavy tricep builder.', 'Arms', 'Intermediate', 'Barbell', 'Lie on bench, lower EZ bar to forehead, extend up.', 3, 10, 90);

-- CORE & CARDIO
INSERT INTO public.exercises (name, description, muscle_group, difficulty, equipment, instructions, default_sets, default_reps, rest_duration_seconds) VALUES
('Russian Twists', 'Oblique rotation.', 'Core', 'Beginner', 'None', 'Sit up slightly, twist torso side to side.', 3, 20, 60),
('Ab Wheel Rollout', 'Advanced core extension.', 'Core', 'Advanced', 'None', 'On knees, roll wheel out until body is straight, pull back.', 3, 10, 90),
('Cable Crunch', 'Weighted core.', 'Core', 'Intermediate', 'Cables', 'Kneel holding rope attachment, crunch downward.', 3, 15, 60),
('Jump Rope', 'Cardio interval.', 'Full Body', 'Beginner', 'None', 'Jump rope continuously.', 3, NULL, 60),
('Rowing Machine', 'Full body cardio.', 'Full Body', 'Beginner', 'Machine', 'Row for distance or time.', 1, NULL, 0);
