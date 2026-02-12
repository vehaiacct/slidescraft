-- Profiles Table
CREATE TABLE profiles (
    id TEXT PRIMARY KEY, -- Clerk User ID
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    credits INTEGER DEFAULT 5 CHECK (credits >= 0),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions Table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id TEXT REFERENCES profiles(id),
    receiver_id TEXT REFERENCES profiles(id),
    amount INTEGER NOT NULL,
    type TEXT CHECK (type IN ('purchase', 'transfer', 'generation')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policies for Profiles
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid()::text = id);
CREATE POLICY "Public profiles are viewable" ON profiles FOR SELECT USING (TRUE); -- Needed for search/transfer

-- Policies for Transactions
CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (sender_id = auth.uid()::text OR receiver_id = auth.uid()::text);

-- Indexing for performance
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_transactions_sender ON transactions(sender_id);
CREATE INDEX idx_transactions_receiver ON transactions(receiver_id);
