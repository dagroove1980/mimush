# Diagnosing 500 Error - API Connection Issue

## The Problem

You're getting a 500 error because the Apps Script can't access your Google Sheet. The error happens **before** the script can even run, which is why you see an HTML error page instead of JSON.

## Quick Diagnostic Steps

### Step 1: Verify Script is Bound to Sheet

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1jH1Iolq2nwMTFHhvmS9VVmKDCr_QqcmnWyKNfUjybxE

2. Click **Extensions** → **Apps Script**

3. **Do you see your code there?**
   - ✅ **YES** → Script is bound, go to Step 2
   - ❌ **NO** → You need to copy the code there (see Fix below)

### Step 2: Test the Script Directly

1. In Apps Script, select function `testConnection` (we'll add this)
2. Click **Run** (▶️)
3. Check the execution logs

### Step 3: Check Script Properties

1. In Apps Script, click **Project Settings** (⚙️)
2. Scroll to **Script Properties**
3. **Do you see `SPREADSHEET_ID`?**
   - ✅ **YES** → Check if value is `1jH1Iolq2nwMTFHhvmS9VVmKDCr_QqcmnWyKNfUjybxE`
   - ❌ **NO** → Add it (see Fix below)

## Fix: Add Test Function

Add this function to your Apps Script to test the connection:

```javascript
function testConnection() {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Users');
    if (!sheet) {
      Logger.log('Users sheet does not exist - will be created');
      return { success: true, message: 'Spreadsheet accessible, Users sheet will be created on first use' };
    }
    const data = sheet.getDataRange().getValues();
    Logger.log('Success! Found ' + data.length + ' rows in Users sheet');
    return { success: true, message: 'Spreadsheet accessible', rows: data.length };
  } catch (err) {
    Logger.log('Error: ' + err.toString());
    return { success: false, error: err.toString() };
  }
}
```

1. Add this function to your Apps Script
2. Select `testConnection` from dropdown
3. Click **Run** (▶️)
4. Check **Executions** tab to see the result

## Most Common Fixes

### Fix 1: Bind Script to Sheet (If Not Already Done)

1. Open your Google Sheet
2. **Extensions** → **Apps Script**
3. Delete any existing code
4. Copy ALL code from `/google-sheets-api/Code.gs`
5. Paste into Apps Script
6. **Save** (Ctrl+S / Cmd+S)
7. Run `ensureAdminUser` function
8. Redeploy Web App

### Fix 2: Set SPREADSHEET_ID Property

If your script is separate from the sheet:

1. Open Apps Script project
2. **Project Settings** (⚙️)
3. **Script Properties** → **Add script property**
4. Property: `SPREADSHEET_ID`
5. Value: `1jH1Iolq2nwMTFHhvmS9VVmKDCr_QqcmnWyKNfUjybxE`
6. **Save script properties**
7. Redeploy Web App

### Fix 3: Check Web App Deployment

1. **Deploy** → **Manage deployments**
2. Click **Edit** (pencil icon)
3. Verify:
   - **Execute as**: **Me** (your email)
   - **Who has access**: **Anyone** ⚠️ (must be "Anyone"!)
4. Click **Deploy**
5. Copy the new URL if it changed
6. Update `.env.local` and Vercel if URL changed

### Fix 4: Initialize Database

1. In Apps Script, select `ensureAdminUser`
2. Click **Run** (▶️)
3. Authorize if prompted
4. Check your Google Sheet - you should see tabs created

## Verify It's Working

After fixes, test the API directly:

```bash
curl -X POST "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=login" \
  -H "Content-Type: application/json" \
  -d '{"action":"login","username":"admin","password":"admin123"}' \
  -L
```

You should get JSON back, not HTML. If you get JSON with `{"error":"Unknown action"}` or similar, that's actually good - it means the script is running!

## Check Vercel Logs

1. Go to: https://vercel.com/davids-projects-794668e3/mimush
2. Click on latest deployment
3. Check **Functions** tab → `/api/sheets`
4. Look at error logs

The error should show what's failing - likely "Cannot find spreadsheet" or similar.
