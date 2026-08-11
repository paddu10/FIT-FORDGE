import { supabase } from './supabase';

export async function initializeDailyTasks(userId: string) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Check if tasks exist for today
    const { data: existingTasks, error: checkError } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today);

    if (checkError) throw checkError;

    if (existingTasks && existingTasks.length > 0) {
      return existingTasks;
    }

    // Default tasks
    const tasksToInsert = [
      { user_id: userId, date: today, title: "Complete today's workout", type: 'workout' },
      { user_id: userId, date: today, title: "Drink 2.5L of water", type: 'water' },
      { user_id: userId, date: today, title: "Follow diet plan", type: 'meal' },
    ];

    const { data: insertedTasks, error: insertError } = await supabase
      .from('daily_tasks')
      .insert(tasksToInsert)
      .select();

    if (insertError) throw insertError;

    return insertedTasks;
  } catch (error) {
    console.error('Error initializing daily tasks:', error);
    return [];
  }
}

export async function checkAndUpdateStreak(userId: string) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get today's tasks
    const { data: tasks } = await supabase
      .from('daily_tasks')
      .select('completed')
      .eq('user_id', userId)
      .eq('date', today);

    if (!tasks || tasks.length === 0) return;

    const allCompleted = tasks.every(t => t.completed);

    if (allCompleted) {
      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_streak, longest_streak, last_completed_date')
        .eq('id', userId)
        .single();

      if (profile) {
        if (profile.last_completed_date !== today) {
          // Increment streak
          const newStreak = (profile.current_streak || 0) + 1;
          const newLongest = Math.max(newStreak, profile.longest_streak || 0);

          await supabase
            .from('profiles')
            .update({
              current_streak: newStreak,
              longest_streak: newLongest,
              last_completed_date: today
            })
            .eq('id', userId);
        }
      }
    }
  } catch (error) {
    console.error('Error updating streak:', error);
  }
}
