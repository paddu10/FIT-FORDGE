import { supabase } from './supabase';

export async function generateFutureSchedule(userId: string, startDateStr: string, numDays: number = 7) {
  try {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!profile) throw new Error('No profile');

    const prefDays: number[] = profile.training_days_pref || [1, 3, 5];
    const trainingDaysCount = prefDays.length;

    // Fetch all exercises
    const { data: dbExercises } = await supabase.from('exercises').select('*');
    
    let allExercises = dbExercises;
    
    // Fallback if DB is empty or missing seed data
    if (!allExercises || allExercises.length === 0) {
      console.warn('[WorkoutEngine] No exercises found in DB. Using fallback data.');
      allExercises = [
        { id: 'fb-1', name: 'Push-up', muscle_group: 'Chest', equipment: 'None', default_sets: 3, default_reps: 15 },
        { id: 'fb-2', name: 'Pull-up', muscle_group: 'Back', equipment: 'Pull-up bar', default_sets: 3, default_reps: 8 },
        { id: 'fb-3', name: 'Squat', muscle_group: 'Legs', equipment: 'None', default_sets: 3, default_reps: 20 },
        { id: 'fb-4', name: 'Plank', muscle_group: 'Core', equipment: 'None', default_sets: 3, default_reps: 60 },
        { id: 'fb-5', name: 'Pike Push-up', muscle_group: 'Shoulders', equipment: 'None', default_sets: 3, default_reps: 10 }
      ];
    }

    let availableExercises = allExercises;
    if (!profile.equipment || profile.equipment.length === 0 || profile.equipment.includes('none')) {
      availableExercises = allExercises.filter(e => e.equipment === 'None' || !e.equipment);
    }

    // Determine basic split rotation based on frequency
    let splits: string[] = [];
    if (trainingDaysCount >= 5) {
      splits = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms'];
    } else if (trainingDaysCount === 4) {
      splits = ['Upper Body', 'Lower Body', 'Upper Body', 'Lower Body'];
    } else {
      splits = ['Full Body', 'Full Body', 'Full Body'];
    }

    let splitIndex = 0;

    const dateParts = startDateStr.split('-');
    const startDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));

    console.log('[WorkoutEngine] Generating schedule...');
    console.log('[WorkoutEngine] Selected Workout Days:', prefDays);

    for (let i = 0; i < numDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = [
        currentDate.getFullYear(),
        String(currentDate.getMonth() + 1).padStart(2, '0'),
        String(currentDate.getDate()).padStart(2, '0')
      ].join('-');
      const dayOfWeek = currentDate.getDay(); // 0 = Sun, 1 = Mon

      console.log(`[WorkoutEngine] Checking ${dateStr} (Local day ${dayOfWeek})`);

      // Check if workout exists
      const { data: existing } = await supabase.from('daily_workouts')
        .select('id, status')
        .eq('user_id', userId)
        .eq('scheduled_date', dateStr)
        .maybeSingle();

      if (existing) {
        // If it exists, and is completed, we just skip over it
        if (existing.status === 'completed') {
          // If it was a training day, increment splitIndex to keep rotation intact
          if (prefDays.includes(dayOfWeek)) {
            splitIndex++;
          }
          continue;
        } else {
          // If it's pending, we should probably delete it and regenerate to match new preferences, 
          // or just leave it. Let's delete pending so we can cleanly overwrite.
          await supabase.from('daily_workouts').delete().eq('id', existing.id);
        }
      }

      // Is it a rest day based on user preferences?
      if (!prefDays.includes(dayOfWeek)) {
        console.log(`[WorkoutEngine] -> Marking ${dateStr} as Rest Day`);
        await supabase.from('daily_workouts').insert({
          user_id: userId,
          scheduled_date: dateStr,
          status: 'pending',
          is_rest_day: true
        });
        continue;
      }

      console.log(`[WorkoutEngine] -> Scheduling Workout on ${dateStr}`);
      // It is a training day
      const targetMuscleGroup = splits[splitIndex % splits.length];
      splitIndex++;

      // Select exercises
      let selectedExercises: any[] = [];
      const fillExercises = availableExercises.filter(e => 
        (targetMuscleGroup === 'Full Body' || e.muscle_group === targetMuscleGroup || targetMuscleGroup === 'Upper Body' && ['Chest', 'Back', 'Shoulders', 'Arms'].includes(e.muscle_group) || targetMuscleGroup === 'Lower Body' && ['Legs', 'Glutes'].includes(e.muscle_group))
      );
      
      // Basic selection for demo
      selectedExercises = fillExercises.slice(0, 5);
      
      // If no matching exercises found, fallback
      if (selectedExercises.length === 0) {
        selectedExercises = availableExercises.slice(0, 5);
      }

      // 1. Get or Create the workout template for this muscle group
      let workoutId: string | null = null;
      try {
        const { data: existingWorkoutTemplate } = await supabase
          .from('workouts')
          .select('id')
          .eq('name', targetMuscleGroup)
          .limit(1)
          .maybeSingle();

        if (existingWorkoutTemplate) {
          workoutId = existingWorkoutTemplate.id;
        } else {
          const { data: newWorkoutTemplate, error: tplErr } = await supabase
            .from('workouts')
            .insert({
              name: targetMuscleGroup,
              description: `Generated ${targetMuscleGroup} workout`,
              goal: profile.goal || 'general',
              fitness_level: profile.fitness_level || 'beginner',
              duration_minutes: 45
            })
            .select('id')
            .single();

          if (!tplErr && newWorkoutTemplate) {
            workoutId = newWorkoutTemplate.id;
          }
        }
      } catch (err) {
        console.error('Error creating workout template:', err);
      }

      // Create workout
      const { data: newWorkout, error: nwErr } = await supabase.from('daily_workouts').insert({
        user_id: userId,
        workout_id: workoutId,
        scheduled_date: dateStr,
        status: 'pending',
        is_rest_day: false
      }).select().single();

      if (nwErr || !newWorkout) {
        console.error('Failed to create daily_workout', nwErr);
        continue;
      }

      // If we are using fallback data with non-uuid IDs, we can't insert into daily_workout_exercises
      // because exercise_id is a UUID referencing public.exercises.
      // So we only insert if the ID is a valid UUID (meaning it came from the DB).
      const validExercises = selectedExercises.filter(ex => ex.id && ex.id.length > 10);
      
      if (validExercises.length > 0) {
        const exerciseRecords = validExercises.map((ex, idx) => ({
          daily_workout_id: newWorkout.id,
          exercise_id: ex.id,
          sort_order: idx,
          sets: ex.default_sets || 3,
          reps: ex.default_reps || 10,
          rest_duration_seconds: ex.rest_duration_seconds || 60,
          completed_sets: 0
        }));

        const { error: dweErr } = await supabase.from('daily_workout_exercises').insert(exerciseRecords);
        if (dweErr) console.error('Failed to insert exercises', dweErr);
      }
    }
  } catch (error) {
    console.error('Error generating future schedule:', error);
  }
}

/**
 * Reschedules a specifically missed workout to the next available valid rest day,
 * preserving all other future scheduled workouts.
 */
export async function rescheduleMissedWorkout(userId: string, missedWorkoutId: string, searchFromDateStr: string) {
  try {
    console.log(`[WorkoutEngine] Rescheduling missed workout ${missedWorkoutId} from ${searchFromDateStr}`);

    // Fetch the missed workout
    const { data: missedWorkout } = await supabase.from('daily_workouts')
      .select('*')
      .eq('id', missedWorkoutId)
      .eq('user_id', userId)
      .single();

    if (!missedWorkout || missedWorkout.status !== 'pending' || missedWorkout.is_rest_day) {
      console.log('[WorkoutEngine] Workout is not a valid missed workout.');
      return;
    }

    const dateParts = searchFromDateStr.split('-');
    const searchDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));

    // Scan forward up to 14 days to find the next valid rest day
    for (let i = 0; i < 14; i++) {
      const candidateDate = new Date(searchDate);
      candidateDate.setDate(searchDate.getDate() + i);
      const candidateStr = [
        candidateDate.getFullYear(),
        String(candidateDate.getMonth() + 1).padStart(2, '0'),
        String(candidateDate.getDate()).padStart(2, '0')
      ].join('-');

      // Check what is currently scheduled on candidate date
      const { data: existingOnCandidate } = await supabase.from('daily_workouts')
        .select('*')
        .eq('user_id', userId)
        .eq('scheduled_date', candidateStr)
        .maybeSingle();

      // We only convert a rest day into this workout.
      // If there's no existing record, or if it's explicitly a pending rest day:
      if (!existingOnCandidate || (existingOnCandidate.is_rest_day && existingOnCandidate.status === 'pending')) {
        console.log(`[WorkoutEngine] Found valid slot on ${candidateStr}. Moving missed workout.`);
        
        // If there was a rest day placeholder, we can delete it or overwrite it
        if (existingOnCandidate) {
          await supabase.from('daily_workouts').delete().eq('id', existingOnCandidate.id);
        }

        // Update the missed workout's date
        await supabase.from('daily_workouts')
          .update({
            scheduled_date: candidateStr,
            status: 'pending' // ensure it remains pending
          })
          .eq('id', missedWorkoutId);
          
        console.log(`[WorkoutEngine] Successfully rescheduled to ${candidateStr}.`);
        return;
      }
    }
    
    console.log('[WorkoutEngine] Could not find an available slot within the next 14 days.');
  } catch (err) {
    console.error('[WorkoutEngine] Error rescheduling workout:', err);
  }
}
