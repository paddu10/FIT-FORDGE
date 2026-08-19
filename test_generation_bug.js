const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://orntrkrsukfvgufxcesh.supabase.co';
const supabaseAnonKey = 'sb_publishable_VWItyS-vay_ZVWI6nPlVmQ__z3E7zUn';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function generateFutureScheduleTest(userId) {
  try {
    const { data: dbExercises } = await supabase.from('exercises').select('*');
    if (!dbExercises || dbExercises.length === 0) {
      console.log('No exercises in DB. Aborting generation.');
      return;
    }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!profile) {
      console.log('Profile not found');
      return;
    }

    const prefDays = profile.training_days_pref || [1, 3, 5];
    console.log('prefDays:', prefDays);

    const trainingDaysCount = prefDays.length;
    if (trainingDaysCount === 0) {
      console.log('No training days selected. Aborting generation.');
      return;
    }

    console.log('All checks passed, entering generation loop...');
    // test the first day insertion
    const targetMuscleGroup = 'Upper Body';
    let workoutId = null;
    
    const { data: existingWorkoutTemplate } = await supabase
        .from('workouts')
        .select('id')
        .eq('name', targetMuscleGroup)
        .limit(1)
        .maybeSingle();

    console.log('existingWorkoutTemplate:', existingWorkoutTemplate);

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
        console.log('newWorkoutTemplate error:', tplErr);
        if (!tplErr && newWorkoutTemplate) {
            workoutId = newWorkoutTemplate.id;
        }
    }

    console.log('workoutId is:', workoutId);

    const { data: newWorkout, error: nwErr } = await supabase.from('daily_workouts').insert({
        user_id: userId,
        workout_id: workoutId,
        scheduled_date: new Date().toLocaleDateString('en-CA'),
        status: 'pending',
        is_rest_day: false
    }).select().single();

    console.log('daily_workouts insert error:', nwErr);

  } catch (err) {
    console.error('Fatal error:', err);
  }
}

async function run() {
  const { data: profiles } = await supabase.from('profiles').select('id').limit(1);
  if (!profiles || !profiles.length) return;
  await generateFutureScheduleTest(profiles[0].id);
}

run();
