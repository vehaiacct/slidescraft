import { supabase } from './services/supabase';

// Test Supabase connection
async function testSupabase() {
    console.log('🔍 Testing Supabase connection...');

    try {
        const { data, error } = await supabase.from('profiles').select('count');

        if (error) {
            console.error('❌ Supabase Error:', error);
        } else {
            console.log('✅ Supabase Connected! Profiles table accessible.');
            console.log('Data:', data);
        }
    } catch (err) {
        console.error('❌ Connection failed:', err);
    }
}

// Run test on page load
testSupabase();

export { };
