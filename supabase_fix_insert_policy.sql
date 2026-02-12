-- Quick Fix: Add missing INSERT policies
-- Run this in your Supabase SQL Editor to fix the "Failed to create profile" error

-- Add INSERT policy for profiles (allows users to create their account)
CREATE POLICY "Users can insert their own profile" ON profiles 
FOR INSERT 
WITH CHECK (auth.uid()::text = id);

-- Add INSERT policy for transactions (allows credit transfers and purchases)
CREATE POLICY "Users can insert transactions" ON transactions 
FOR INSERT 
WITH CHECK (sender_id = auth.uid()::text OR receiver_id = auth.uid()::text);
