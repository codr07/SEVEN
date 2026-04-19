import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  console.log("Fetching all...");
  
  const tables = ['faculty', 'founders', 'academics', 'courses', 'services'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    console.log(`Table ${table}: error?`, error?.message || null, `data?`, data?.length);
  }
}
check();
