import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://sdybvuwzrcemhwavtepk.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkeWJ2dXd6cmNlbWh3YXZ0ZXBrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTQxNzE5MywiZXhwIjoyMDg2OTkzMTkzfQ.vHHLDWVkQbH0l2o8Wq1UTE1ogPuvUKpzJxhb5HVnyCA');

// Find profile by nickname pattern
const { data: profiles, error: e1 } = await supabase
  .from('advertisements')
  .select('id, nickname, phone, raw_data')
  .like('nickname', '%VIP סוכנות%');

if (e1) console.log('Search error:', e1.message);
console.log('Profiles found:', profiles?.length || 0);
profiles?.forEach(p => {
  console.log('  ID:', p.id);
  console.log('  Name:', p.nickname);
  console.log('  Phone:', p.phone || p.raw_data?.phone);
});

// If not found, search by ID directly
const { data: byId } = await supabase
  .from('advertisements')
  .select('id, nickname, phone, raw_data')
  .eq('id', '67ce0975-9a77-4b70-ae11-67ab6c6a2020');

console.log('\nBy ID:', byId?.length || 0);
byId?.forEach(p => {
  console.log('  Name:', p.nickname);
  console.log('  Phone:', p.phone || p.raw_data?.phone);
});

// Check CRM tables
for (const t of ['wa_messages', 'wa_conversations', 'contacts', 'leads_for_invite']) {
  const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
  console.log(t + ':', error ? error.message : count + ' rows');
}
