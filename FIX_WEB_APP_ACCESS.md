# Fix: Web App Requires Authentication

## The Problem

The API is returning a Google sign-in page instead of JSON. This means your Apps Script Web App is not set to allow anonymous access.

## The Solution

### Step 1: Open Apps Script

1. Go to: https://script.google.com/home/projects
2. Find your project (or open it from your Google Sheet: Extensions → Apps Script)
3. Open the project

### Step 2: Redeploy Web App with Correct Settings

1. Click **Deploy** → **Manage deployments**
2. Click **Edit** (pencil icon) next to your existing deployment
3. **IMPORTANT**: Change these settings:
   - **Execute as**: **Me** (your email) ✅
   - **Who has access**: **Anyone** ⚠️ (NOT "Anyone with Google account" - must be just "Anyone")
4. Click **Deploy**
5. **Copy the new Web App URL** (it might be the same, but check)

### Step 3: Update Environment Variable (if URL changed)

If the URL changed, update it:

```bash
# Remove old
vercel env rm NEXT_PUBLIC_SHEETS_APP_URL production
vercel env rm NEXT_PUBLIC_SHEETS_APP_URL preview  
vercel env rm NEXT_PUBLIC_SHEETS_APP_URL development

# Add new (paste the new URL when prompted)
vercel env add NEXT_PUBLIC_SHEETS_APP_URL production
vercel env add NEXT_PUBLIC_SHEETS_APP_URL preview
vercel env add NEXT_PUBLIC_SHEETS_APP_URL development

# Redeploy
vercel --prod
```

### Step 4: Test

After redeploying:

1. Test endpoint: `https://mimush.vercel.app/api/test-sheets`
   - Should return JSON, not HTML
   - Should show `{"error":"Unknown action"}` or similar (this is good!)

2. Try login: `https://mimush.vercel.app/login`
   - Should work now!

## Why This Happens

Google Apps Script Web Apps have three access levels:
1. **Only myself** - Requires your Google account login
2. **Anyone with Google account** - Requires any Google account login
3. **Anyone** ✅ - No login required (this is what we need!)

For API access from your Next.js app, you need option 3.

## Verification

After fixing, the test endpoint should return something like:
```json
{
  "success": true,
  "status": 200,
  "responsePreview": "{\"error\":\"Unknown action\"}"
}
```

Instead of the HTML sign-in page.
