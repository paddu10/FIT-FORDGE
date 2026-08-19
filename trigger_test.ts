import { generateFutureSchedule } from './lib/WorkoutEngine';
import { supabase } from './lib/supabase';

async function run() {
  const { data: profiles } = await supabase.from('profiles').select('id').limit(1);
  if (!profiles || !profiles.length) {
    console.log('No user profile found');
    return;
  }
  
  const userId = profiles[0].id;
  const todayStr = new Date().toLocaleDateString('en-CA');
  console.log('Generating schedule for user', userId, 'starting from', todayStr);
  
  await generateFutureSchedule(userId, todayStr, 14);
  console.log('Done.');
  
  const { data } = await supabase.from('daily_workouts').select('*').eq('user_id', userId);
  console.log('Generated daily workouts:', data?.length);
}

run();
