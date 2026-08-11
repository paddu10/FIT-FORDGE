import { supabase } from './supabase';

export async function generateDailyDiet(userId: string) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Check if diet plan exists for today
    const { data: existingPlan, error: checkError } = await supabase
      .from('daily_meal_plans')
      .select('id, status, meal_type, meals (*)')
      .eq('user_id', userId)
      .eq('date', today);

    if (checkError) throw checkError;

    if (existingPlan && existingPlan.length > 0) {
      return existingPlan;
    }

    // Fetch user profile for diet preference
    const { data: profile } = await supabase
      .from('profiles')
      .select('diet_preference')
      .eq('id', userId)
      .single();

    const pref = profile?.diet_preference || 'Vegetarian';
    let dietFilter = 'Vegetarian';
    if (pref.toLowerCase() === 'non_vegetarian') dietFilter = 'Non-vegetarian';
    else if (pref.toLowerCase() === 'eggetarian') dietFilter = 'Eggetarian';

    // Fetch meals matching preference
    const { data: meals } = await supabase
      .from('meals')
      .select('*')
      .or(`diet_type.eq.${dietFilter},diet_type.eq.Vegetarian`); // Veggies are fine for everyone

    if (!meals || meals.length === 0) return [];

    // Simple selection logic
    const breakfast = meals.find(m => m.meal_type === 'Breakfast') || meals[0];
    const lunch = meals.find(m => m.meal_type === 'Lunch') || meals[0];
    const snack = meals.find(m => m.meal_type === 'Snack') || meals[0];
    const dinner = meals.find(m => m.meal_type === 'Dinner') || meals[0];

    const plansToInsert = [
      { user_id: userId, date: today, meal_id: breakfast.id, meal_type: 'Breakfast', status: 'pending' },
      { user_id: userId, date: today, meal_id: lunch.id, meal_type: 'Lunch', status: 'pending' },
      { user_id: userId, date: today, meal_id: snack.id, meal_type: 'Snack', status: 'pending' },
      { user_id: userId, date: today, meal_id: dinner.id, meal_type: 'Dinner', status: 'pending' },
    ];

    await supabase.from('daily_meal_plans').insert(plansToInsert);

    // Fetch again to get full join data
    const { data: newPlan } = await supabase
      .from('daily_meal_plans')
      .select('id, status, meal_type, meals (*)')
      .eq('user_id', userId)
      .eq('date', today);

    return newPlan || [];
  } catch (error) {
    console.error('Error generating daily diet:', error);
    return [];
  }
}
