import { supabase } from './supabase';

export async function generateDailyDiet(userId: string) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Check if diet plan exists for today
    const { data: existingPlan, error: checkError } = await supabase
      .from('diet_plans')
      .select('id, status, meal_type, quantity, plan_date, food_items (*)')
      .eq('user_id', userId)
      .eq('plan_date', today);

    if (checkError) throw checkError;

    if (existingPlan && existingPlan.length > 0) {
      return existingPlan;
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profile) return [];

    // Calculate TDEE and Targets
    let bmr = 0;
    if (profile.gender?.toLowerCase() === 'female') {
      bmr = 10 * (profile.weight || 60) + 6.25 * (profile.height || 160) - 5 * (profile.age || 30) - 161;
    } else {
      bmr = 10 * (profile.weight || 75) + 6.25 * (profile.height || 175) - 5 * (profile.age || 30) + 5;
    }

    // Activity multiplier estimation (assume 1.55 for moderate if training days >= 3)
    const multiplier = (profile.training_days || 3) >= 4 ? 1.55 : 1.375;
    let tdee = bmr * multiplier;

    // Goal adjustment — match exact goal values from profiles
    const goal = (profile.goal || 'maintain').toLowerCase();
    let calorieTarget = tdee;
    if (goal === 'lose_weight') calorieTarget -= 500;
    if (goal === 'build_muscle') calorieTarget += 300;
    if (goal === 'get_stronger') calorieTarget += 200;

    // Protein Target
    let proteinTarget = (profile.weight || 70) * (goal === 'build_muscle' ? 2.2 : 1.8);

    // Fetch food — no filtering if non-vegetarian, filter only for veg/vegan
    const pref = (profile.diet_preference || 'non_vegetarian').toLowerCase();
    let query = supabase.from('food_items').select('*');

    if (pref === 'vegan') {
      query = query.eq('vegan', true);
    } else if (pref === 'vegetarian' || pref === 'eggetarian') {
      query = query.eq('vegetarian', true);
    }
    // non_vegetarian: no filter — show all foods

    const { data: foods, error: foodsError } = await query;
    if (foodsError || !foods || foods.length === 0) {
      // Last resort fallback — fetch everything without any filter
      const { data: allFoods } = await supabase.from('food_items').select('*');
      if (!allFoods || allFoods.length === 0) {
        console.warn('No foods found at all — check food_items table and RLS.');
        return [];
      }
      // Use all foods
      const pickFoodFallback = (category: string) => {
        const c = allFoods.filter(f => (f.category || '').toLowerCase().includes(category.toLowerCase()));
        return c.length > 0 ? c[Math.floor(Math.random() * c.length)] : allFoods[Math.floor(Math.random() * allFoods.length)];
      };
      const plansToInsertFallback = [
        { user_id: userId, plan_date: today, food_id: pickFoodFallback('breakfast').id, meal_type: 'Breakfast', status: 'pending', quantity: 1, unit: 'serving' },
        { user_id: userId, plan_date: today, food_id: pickFoodFallback('lunch').id, meal_type: 'Lunch', status: 'pending', quantity: 1, unit: 'serving' },
        { user_id: userId, plan_date: today, food_id: pickFoodFallback('snack').id, meal_type: 'Snack', status: 'pending', quantity: 1, unit: 'serving' },
        { user_id: userId, plan_date: today, food_id: pickFoodFallback('dinner').id, meal_type: 'Dinner', status: 'pending', quantity: 1, unit: 'serving' },
      ];
      await supabase.from('diet_plans').insert(plansToInsertFallback);
      const { data: fallbackPlan } = await supabase
        .from('diet_plans')
        .select('id, status, meal_type, quantity, unit, plan_date, food_items (*)')
        .eq('user_id', userId)
        .eq('plan_date', today);
      return fallbackPlan || [];
    }

    // Helper to pick random food by category
    const pickFood = (category: string) => {
      const candidates = foods.filter(f => (f.category || '').toLowerCase().includes(category.toLowerCase()));
      if (candidates.length === 0) return foods[Math.floor(Math.random() * foods.length)];
      return candidates[Math.floor(Math.random() * candidates.length)];
    };

    const breakfast = pickFood('breakfast');
    const lunch = pickFood('lunch');
    const snack = pickFood('snack');
    const dinner = pickFood('dinner');

    // For simplicity, we assign 1 serving each. In a full system, you'd balance quantities to hit macros exactly.
    const plansToInsert = [
      { user_id: userId, plan_date: today, food_id: breakfast.id, meal_type: 'Breakfast', status: 'pending', quantity: 1, unit: 'serving' },
      { user_id: userId, plan_date: today, food_id: lunch.id, meal_type: 'Lunch', status: 'pending', quantity: 1, unit: 'serving' },
      { user_id: userId, plan_date: today, food_id: snack.id, meal_type: 'Snack', status: 'pending', quantity: 1, unit: 'serving' },
      { user_id: userId, plan_date: today, food_id: dinner.id, meal_type: 'Dinner', status: 'pending', quantity: 1, unit: 'serving' },
    ];

    await supabase.from('diet_plans').insert(plansToInsert);

    // Save calculated targets to profile so UI can use them if needed
    await supabase.from('profiles').update({
      calorie_target: Math.round(calorieTarget),
      protein_target: Math.round(proteinTarget)
    }).eq('id', userId);

    // Fetch again to get full join data
    const { data: newPlan } = await supabase
      .from('diet_plans')
      .select('id, status, meal_type, quantity, unit, plan_date, food_items (*)')
      .eq('user_id', userId)
      .eq('plan_date', today);

    return newPlan || [];
  } catch (error) {
    console.error('Error generating daily diet:', error);
    return [];
  }
}
