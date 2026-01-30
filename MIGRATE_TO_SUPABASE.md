# Migrate from Google Apps Script to Supabase

## Why Supabase?

- ✅ **Free tier** (500MB database, 2GB bandwidth)
- ✅ **Works perfectly** with Vercel serverless functions
- ✅ **No CORS issues** - proper API
- ✅ **Simple JavaScript client**
- ✅ **Built-in authentication** (optional, we can keep custom auth)
- ✅ **Real-time capabilities** (if needed later)
- ✅ **Great dashboard** for viewing/managing data

## Step 1: Create Supabase Project

1. Go to: https://supabase.com/
2. Sign up / Log in (free)
3. Click **"New Project"**
4. Fill in:
   - **Name**: `mimush` or `merkaz-miyum`
   - **Database Password**: (choose a strong password - save it!)
   - **Region**: Choose closest to your users
5. Click **"Create new project"**
6. Wait 2-3 minutes for setup

## Step 2: Get Connection Details

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - Keep this secret!

## Step 3: Create Database Schema

In Supabase dashboard, go to **SQL Editor** and run the migration script (I'll create this).

## Step 4: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

## Step 5: Update Environment Variables

Add to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Server-side only
```

Add same to Vercel environment variables.

## Step 6: Create API Routes

Replace `/api/sheets` with Supabase API routes that use the Supabase client.

## Benefits

- ✅ No more CORS issues
- ✅ No more Apps Script deployment headaches
- ✅ Proper database with relationships
- ✅ Better performance
- ✅ Easier to maintain
- ✅ Free tier is generous

Would you like me to:
1. Create the database schema SQL?
2. Create the Supabase client setup?
3. Migrate the API routes?
4. Create a migration script to move data from Google Sheets?
