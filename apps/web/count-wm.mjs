import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://sdybvuwzrcemhwavtepk.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkeWJ2dXd6cmNlbWh3YXZ0ZXBrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTQxNzE5MywiZXhwIjoyMDg2OTkzMTkzfQ.vHHLDWVkQbH0l2o8Wq1UTE1ogPuvUKpzJxhb5HVnyCA');

// Get all titi profiles that still have watermarked photos
const { data } = await supabase
  .from('advertisements')
  .select('id, nickname, photos, source')
  .eq('raw_data->>_verified', 'true')
  .eq('source', 'titi')
  .not('photos', 'is', null);

let totalWatermarked = 0;
let profilesWithWM = 0;

for (const p of data) {
  const wmPhotos = (p.photos || []).filter(url =>
    url.includes('profile-photos') && url.indexOf('wa-media') === -1
  );
  if (wmPhotos.length > 0) {
    profilesWithWM++;
    totalWatermarked += wmPhotos.length;
  }
}

console.log('Titi profiles with watermarked photos:', profilesWithWM);
console.log('Total watermarked photos to process:', totalWatermarked);

// Check total photos distribution
let totalClean = 0;
for (const p of data) {
  const cleanPhotos = (p.photos || []).filter(url => url.includes('wa-media'));
  totalClean += cleanPhotos.length;
}
console.log('Titi profiles with CRM (clean) photos:', data.filter(p => (p.photos||[]).some(u => u.includes('wa-media'))).length);
console.log('Total CRM clean photos:', totalClean);
