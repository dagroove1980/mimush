# Quick Guide: Push to Apps Script with Clasp

## First Time Setup

### 1. Get Your Script ID

**If script is bound to sheet (recommended):**
1. Open: https://docs.google.com/spreadsheets/d/1jH1Iolq2nwMTFHhvmS9VVmKDCr_QqcmnWyKNfUjybxE
2. Click **Extensions** → **Apps Script**
3. Click **Project Settings** (⚙️ icon on left)
4. Copy the **Script ID** (long string like `1AbC2dEf3GhI4JkL5MnOp6QrStUvWxYz`)

**If script is standalone:**
1. Go to: https://script.google.com/home/projects
2. Find your project, open it
3. Click **Project Settings** (⚙️)
4. Copy the **Script ID**

### 2. Create .clasp.json

Create file `.clasp.json` in project root:

```json
{
  "scriptId": "PASTE_YOUR_SCRIPT_ID_HERE",
  "rootDir": "google-sheets-api"
}
```

Replace `PASTE_YOUR_SCRIPT_ID_HERE` with your actual Script ID.

### 3. Login to Clasp

```bash
npm run appscript:login
```

This opens a browser for Google authentication.

## Push Code

After setup, push code with:

```bash
npm run appscript:push
```

Or use the script:
```bash
./push-to-appscript.sh
```

## Other Commands

- `npm run appscript:pull` - Pull code from Apps Script (if you edited it there)
- `npm run appscript:open` - Open Apps Script in browser

## After Pushing

1. **Initialize database** (if first time):
   - Open Apps Script
   - Run `ensureAdminUser` function
   - Run `testConnection` to verify

2. **Redeploy Web App** (if needed):
   - Deploy → Manage deployments → Edit → Deploy

3. **Test**: https://mimush.vercel.app/login
