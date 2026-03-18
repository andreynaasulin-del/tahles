import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://sdybvuwzrcemhwavtepk.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkeWJ2dXd6cmNlbWh3YXZ0ZXBrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTQxNzE5MywiZXhwIjoyMDg2OTkzMTkzfQ.vHHLDWVkQbH0l2o8Wq1UTE1ogPuvUKpzJxhb5HVnyCA');

// Find and fix "איכותית במרכז לביתך/מלון" -> agency
const { data } = await supabase
  .from('advertisements')
  .select('id, nickname, raw_data')
  .like('nickname', '%איכותית במרכז%');

console.log('Found:', data?.length);
for (const p of (data || [])) {
  console.log('  Name:', p.nickname, '| Current:', p.raw_data._category);
  const updated = { ...p.raw_data, _category: 'agency' };
  const { error } = await supabase.from('advertisements').update({ raw_data: updated }).eq('id', p.id);
  console.log('  ->', error ? 'Error: ' + error.message : 'Changed to agency');
}

// Also show all profiles with agency-sounding names that are marked individual
const { data: all } = await supabase
  .from('advertisements')
  .select('id, nickname, raw_data')
  .eq('raw_data->>_verified', 'true')
  .eq('raw_data->>_category', 'individual');

const suspicious = all.filter(p => {
  const n = p.nickname.toLowerCase();
  return n.includes('לביתך') || n.includes('למלון') || n.includes('לביתך/מלון') ||
         n.includes('סוכנות') || n.includes('עד אליך') || n.includes('דוגמניות');
});

console.log('\nSuspicious "individual" profiles (agency-like names):');
suspicious.forEach(p => console.log(' ', p.nickname, '|', p.id.substring(0,8)));
