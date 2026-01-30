# Environment Setup Complete ✅

## What's Been Configured

### ✅ Local Development
- Created `.env.local` with your Web App URL
- Ready for `npm run dev`

### ✅ Vercel Production
- Added `NEXT_PUBLIC_SHEETS_APP_URL` to all environments:
  - Production ✅
  - Preview ✅
  - Development ✅

## Your Configuration

- **Web App URL**: `https://script.google.com/macros/s/AKfycbwodOQrXwrP8jVxnL77OfzVtaSDcybsTyMSiXYz4wo9Tbo5fkj9VXFctmYBKkQSXtFb/exec`
- **Google Sheet ID**: `1jH1Iolq2nwMTFHhvmS9VVmKDCr_QqcmnWyKNfUjybxE`

## Important: Link Apps Script to Your Sheet

Since you created the Apps Script separately, make sure it's linked to your Google Sheet:

### Option 1: Bind Script to Sheet (Recommended)
1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1jH1Iolq2nwMTFHhvmS9VVmKDCr_QqcmnWyKNfUjybxE
2. Go to **Extensions** → **Apps Script**
3. If you see your script code, it's already bound ✅
4. If not, you need to copy the script code there

### Option 2: Set Spreadsheet ID in Script Properties
1. Open your Apps Script project: https://script.google.com/home/projects
2. Find your project and open it
3. Go to **Project Settings** (⚙️ icon)
4. Under **Script Properties**, click **Add script property**
5. Add:
   - **Property**: `SPREADSHEET_ID`
   - **Value**: `1jH1Iolq2nwMTFHhvmS9VVmKDCr_QqcmnWyKNfUjybxE`
6. Save

## Initialize the Database

Before using the app, you need to initialize the database:

1. Open your Apps Script project
2. Select the function `ensureAdminUser` from the dropdown
3. Click **Run** (▶️)
4. Authorize when prompted
5. This creates:
   - All required sheet tabs (Users, Skills, etc.)
   - Default admin user:
     - Username: `admin`
     - Password: `admin123`

## Next Steps

1. **Redeploy Vercel** (to pick up the new env var):
   ```bash
   vercel --prod
   ```
   Or just push to GitHub - it will auto-deploy

2. **Test the app**:
   - Visit: https://mimush.vercel.app/login
   - Login with: `admin` / `admin123`

3. **Change the default password** immediately after first login!

## Troubleshooting

If you get "Unknown action" when accessing the Web App URL directly - that's normal! The app expects specific action parameters.

If you get errors in the app:
- Check that `ensureAdminUser` was run successfully
- Verify the Apps Script is linked to the correct spreadsheet
- Check Vercel deployment logs for API errors
