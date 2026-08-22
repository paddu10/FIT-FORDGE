import { supabase } from './supabase';

// --- Types ---
interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string;
  difficulty: string;
  default_sets: number;
  default_reps: number;
  duration_seconds: number;
  rest_duration_seconds: number;
}

interface Profile {
  id: string;
  training_days_pref: number[];
  equipment: string[];
  fitness_level: string;
  goal: string;
  training_duration: number; // minutes
}

// --- Progression Service ---
async function calculateNextTarget(userId: string, exerciseId: string, baseSets: number, baseReps: number | null, baseDuration: number | null) {
  // Fetch the most recent completed performance for this exercise
  const { data: pastPerformances } = await supabase
    .from('daily_workout_exercises')
    .select('sets, reps, rest_duration_seconds, completed_sets, daily_workouts!inner(status, scheduled_date)')
    .eq('exercise_id', exerciseId)
    .eq('daily_workouts.user_id', userId)
    .eq('daily_workouts.status', 'completed')
    .order('daily_workouts(scheduled_date)', { ascending: false })
    .limit(1);

  if (!pastPerformances || pastPerformances.length === 0) {
    // No past performance, return baseline
    return { sets: baseSets, reps: baseReps, duration_seconds: baseDuration };
  }

  const last = pastPerformances[0];
  
  // Progression Logic
  let targetSets = last.sets || baseSets;
  let targetReps = last.reps || baseReps;
  let targetDuration = baseDuration;

  // If they completed all sets last time
  if (last.completed_sets >= targetSets) {
    if (targetReps !== null) {
      targetReps += 1; // progressive overload by adding 1 rep
      if (targetReps > 15) {
        // If reps get too high, cap them and maybe they need a harder variation (handled by level filtering)
        targetReps = 15;
      }
    } else if (targetDuration !== null && targetDuration > 0) {
      targetDuration += 5; // progressive overload by adding 5 seconds
    }
  }

  return { sets: targetSets, reps: targetReps, duration_seconds: targetDuration };
}

// --- Main Engine ---
export async function generateFutureSchedule(userId: string, startDateStr: string, numDays: number = 7) {
  try {
    const { data: profileRow } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!profileRow) throw new Error('No profile');

    const profile: Profile = {
      id: profileRow.id,
      training_days_pref: profileRow.training_days_pref || [1, 3, 5],
      equipment: profileRow.equipment || [],
      fitness_level: (profileRow.fitness_level || 'beginner').toLowerCase(),
      goal: (profileRow.goal || 'general fitness').toLowerCase(),
      training_duration: profileRow.training_duration || 45,
    };

    const trainingDaysCount = profile.training_days_pref.length;

    // 1. Fetch all exercises
    const { data: dbExercises } = await supabase.from('exercises').select('*');
    if (!dbExercises || dbExercises.length === 0) {
      console.warn('[WorkoutEngine] No exercises in DB. Aborting generation.');
      return;
    }

    // 2. Filter by Equipment
    const equipmentList = profile.equipment.map(e => e.toLowerCase());
    const hasNoneOnly = equipmentList.length === 0 || (equipmentList.length === 1 && equipmentList.includes('none'));
    
    let availableExercises = dbExercises.filter(ex => {
      const exEq = (ex.equipment || 'none').toLowerCase();
      if (hasNoneOnly) return exEq === 'none' || exEq === 'bodyweight';
      if (exEq === 'none' || exEq === 'bodyweight') return true;
      return equipmentList.some(userEq => exEq.includes(userEq) || userEq.includes(exEq));
    });

    // 3. Filter by Fitness Level
    availableExercises = availableExercises.filter(ex => {
      const diff = (ex.difficulty || 'beginner').toLowerCase();
      if (profile.fitness_level === 'beginner') return diff === 'beginner';
      if (profile.fitness_level === 'intermediate') return diff === 'beginner' || diff === 'intermediate';
      return true; // advanced can do all
    });

    if (availableExercises.length === 0) {
      console.warn('[WorkoutEngine] Filtering removed all exercises. Falling back to all DB exercises.');
      availableExercises = dbExercises; 
    }

    // 4. Goal-Based Parameters
    let globalSets = 3;
    let globalReps = 10;
    let globalRest = 60;

    if (profile.goal.includes('strength')) {
      globalSets = 4;
      globalReps = 5;
      globalRest = 120;
    } else if (profile.goal.includes('muscle') || profile.goal.includes('gain')) {
      globalSets = 3;
      globalReps = 10;
      globalRest = 90;
    } else if (profile.goal.includes('fat') || profile.goal.includes('loss')) {
      globalSets = 3;
      globalReps = 15;
      globalRest = 45;
    }

    // 5. Weekly Splits
    let splits: string[] = [];
    if (trainingDaysCount <= 2) {
      splits = ['Full Body', 'Full Body'];
    } else if (trainingDaysCount === 3) {
      splits = ['Upper Body', 'Lower Body', 'Full Body'];
    } else if (trainingDaysCount === 4) {
      splits = ['Upper Body', 'Lower Body', 'Upper Body', 'Lower Body'];
    } else if (trainingDaysCount === 5) {
      splits = ['Push', 'Pull', 'Legs', 'Upper Body', 'Lower Body'];
    } else {
      splits = ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs'];
    }

    let splitIndex = 0;

    const dateParts = startDateStr.split('-');
    const startDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));

    for (let i = 0; i < numDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = [
        currentDate.getFullYear(),
        String(currentDate.getMonth() + 1).padStart(2, '0'),
        String(currentDate.getDate()).padStart(2, '0')
      ].join('-');
      const dayOfWeek = currentDate.getDay(); // 0 = Sun, 1 = Mon

      // Existing check
      const { data: existing } = await supabase.from('daily_workouts').select('id, status').eq('user_id', userId).eq('scheduled_date', dateStr).maybeSingle();
      if (existing) {
        if (existing.status === 'completed') {
          if (profile.training_days_pref.includes(dayOfWeek)) splitIndex++;
          continue;
        } else {
          await supabase.from('daily_workouts').delete().eq('id', existing.id);
        }
      }

      if (!profile.training_days_pref.includes(dayOfWeek)) {
        await supabase.from('daily_workouts').insert({ user_id: userId, scheduled_date: dateStr, status: 'pending', is_rest_day: true });
        continue;
      }

      const targetMuscleGroup = splits[splitIndex % splits.length];
      splitIndex++;

      // 6. Select Exercises Intelligently (Balance & Duration)
      const targetDurationSeconds = profile.training_duration * 60;
      let currentWorkoutDuration = 0; // Warmup (5m) + Cooldown (5m) = 600s
      let basePadding = 600;
      currentWorkoutDuration += basePadding;

      const selectedExercises: any[] = [];
      const usedExerciseNames = new Set<string>();

      // Helper to find a matching exercise
      const pickExercise = (patterns: string[]) => {
        const candidates = availableExercises.filter(ex => 
          !usedExerciseNames.has(ex.name) && 
          patterns.some(p => (ex.muscle_group || '').toLowerCase().includes(p))
        );
        if (candidates.length === 0) return null;
        const choice = candidates[Math.floor(Math.random() * candidates.length)];
        usedExerciseNames.add(choice.name);
        return choice;
      };

      // Define pattern priorities based on split
      let patternsToFill: string[][] = [];
      const tg = targetMuscleGroup.toLowerCase();
      
      if (tg.includes('full')) {
        patternsToFill = [['legs', 'quads'], ['chest', 'push'], ['back', 'pull'], ['glutes', 'hamstrings'], ['core']];
      } else if (tg.includes('upper') || tg === 'push' || tg === 'pull') {
        if (tg === 'push') patternsToFill = [['chest'], ['shoulders'], ['triceps'], ['chest', 'core']];
        else if (tg === 'pull') patternsToFill = [['back'], ['biceps'], ['back'], ['core']];
        else patternsToFill = [['chest'], ['back'], ['shoulders'], ['arms'], ['core']];
      } else if (tg.includes('lower') || tg === 'legs') {
        patternsToFill = [['legs', 'quads'], ['glutes', 'hamstrings'], ['calves'], ['core']];
      } else {
        patternsToFill = [['chest', 'push'], ['back', 'pull'], ['legs', 'quads', 'hamstrings'], ['core'], ['shoulders', 'arms']]; // Generic balanced
      }

      // Fill basic patterns
      for (const p of patternsToFill) {
        const ex = pickExercise(p);
        if (ex) {
          selectedExercises.push(ex);
          // Estimate duration: Sets * (Reps * 3s + Rest)
          const isTimed = ex.duration_seconds && ex.duration_seconds > 0;
          const timePerSet = isTimed ? ex.duration_seconds : (globalReps * 3);
          currentWorkoutDuration += (globalSets * (timePerSet + globalRest));
        }
      }

      // Fill until duration is reached (or up to max 10 exercises to prevent infinite loops)
      let attempt = 0;
      while (currentWorkoutDuration < targetDurationSeconds - 300 && selectedExercises.length < 10 && attempt < 10) {
        attempt++;
        const p = patternsToFill[attempt % patternsToFill.length];
        const ex = pickExercise(p);
        if (ex) {
          selectedExercises.push(ex);
          const isTimed = ex.duration_seconds && ex.duration_seconds > 0;
          const timePerSet = isTimed ? ex.duration_seconds : (globalReps * 3);
          currentWorkoutDuration += (globalSets * (timePerSet + globalRest));
        }
      }

      if (selectedExercises.length === 0) {
        // Ultimate fallback if absolutely no exercises matched the patterns
        selectedExercises.push(...availableExercises.slice(0, 4));
      }

      // 7. Get or Create Workout Template
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
          const generatedName = `${targetMuscleGroup} ${profile.goal.includes('strength') ? 'Strength' : 'Session'}`;
          const { data: newWorkoutTemplate, error: tplErr } = await supabase
            .from('workouts')
            .insert({
              name: generatedName,
              description: `Personalized ${targetMuscleGroup} workout`,
              goal: profile.goal,
              fitness_level: profile.fitness_level,
              duration_minutes: Math.round(currentWorkoutDuration / 60)
            })
            .select('id')
            .single();

          if (!tplErr && newWorkoutTemplate) workoutId = newWorkoutTemplate.id;
        }
      } catch (err) {
        console.error('Error creating workout template:', err);
      }

      // 8. Create Daily Workout
      const { data: newWorkout, error: nwErr } = await supabase.from('daily_workouts').insert({
        user_id: userId,
        workout_id: workoutId,
        scheduled_date: dateStr,
        status: 'pending',
        is_rest_day: false,
        actual_duration_minutes: Math.round(currentWorkoutDuration / 60)
      }).select().single();

      if (nwErr || !newWorkout) continue;

      // 9. Process Exercises and apply Progression
      const exerciseRecords = [];
      for (let idx = 0; idx < selectedExercises.length; idx++) {
        const ex = selectedExercises[idx];
        const isTimed = ex.duration_seconds && ex.duration_seconds > 0;
        
        // Progression Service
        const target = await calculateNextTarget(
          userId, 
          ex.id, 
          ex.default_sets || globalSets, 
          isTimed ? null : (ex.default_reps || globalReps),
          isTimed ? ex.duration_seconds : null
        );

        exerciseRecords.push({
          daily_workout_id: newWorkout.id,
          exercise_id: ex.id,
          sort_order: idx,
          sets: target.sets,
          reps: target.reps,
          rest_duration_seconds: ex.rest_duration_seconds || globalRest,
          completed_sets: 0
        });
      }

      if (exerciseRecords.length > 0) {
        const { error: dweErr } = await supabase.from('daily_workout_exercises').insert(exerciseRecords);
        if (dweErr) console.error('Failed to insert exercises', dweErr);
      }
    }
  } catch (error) {
    console.error('Error generating future schedule:', error);
  }
}

export async function rescheduleMissedWorkout(userId: string, missedWorkoutId: string, searchFromDateStr: string) {
  try {
    const { data: missedWorkout } = await supabase
      .from('daily_workouts')
      .select('*')
      .eq('id', missedWorkoutId)
      .eq('user_id', userId)
      .single();

    if (!missedWorkout || missedWorkout.status !== 'pending' || missedWorkout.is_rest_day) return;

    // We search from today onwards.
    const dateParts = searchFromDateStr.split('-');
    const searchDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));

    let targetDateStr: string | null = null;

    // Search for the next available day up to 21 days ahead
    for (let i = 0; i < 21; i++) {
      const candidateDate = new Date(searchDate);
      candidateDate.setDate(searchDate.getDate() + i);
      const candidateStr = [
        candidateDate.getFullYear(),
        String(candidateDate.getMonth() + 1).padStart(2, '0'),
        String(candidateDate.getDate()).padStart(2, '0')
      ].join('-');

      // We need to check if there is a REAL workout on this candidate date
      const { data: existingOnCandidate } = await supabase
        .from('daily_workouts')
        .select('*')
        .eq('user_id', userId)
        .eq('scheduled_date', candidateStr)
        .neq('status', 'missed'); // Ignore missed placeholders when checking availability

      const hasRealWorkout = existingOnCandidate && existingOnCandidate.some(w => !w.is_rest_day);

      if (!hasRealWorkout) {
        // Candidate is available (it's either empty, or only has a rest day / missed placeholder)
        targetDateStr = candidateStr;

        // If there is a rest day placeholder, we can delete it
        const restDay = existingOnCandidate?.find(w => w.is_rest_day && w.status === 'pending');
        if (restDay) {
          await supabase.from('daily_workouts').delete().eq('id', restDay.id);
        }
        break;
      }
    }

    if (!targetDateStr) {
      console.warn('Could not find an available day to reschedule within the next 21 days.');
      return;
    }

    // Insert a "missed" placeholder on the original date so history shows it was missed
    await supabase.from('daily_workouts').insert({
      user_id: userId,
      workout_id: missedWorkout.workout_id,
      scheduled_date: missedWorkout.scheduled_date,
      status: 'missed',
      is_rest_day: false,
      original_scheduled_date: missedWorkout.original_scheduled_date || missedWorkout.scheduled_date
    });

    // Move the actual exact workout to the new target date
    await supabase.from('daily_workouts').update({ 
      scheduled_date: targetDateStr, 
      status: 'rescheduled',
      original_scheduled_date: missedWorkout.original_scheduled_date || missedWorkout.scheduled_date,
      is_rescheduled: true
    }).eq('id', missedWorkout.id);

  } catch (error) {
    console.error('Error rescheduling:', error);
  }
}
