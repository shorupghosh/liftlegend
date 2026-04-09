const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jcgaloqryiuvnnsfcflo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZ2Fsb3FyeWl1dm5uc2ZjZmxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTE2NDcsImV4cCI6MjA4ODYyNzY0N30.YMgjfwWIKqK_0Sibz5w4iTPakzItIIoOzQqUR6jdPZk'
);

async function main() {
  // Step 1: Sign in as the super admin user
  console.log('Signing in as shorupg81@gmail.com...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'shorupg81@gmail.com',
    password: process.argv[2] || '',
  });

  if (authError) {
    console.error('Auth error:', authError.message);
    console.log('\nUsage: node scripts/fix-superadmin.cjs YOUR_PASSWORD');
    process.exit(1);
  }

  const userId = authData.user.id;
  console.log('Signed in! User ID:', userId);

  // Step 2: Check existing roles for this user
  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId);

  console.log('Existing roles:', roles);
  if (rolesError) console.error('Roles error:', rolesError.message);

  // Step 3: If no SUPER_ADMIN role, insert one
  const hasSuperAdmin = roles && roles.some(r => r.role === 'SUPER_ADMIN');
  if (hasSuperAdmin) {
    console.log('SUPER_ADMIN role already exists! No action needed.');
    process.exit(0);
  }

  console.log('No SUPER_ADMIN role found. Inserting...');

  // Get the Fit & Flex gym ID (or any gym)
  const { data: gyms } = await supabase.from('gyms').select('id, name').limit(1);
  const gymId = gyms && gyms.length > 0 ? gyms[0].id : null;
  console.log('Using gym:', gyms && gyms[0] ? gyms[0].name : 'none', '(' + gymId + ')');

  const { data: insertData, error: insertError } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      gym_id: gymId,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      display_name: 'shorupg81@gmail.com',
      invited_email: 'shorupg81@gmail.com',
    })
    .select();

  if (insertError) {
    console.error('Insert error:', insertError.message);
    console.log('\nIf RLS is blocking this, run this SQL in Supabase Dashboard SQL Editor:');
    console.log('---');
    console.log("INSERT INTO user_roles (user_id, gym_id, role, status, display_name, invited_email)");
    console.log("VALUES ('" + userId + "', '" + gymId + "', 'SUPER_ADMIN', 'ACTIVE', 'shorupg81@gmail.com', 'shorupg81@gmail.com');");
    console.log('---');
  } else {
    console.log('SUCCESS! SUPER_ADMIN role created:', insertData);
  }

  await supabase.auth.signOut();
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
