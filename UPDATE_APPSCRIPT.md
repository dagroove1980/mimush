# Update Apps Script - Step by Step

## Quick Update Instructions

### Option 1: Update via Google Sheets (Recommended)

1. **Open your Google Sheet:**
   https://docs.google.com/spreadsheets/d/1jH1Iolq2nwMTFHhvmS9VVmKDCr_QqcmnWyKNfUjybxE

2. **Open Apps Script:**
   - Click **Extensions** → **Apps Script**

3. **Replace the code:**
   - Select all existing code (Ctrl+A / Cmd+A)
   - Delete it
   - Open `/google-sheets-api/Code.gs` from this project
   - Copy ALL the code
   - Paste into Apps Script editor

4. **Save:**
   - Click **Save** (💾) or press Ctrl+S / Cmd+S

5. **Test:**
   - Select function `testConnection` from dropdown
   - Click **Run** (▶️)
   - Check **Executions** tab for results

6. **Initialize (if needed):**
   - Select function `ensureAdminUser`
   - Click **Run** (▶️)
   - Authorize if prompted

7. **Redeploy Web App:**
   - Click **Deploy** → **Manage deployments**
   - Click **Edit** (pencil icon) next to your deployment
   - Click **Deploy** (don't change settings)
   - Copy the URL if it changed
   - Update `.env.local` and Vercel if URL changed

### Option 2: Update via script.google.com

1. **Open Apps Script:**
   https://script.google.com/home/projects

2. **Find your project** (search for "mimush" or similar)

3. **Open the project**

4. **Replace Code.gs:**
   - Click on `Code.gs` in the file list
   - Select all code (Ctrl+A / Cmd+A)
   - Delete it
   - Copy all code from `/google-sheets-api/Code.gs`
   - Paste it
   - **Save** (Ctrl+S / Cmd+S)

5. **Continue with steps 5-7 from Option 1**

## What Changed?

The updated code includes:
- ✅ `testConnection()` function - helps diagnose connection issues
- ✅ All existing API functions
- ✅ Better error handling

## After Updating

1. **Test the connection:**
   - Run `testConnection` function
   - Should return: `{ success: true, message: 'Spreadsheet accessible', rows: X }`

2. **Verify Web App:**
   - Test URL: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=test`
   - Should return JSON: `{"error":"Unknown action"}` (this is good - means script is running!)

3. **Test login:**
   - Visit: https://mimush.vercel.app/login
   - Login with: `admin` / `admin123`

## Troubleshooting

If you get errors after updating:

1. **Check Executions tab** in Apps Script for error details
2. **Verify spreadsheet ID** is correct (if using script properties)
3. **Redeploy Web App** - sometimes changes need redeployment
4. **Check permissions** - make sure Web App is set to "Anyone"
