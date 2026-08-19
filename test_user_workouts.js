const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://orntrkrsukfvgufxcesh.supabase.co';
const supabaseAnonKey = 'sb_publishable_VWItyS-vay_ZVWI6nPlVmQ__z3E7zUn';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*').limit(1);
  if (!profiles || !profiles.length) {
    console.log('No users found', pErr);
    return;
  }
  
  const profile = profiles[0];
  console.log('Profile:', profile);

  const { data, error } = await supabase
    .from('daily_workouts')
    .select('*')
    .eq('user_id', profile.id)
    .order('scheduled_date', { ascending: true })
    .limit(10);
    
  console.log('Daily workouts for user:', data?.length, error);
  if (data?.length > 0) {
      console.log(data.map(d => ({date: d.scheduled_date, rest: d.is_rest_day})));
  }
}

run();
