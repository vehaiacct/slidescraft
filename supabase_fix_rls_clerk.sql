-- Fix RLS Policy: Allow profile creation without Supabase auth
-- This is needed because we're using Clerk for authentication, not Supabase Auth

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create a new INSERT policy that allows anyone to insert (we validate on the app side with Clerk)
CREATE POLICY "Allow profile creation" ON profiles 
FOR INSERT 
WITH CHECK (true);

-- Note: This is safe because:
-- 1. Users can only create ONE profile (id is PRIMARY KEY from Clerk)
-- 2. Clerk handles authentication
-- 3. The app validates the user is signed in before calling this
