import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://grfvuhmptzqaxwlwbtsf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyZnZ1aG1wdHpxYXh3bHdidHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2ODg4NTIsImV4cCI6MjA5MjI2NDg1Mn0.cf1WA4igUfxCr6PfFdPyenOpCVY8KL7VeDR15mTSKUQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const filterVisible = (items = []) => {
  if (!items) return [];
  return items.filter(item => {
    let details = {};
    if (typeof item.extra_details === 'string') {
      try { details = JSON.parse(item.extra_details); } catch {}
    } else if (item.extra_details) {
      details = item.extra_details;
    }
    return details?.is_visible !== false;
  });
};

async function testFilter() {
  const { data } = await supabase.from('courses').select('id, name, extra_details');
  console.log("Total courses:", data.length);
  const visible = filterVisible(data);
  console.log("Visible courses:", visible.length);
  if (data.length > 0) {
    console.log("Sample course extra_details:", data[0].extra_details);
    console.log("Sample course visible?", filterVisible([data[0]]).length > 0);
  }
}

testFilter();
