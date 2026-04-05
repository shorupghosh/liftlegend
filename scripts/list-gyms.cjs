const { createClient } = require('@supabase/supabase-js');
const s = createClient(
  'https://jcgaloqryiuvnnsfcflo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZ2Fsb3FyeWl1dm5uc2ZjZmxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTE2NDcsImV4cCI6MjA4ODYyNzY0N30.YMgjfwWIKqK_0Sibz5w4iTPakzItIIoOzQqUR6jdPZk'
);

async function main() {
  const { data, error } = await s.from('gyms').select('id, name, status, created_at');
  if (error) { console.error('Error:', error.message); return; }
  console.log('ALL GYMS IN DATABASE:');
  console.log('=====================');
  data.forEach(g => {
    console.log('  Name: ' + g.name);
    console.log('  ID:   ' + g.id);
    console.log('  Status: ' + g.status);
    console.log('  Created: ' + g.created_at);
    console.log('  ---');
  });
  console.log('Total: ' + data.length + ' gym(s)');
}
main();
