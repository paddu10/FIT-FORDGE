import { supabase } from './supabase';

export type DailyWorkoutWithDetails = {
  id: string;
  scheduled_date: string;
  status: string;
  is_rest_day: boolean;
  original_scheduled_date: string | null;
  is_rescheduled: boolean;
  actual_duration_minutes: number | null;
  workouts: {
    id: string;
    name: string;
    description: string | null;
    duration_minutes: number | null;
    fitness_level: string | null;
  } | null;
  daily_workout_exercises: {
    id: string;
    sort_order: number;
    sets: number;
    reps: number | null;
    rest_duration_seconds: number | null;
    completed_sets: number;
    exercises: {
      id: string;
      name: string;
      muscle_group: string | null;
      equipment: string | null;
      difficulty: string | null;
      instructions: string | null;
      duration_seconds: number | null;
    } | null;
  }[];
};

/**
 * Gets a specific date's workout for a user.
 */
export async function getTodayWorkout(userId: string, localDateStr: string): Promise<DailyWorkoutWithDetails | null> {
  const { data, error } = await supabase
    .from('daily_workouts')
    .select(`
      id,
      scheduled_date,
      status,
      is_rest_day,
      original_scheduled_date,
      is_rescheduled,
      actual_duration_minutes,
      workouts (
        id,
        name,
        description,
        duration_minutes,
        fitness_level
      ),
      daily_workout_exercises (
        id,
        sort_order,
        sets,
        reps,
        rest_duration_seconds,
        completed_sets,
        exercises (
          id,
          name,
          muscle_group,
          equipment,
          difficulty,
          instructions,
          duration_seconds
        )
      )
    `)
    .eq('user_id', userId)
    .eq('scheduled_date', localDateStr)
    .maybeSingle();

  if (error) {
    console.error('Error fetching today workout:', error);
    return null;
  }

  // Ensure exercises are sorted by sort_order
  if (data && data.daily_workout_exercises) {
    data.daily_workout_exercises.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }

  return data as unknown as DailyWorkoutWithDetails | null;
}

/**
 * Gets a range of workouts for the week.
 * Assumes startDateStr is the Sunday/Monday of the week, fetching 7 days.
 */
export async function getWeekSchedule(userId: string, startDateStr: string): Promise<DailyWorkoutWithDetails[]> {
  const startDate = new Date(startDateStr);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  const endDateStr = endDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_workouts')
    .select(`
      id,
      scheduled_date,
      status,
      is_rest_day,
      actual_duration_minutes,
      workouts (
        id,
        name,
        description,
        duration_minutes,
        fitness_level
      ),
      daily_workout_exercises (
        id,
        sort_order,
        sets,
        reps,
        rest_duration_seconds,
        completed_sets,
        exercises (
          id,
          name,
          muscle_group,
          equipment,
          difficulty,
          instructions,
          duration_seconds
        )
      )
    `)
    .eq('user_id', userId)
    .gte('scheduled_date', startDateStr)
    .lte('scheduled_date', endDateStr)
    .order('scheduled_date', { ascending: true });

  if (error) {
    console.error('Error fetching week schedule:', error);
    return [];
  }

  // Ensure exercises are sorted by sort_order
  data?.forEach(d => {
    if (d.daily_workout_exercises) {
      d.daily_workout_exercises.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    }
  });

  return (data || []) as unknown as DailyWorkoutWithDetails[];
}

/**
 * Gets missed workouts for a user before a certain date.
 */
export async function getMissedWorkouts(userId: string, beforeDateStr: string): Promise<DailyWorkoutWithDetails[]> {
  const { data, error } = await supabase
    .from('daily_workouts')
    .select(`
      id,
      scheduled_date,
      status,
      is_rest_day,
      actual_duration_minutes,
      workouts (
        id,
        name,
        description,
        duration_minutes,
        fitness_level
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'pending')
    .eq('is_rest_day', false)
    .lt('scheduled_date', beforeDateStr)
    .order('scheduled_date', { ascending: false });

  if (error) {
    console.error('Error fetching missed workouts:', error);
    return [];
  }
  return (data || []) as unknown as DailyWorkoutWithDetails[];
}
