import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase credentials missing. Database features will be disabled.');
    console.warn('Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.local file');
}

// Create a safe client - will work even if credentials are missing
export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createClient('https://placeholder.supabase.co', 'placeholder-key');

export interface UserProfile {
    id: string; // Clerk User ID
    email: string;
    username: string;
    credits: number;
    is_admin: boolean;
    created_at: string;
}

export interface Transaction {
    id: string;
    sender_id: string | null;
    receiver_id: string | null;
    amount: number;
    type: 'purchase' | 'transfer' | 'generation';
    created_at: string;
}
