# How to Deploy to Vercel with Supabase

## Step 1: Push Your Code (Already Done!)

The code is being pushed to GitHub now.

## Step 2: Add Environment Variables to Vercel

1. Go to: https://vercel.com/dashboard
2. Click on your **SlideCraft AI** project
3. Go to **Settings** → **Environment Variables**
4. Add these variables one by one:

### Variable 1:
- **Name**: `VITE_SUPABASE_URL`
- **Value**: `https://uctndowqmkmdpjnpvqzg.supabase.co`
- **Environment**: Select all three (Production, Preview, Development)
- Click **Save**

### Variable 2:
- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdG5kb3dxbWttZHBqbnB2cXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MzM3NzksImV4cCI6MjA4NjQwOTc3OX0.hPLgKZjeKDt-dLN7xHNu_QXwEtDvWZ2NjgYMWGRSHdg`
- **Environment**: Select all three (Production, Preview, Development)
- Click **Save**

## Step 3: Wait for Auto-Deploy

After you push the code, Vercel will automatically:
1. Detect the new commit
2. Build with the new environment variables
3. Deploy the updated site

This takes about 1-2 minutes.

## Step 4: Test

Once deployed:
1. Go to your live site
2. Refresh the page (Ctrl+Shift+R to hard refresh)
3. You should see the username onboarding screen!

---

## For Local Testing

Your local site should work now too:
1. Open http://localhost:5173/
2. You should see the onboarding screen
3. If still blank, check console for errors
