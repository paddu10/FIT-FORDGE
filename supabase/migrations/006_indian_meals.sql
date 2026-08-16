-- Add Indian meals to the meals table
INSERT INTO public.meals (name, calories, protein, carbs, fat, ingredients, meal_type, diet_type) VALUES
('Poha with Peanuts', 350, 8, 55, 12, 'Flattened rice, peanuts, onions, mustard seeds, turmeric', 'Breakfast', 'Vegetarian'),
('Masala Oats', 250, 10, 40, 5, 'Oats, mixed vegetables, spices', 'Breakfast', 'Vegetarian'),
('Moong Dal Chilla', 300, 15, 45, 8, 'Moong dal batter, paneer stuffing, green chutney', 'Breakfast', 'Vegetarian'),
('Egg Bhurji with Whole Wheat Toast', 400, 22, 35, 18, '3 whole eggs, onions, tomatoes, 2 slices whole wheat bread', 'Breakfast', 'Eggetarian'),
('Paneer Tikka with Mint Chutney', 450, 25, 15, 30, '200g Paneer, yogurt marinade, mint, coriander', 'Snack', 'Vegetarian'),
('Roasted Makhana (Fox Nuts)', 150, 5, 28, 2, 'Makhana roasted in ghee with rock salt and pepper', 'Snack', 'Vegetarian'),
('Boiled Egg Chaat', 250, 18, 10, 15, '3 boiled eggs, onions, tomatoes, chaat masala, lemon', 'Snack', 'Eggetarian'),
('Rajma Chawal', 550, 18, 85, 10, 'Kidney bean curry, basmati rice, side salad', 'Lunch', 'Vegetarian'),
('Chicken Tikka Masala with Roti', 600, 45, 40, 25, 'Grilled chicken breast in tomato gravy, 2 whole wheat rotis', 'Lunch', 'Non-vegetarian'),
('Dal Tadka with Jeera Rice', 480, 16, 75, 12, 'Yellow lentils tempered with ghee, cumin rice', 'Lunch', 'Vegetarian'),
('Soya Chunk Curry with Brown Rice', 520, 30, 65, 8, 'Soya chunks cooked in onion-tomato gravy, brown rice', 'Lunch', 'Vegetarian'),
('Fish Curry (Machher Jhol) with Rice', 580, 35, 60, 18, 'White fish in mustard gravy, rice', 'Dinner', 'Non-vegetarian'),
('Palak Paneer with Roti', 500, 22, 35, 28, 'Spinach gravy with 150g paneer, 2 whole wheat rotis', 'Dinner', 'Vegetarian'),
('Tandoori Chicken with Salad', 450, 50, 10, 20, 'Half tandoori chicken, cucumber, onion, lemon', 'Dinner', 'Non-vegetarian'),
('Mixed Vegetable Sabzi with Dal', 400, 15, 50, 15, 'Carrots, peas, beans, yellow dal, 2 rotis', 'Dinner', 'Vegetarian');
