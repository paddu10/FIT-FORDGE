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

    // Goal adjustment
    const goal = (profile.goal || 'maintenance').toLowerCase();
    let calorieTarget = tdee;
    if (goal.includes('loss')) calorieTarget -= 500;
    if (goal.includes('gain') || goal.includes('muscle')) calorieTarget += 300;

    // Protein Target: approx 1.8g to 2.2g per kg of bodyweight
    let proteinTarget = (profile.weight || 70) * (goal.includes('muscle') ? 2.2 : 1.8);

    // Fetch food matching preference
    const pref = (profile.diet_preference || 'vegetarian').toLowerCase();
    let query = supabase.from('food_items').select('*');

    if (pref === 'vegan') {
      query = query.eq('vegan', true);
    } else if (pref === 'vegetarian') {
      query = query.eq('vegetarian', true);
    } else if (pref === 'eggetarian') {
      // Eggetarian: We assume food_items might have an 'eggetarian' tag or we just pull vegetarian + eggs.
      // If we don't have an exact eggetarian flag, we'll pull vegetarian.
      query = query.eq('vegetarian', true);
    }
    // Non-vegetarian has no restrictions

    const { data: foods, error: foodsError } = await query;
    if (foodsError || !foods || foods.length === 0) {
      console.warn('No foods found matching preference:', pref);
      return [];
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
      { user_id: userId, plan_date: today, food_id: breakfast.id, meal_type: 'Breakfast', status: 'pending', quantity: 1 },
      { user_id: userId, plan_date: today, food_id: lunch.id, meal_type: 'Lunch', status: 'pending', quantity: 1 },
      { user_id: userId, plan_date: today, food_id: snack.id, meal_type: 'Snack', status: 'pending', quantity: 1 },
      { user_id: userId, plan_date: today, food_id: dinner.id, meal_type: 'Dinner', status: 'pending', quantity: 1 },
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
      .select('id, status, meal_type, quantity, plan_date, food_items (*)')
      .eq('user_id', userId)
      .eq('plan_date', today);

    return newPlan || [];
  } catch (error) {
    console.error('Error generating daily diet:', error);
    return [];
  }
}
