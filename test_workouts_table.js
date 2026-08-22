const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://orntrkrsukfvgufxcesh.supabase.co';
const supabaseAnonKey = 'sb_publishable_VWItyS-vay_ZVWI6nPlVmQ__z3E7zUn';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase.from('workouts').select('*');
  console.log('Workouts query count:', data?.length, error);
}

run();
