import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const envPath = '.env.local';
let SUPABASE_URL = '';
let SUPABASE_KEY = '';

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n');
  lines.forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) SUPABASE_URL = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) SUPABASE_KEY = line.split('=')[1].trim();
  });
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'fordy_boss@icloud.com',
    password: 'password123'
  });
  
  if (authError) {
    console.log("Auth Error:", authError);
    return;
  }
  
  const gymId = 'caaba35b-5eff-4fbe-9f33-cce92c844cf6';
  
  const [membersRes, attendanceRes, existingRes] = await Promise.all([
      supabase
        .from('members')
        .select('id, full_name, expiry_date, status')
        .eq('gym_id', gymId)
        .eq('status', 'ACTIVE'),
      supabase
        .from('attendance')
        .select('member_id, check_in_time')
        .eq('gym_id', gymId)
        .gte('check_in_time', new Date(Date.now() - 35*86400*1000).toISOString()),
      supabase
        .from('notifications')
        .select('dedupe_key')
        .eq('gym_id', gymId),
  ]);
  
  console.log("Queries done.");
  console.log("Members error:", membersRes.error);
  console.log("Attendance error:", attendanceRes.error);
  console.log("Existing error:", existingRes.error);
}

run();
