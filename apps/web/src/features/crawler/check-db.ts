
import { createServiceRoleClient } from '@vm/db/src/service-client';

async function checkDb() {
    const supabase = createServiceRoleClient();
    console.log('Checking database tables...');

    const { data, error } = await supabase
        .from('advertisements')
        .select('id')
        .limit(1);

    if (error) {
        console.error('❌ Error accessing advertisements:', error);
    } else {
        console.log('✅ Successfully accessed advertisements table');
    }

    const { data: users, error: userError } = await supabase
        .from('users')
        .select('id')
        .limit(1);

    if (userError) {
        console.error('❌ Error accessing users:', userError);
    } else {
        console.log('✅ Successfully accessed users table');
    }
}

checkDb();
