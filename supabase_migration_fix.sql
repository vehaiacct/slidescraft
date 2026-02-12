-- Migration Script: Fix UUID to TEXT type mismatch
-- Run this in your Supabase SQL Editor to fix the blank page issue

-- Step 1: Drop existing tables (this will delete all data!)
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Step 2: Recreate tables with correct TEXT type for IDs
CREATE TABLE profiles (
    id TEXT PRIMARY KEY, -- Clerk User ID (string, not UUID)
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    credits INTEGER DEFAULT 5 CHECK (credits >= 0),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id TEXT REFERENCES profiles(id),
    receiver_id TEXT REFERENCES profiles(id),
    amount INTEGER NOT NULL,
    type TEXT CHECK (type IN ('purchase', 'transfer', 'generation')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Step 4: Policies for Profiles
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public profiles are viewable" ON profiles FOR SELECT USING (TRUE);

-- Step 5: Policies for Transactions
CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Step 6: Indexing for performance
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_transactions_sender ON transactions(sender_id);
CREATE INDEX idx_transactions_receiver ON transactions(receiver_id);
