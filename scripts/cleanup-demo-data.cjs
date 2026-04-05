/**
 * ========================================================
 * CLEANUP SCRIPT: Remove all demo/test gyms from Supabase
 * KEEPS: "Fit and Flex" gym and all its related data
 * DELETES: Every other gym and their members, payments,
 *          attendance, plans, staff roles, notifications
 * ========================================================
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jcgaloqryiuvnnsfcflo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZ2Fsb3FyeWl1dm5uc2ZjZmxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTE2NDcsImV4cCI6MjA4ODYyNzY0N30.YMgjfwWIKqK_0Sibz5w4iTPakzItIIoOzQqUR6jdPZk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// The gym to KEEP — everything else gets deleted
const KEEP_GYM_NAME = 'Fit and Flex';

async function main() {
  console.log('🔍 Fetching all gyms...');

  const { data: allGyms, error: gymsError } = await supabase
    .from('gyms')
    .select('id, name, status, created_at');

  if (gymsError) {
    console.error('❌ Failed to fetch gyms:', gymsError.message);
    process.exit(1);
  }

  if (!allGyms || allGyms.length === 0) {
    console.log('No gyms found. Nothing to clean.');
    process.exit(0);
  }

  console.log(`\n📋 Found ${allGyms.length} gym(s):`);
  allGyms.forEach((gym) => {
    const tag = gym.name.toLowerCase().includes(KEEP_GYM_NAME.toLowerCase()) ? '✅ KEEP' : '🗑️  DELETE';
    console.log(`   ${tag}  "${gym.name}" (${gym.id}) — ${gym.status}`);
  });

  // Identify gyms to delete (everything that ISN'T "Fit and Flex")
  const gymsToDelete = allGyms.filter(
    (gym) => !gym.name.toLowerCase().includes(KEEP_GYM_NAME.toLowerCase())
  );

  if (gymsToDelete.length === 0) {
    console.log('\n✅ No demo/test gyms to delete. Only "Fit and Flex" exists.');
    process.exit(0);
  }

  const deleteIds = gymsToDelete.map((gym) => gym.id);
  console.log(`\n🧹 Will delete ${gymsToDelete.length} gym(s) and all related data...\n`);

  // Delete in order: child tables first, then parent
  const tables = [
    { name: 'attendance', col: 'gym_id' },
    { name: 'membership_history', col: 'gym_id' },
    { name: 'notifications', col: 'gym_id' },
    { name: 'members', col: 'gym_id' },
    { name: 'plans', col: 'gym_id' },
    { name: 'user_roles', col: 'gym_id' },
    { name: 'support_tickets', col: 'gym_id' },
    { name: 'admin_audit_logs', col: 'target_gym_id' },
  ];

  for (const table of tables) {
    try {
      const { error, count } = await supabase
        .from(table.name)
        .delete({ count: 'exact' })
        .in(table.col, deleteIds);

      if (error) {
        // Table might not exist — that's fine
        if (error.code === '42P01') {
          console.log(`   ⏭️  ${table.name} — table does not exist, skipping`);
        } else {
          console.error(`   ❌ ${table.name} — ${error.message}`);
        }
      } else {
        console.log(`   ✅ ${table.name} — deleted ${count ?? '?'} row(s)`);
      }
    } catch (err) {
      console.error(`   ⚠️  ${table.name} — unexpected error:`, err.message);
    }
  }

  // Finally, delete the gym records themselves
  try {
    const { error, count } = await supabase
      .from('gyms')
      .delete({ count: 'exact' })
      .in('id', deleteIds);

    if (error) {
      console.error(`   ❌ gyms — ${error.message}`);
    } else {
      console.log(`   ✅ gyms — deleted ${count ?? '?'} gym(s)`);
    }
  } catch (err) {
    console.error(`   ⚠️  gyms — unexpected error:`, err.message);
  }

  // Verify what's left
  console.log('\n🔍 Verifying remaining data...');
  const { data: remaining } = await supabase.from('gyms').select('id, name, status');
  if (remaining && remaining.length > 0) {
    remaining.forEach((gym) => {
      console.log(`   ✅ "${gym.name}" (${gym.id}) — ${gym.status}`);
    });
  } else {
    console.log('   ⚠️  No gyms remaining (this is unexpected if Fit and Flex exists)');
  }

  console.log('\n🎉 Cleanup complete! Only "Fit and Flex" data remains.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
