const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://orntrkrsukfvgufxcesh.supabase.co';
const supabaseAnonKey = 'sb_publishable_VWItyS-vay_ZVWI6nPlVmQ__z3E7zUn';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data: profiles } = await supabase.from('profiles').select('id').limit(1);
  if (!profiles || !profiles.length) return;
  
  const userId = profiles[0].id;
  const { data, error } = await supabase
    .from('daily_workouts')
    .select('id, scheduled_date, is_rest_day, workout_id')
    .eq('user_id', userId)
    .order('scheduled_date', { ascending: true });
    
  console.log('Daily workouts count:', data?.length);
  if (data) {
      data.forEach(d => console.log(d.scheduled_date, 'is_rest_day:', d.is_rest_day, 'workout_id:', d.workout_id));
  }
}

run();
