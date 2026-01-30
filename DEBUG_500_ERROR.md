# Debugging 500 Error on /api/sheets

## Steps to Debug

### 1. Check Vercel Logs

1. Go to: https://vercel.com/davids-projects-794668e3/mimush
2. Click on the **latest deployment** (the one that's building or just finished)
3. Click on **Functions** tab
4. Find `/api/sheets` in the list
5. Click on it to see details
6. Check the **Logs** tab

Look for:
- `[API] Calling:` - Shows the URL being called
- `[API] Action:` - Shows which action
- `[API] Response status:` - Shows HTTP status code
- `[API] Error response:` - Shows the actual error

### 2. Test the Endpoint Directly

Once deployment finishes, test:
- `https://mimush.vercel.app/api/test-sheets` (GET request)

This will show:
- If environment variable is set
- The actual API response
- Any connection errors

### 3. Common Issues

#### Issue: "NEXT_PUBLIC_SHEETS_APP_URL is not set"
**Fix:** The environment variable isn't set in Vercel
```bash
vercel env add NEXT_PUBLIC_SHEETS_APP_URL production
# Paste: https://script.google.com/macros/s/AKfycbwodOQrXwrP8jVxnL77OfzVtaSDcybsTyMSiXYz4wo9Tbo5fkj9VXFctmYBKkQSXtFb/exec
```

#### Issue: "Invalid JSON from API" or HTML response
**Fix:** The Apps Script Web App might need redeployment
1. Go to Apps Script
2. **Deploy** → **Manage deployments**
3. Click **Edit** → **Deploy** (even without changes)

#### Issue: Connection timeout or network error
**Fix:** Google Apps Script might be blocking the request
- Check Web App deployment settings: **Who has access** should be **Anyone**
- Try redeploying the Web App

### 4. Check Browser Console

Open browser DevTools → Console, and look for:
- The actual error message
- Network tab → Click on `/api/sheets` request → Response tab

### 5. Verify Environment Variable

Check if it's set correctly:
```bash
vercel env ls
```

Should show `NEXT_PUBLIC_SHEETS_APP_URL` for Production, Preview, and Development.

### 6. Test Locally

Run locally to see detailed errors:
```bash
npm run dev
```

Then visit: `http://localhost:3000/api/test-sheets`

Check the terminal for detailed logs.
