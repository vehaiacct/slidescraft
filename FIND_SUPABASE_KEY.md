# How to Find Your Supabase Anon Key

## Step-by-Step Instructions:

1. Go to: https://supabase.com/dashboard/project/uctndowqmkmdpjnpvqzg/settings/api
   (This is YOUR project's API settings page)

2. On that page, look for a section called "Project API keys"

3. You'll see a table with different keys. Find the row that says:
   - Name: "anon"
   - Type: "public"

4. Click the "Copy" button or "Reveal" button next to that key

5. The key should be VERY LONG (150-250 characters) and start with: eyJ

6. Copy that ENTIRE key

7. Replace line 14 in your .env.local file with:
   VITE_SUPABASE_ANON_KEY=eyJ... (paste the full key here)

## What You're Looking For:

The correct key looks like this (example):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdG5kb3dxbWttZHBqbnB2cXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTU...
```

NOT this:
```
sb_publishable_NG3i8yofiaNLyBcUrCXXvQ_7Rakr01Q  ❌ WRONG
```

## After You Update:

1. Save the .env.local file
2. Stop your dev server (Ctrl+C)
3. Run: npm run dev
4. Refresh your browser
