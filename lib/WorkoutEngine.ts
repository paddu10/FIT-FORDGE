import { supabase } from './supabase';

export async function generateDailyWorkout(userId: string) {
  try {
    // 1. Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) throw new Error('Could not fetch profile');

    const today = new Date().toISOString().split('T')[0];

    // 2. Check if a workout already exists for today
    const { data: existingWorkout } = await supabase
      .from('daily_workouts')
      .select('id, status')
      .eq('user_id', userId)
      .eq('scheduled_date', today)
      .single();

    if (existingWorkout) {
      return existingWorkout;
    }

    // 3. Determine workout split based on day of week and training days
    const dayOfWeek = new Date().getDay(); // 0 = Sunday, 1 = Monday...
    let targetMuscleGroup = 'Full Body';
    let workoutName = 'Full Body Conditioning';

    // Simple split logic
    if (profile.training_days >= 4) {
      if (dayOfWeek === 1 || dayOfWeek === 4) { targetMuscleGroup = 'Upper Body'; workoutName = 'Upper Body Power'; }
      else if (dayOfWeek === 2 || dayOfWeek === 5) { targetMuscleGroup = 'Legs'; workoutName = 'Lower Body Strength'; }
      else if (dayOfWeek === 3) { targetMuscleGroup = 'Core'; workoutName = 'Core & Stability'; }
      else { targetMuscleGroup = 'Rest'; workoutName = 'Rest Day'; }
    } else {
      if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) { targetMuscleGroup = 'Full Body'; workoutName = 'Full Body Workout'; }
      else { targetMuscleGroup = 'Rest'; workoutName = 'Rest Day'; }
    }

    if (targetMuscleGroup === 'Rest') {
      return null;
    }

    // 4. Fetch suitable exercises from Supabase
    let query = supabase.from('exercises').select('*');
    
    // Simple mapping: if they have no equipment, filter by 'None'. If they have dumbbells, include 'Dumbbells'
    if (profile.equipment && profile.equipment.length > 0) {
      if (profile.equipment.includes('none') && profile.equipment.length === 1) {
        query = query.eq('equipment', 'None');
      }
    } else {
      query = query.eq('equipment', 'None'); // default
    }

    // Filter by difficulty if possible, or just fetch all and filter in JS
    const { data: rawExercises, error: exercisesError } = await query;

    let exercises: typeof rawExercises = rawExercises;

    if (exercisesError || !exercises || exercises.length === 0) {
      console.warn("No exercises found matching criteria. Fallback to any.");
      // Fallback: just get any exercises
      const { data: fallbackExercises } = await supabase.from('exercises').select('*').limit(5);
      if (!fallbackExercises) throw new Error('No exercises in DB');
      exercises = fallbackExercises;
    }

    // Pick 4-6 exercises based on the target muscle group (simplified)
    let selectedExercises = exercises ?? [];
    if (targetMuscleGroup === 'Upper Body') {
      selectedExercises = (exercises ?? []).filter(e => ['Chest', 'Back', 'Shoulders', 'Arms'].includes(e.muscle_group)).slice(0, 5);
    } else if (targetMuscleGroup === 'Legs') {
      selectedExercises = (exercises ?? []).filter(e => e.muscle_group === 'Legs' || e.muscle_group === 'Glutes').slice(0, 5);
    } else if (targetMuscleGroup === 'Core') {
      selectedExercises = (exercises ?? []).filter(e => e.muscle_group === 'Core').slice(0, 5);
    } else {
      selectedExercises = (exercises ?? []).slice(0, 5);
    }

    if (selectedExercises.length === 0) {
      selectedExercises = (exercises ?? []).slice(0, 5); // ultimate fallback
    }


    // 5. Create daily_workout record
    const { data: dailyWorkout, error: dwError } = await supabase
      .from('daily_workouts')
      .insert({
        user_id: userId,
        scheduled_date: today,
        status: 'pending'
      })
      .select()
      .single();

    if (dwError || !dailyWorkout) throw new Error('Failed to create daily workout');

    // 6. Create daily_workout_exercises records
    const exerciseRecords = selectedExercises.map((ex, index) => ({
      daily_workout_id: dailyWorkout.id,
      exercise_id: ex.id,
      sort_order: index,
      sets: ex.default_sets || 3,
      reps: ex.default_reps || 10,
      rest_duration_seconds: ex.rest_duration_seconds || 60,
      completed_sets: 0
    }));

    const { error: exercisesInsertError } = await supabase
      .from('daily_workout_exercises')
      .insert(exerciseRecords);

    if (exercisesInsertError) throw new Error('Failed to insert exercises');

    return dailyWorkout;

  } catch (error) {
    console.error('Error generating daily workout:', error);
    return null;
  }
}
