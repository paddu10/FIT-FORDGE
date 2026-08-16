-- Adding Calisthenics progression paths to exercises

-- PUSH-UPS
INSERT INTO public.exercises (name, description, muscle_group, difficulty, equipment, instructions, default_sets, default_reps, rest_duration_seconds) VALUES
('Wall Push-up', 'Beginner pushing.', 'Chest', 'Beginner', 'None', 'Stand by a wall, push away.', 3, 15, 60),
('Diamond Push-up', 'Triceps and inner chest focus.', 'Chest', 'Intermediate', 'None', 'Hands close together forming a diamond.', 3, 10, 60),
('Decline Push-up', 'Upper chest focus.', 'Chest', 'Advanced', 'None', 'Feet elevated, hands on floor.', 3, 10, 60),
('Archer Push-up', 'Unilateral pushing.', 'Chest', 'Advanced', 'None', 'Shift weight to one side, keeping other arm straight.', 3, 8, 90);

-- PULL-UPS
INSERT INTO public.exercises (name, description, muscle_group, difficulty, equipment, instructions, default_sets, default_reps, rest_duration_seconds) VALUES
('Dead Hang', 'Grip strength and shoulder mobility.', 'Back', 'Beginner', 'Pull-up bar', 'Hang from bar with active shoulders.', 3, NULL, 60),
('Scapular Pull-up', 'Initial pull movement.', 'Back', 'Beginner', 'Pull-up bar', 'From dead hang, depress scapula.', 3, 10, 60),
('Australian Row', 'Horizontal pulling.', 'Back', 'Beginner', 'Pull-up bar', 'Row body up to a low bar or rings.', 3, 12, 60),
('Negative Pull-up', 'Eccentric strength.', 'Back', 'Intermediate', 'Pull-up bar', 'Jump up to top position, lower slowly.', 3, 5, 90),
('Assisted Pull-up', 'Building full range strength.', 'Back', 'Intermediate', 'Resistance bands', 'Use a band for assistance.', 3, 8, 90),
('Pull-up', 'Vertical pulling master.', 'Back', 'Advanced', 'Pull-up bar', 'Pull chin over bar.', 3, 8, 90),
('Chest-to-Bar Pull-up', 'Explosive pulling.', 'Back', 'Advanced', 'Pull-up bar', 'Pull aggressively until chest touches bar.', 3, 5, 120);

-- CORE
INSERT INTO public.exercises (name, description, muscle_group, difficulty, equipment, instructions, default_sets, default_reps, rest_duration_seconds) VALUES
('Dead Bug', 'Core stability.', 'Core', 'Beginner', 'None', 'Extend opposite arm and leg while bracing core.', 3, 12, 60),
('Hanging Knee Raise', 'Lower core.', 'Core', 'Intermediate', 'Pull-up bar', 'Hang from bar, raise knees to chest.', 3, 10, 60),
('Hanging Leg Raise', 'Advanced core.', 'Core', 'Advanced', 'Pull-up bar', 'Hang from bar, raise straight legs to 90 degrees.', 3, 8, 90),
('Tuck L-Sit', 'Isometric core and compression.', 'Core', 'Intermediate', 'None', 'Hold body up on hands with knees tucked.', 3, NULL, 60),
('L-Sit', 'Advanced isometric.', 'Core', 'Advanced', 'None', 'Hold body up on hands with legs straight.', 3, NULL, 90);

-- SKILLS
INSERT INTO public.exercises (name, description, muscle_group, difficulty, equipment, instructions, default_sets, default_reps, rest_duration_seconds) VALUES
('Wall Pike Hold', 'Handstand prep.', 'Shoulders', 'Beginner', 'None', 'Feet on wall, hips high, hold.', 3, NULL, 60),
('Wall Handstand', 'Vertical pressing balance.', 'Shoulders', 'Intermediate', 'None', 'Kick up against wall, hold.', 3, NULL, 90),
('Shoulder Taps (Wall)', 'Balance shift.', 'Shoulders', 'Advanced', 'None', 'In wall handstand, shift weight and tap opposite shoulder.', 3, 10, 90),
('Freestanding Handstand', 'Ultimate balance.', 'Shoulders', 'Advanced', 'None', 'Hold a handstand without support.', 3, NULL, 120);
