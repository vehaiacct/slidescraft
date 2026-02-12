import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials missing. Database features will be disabled.');
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);

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
