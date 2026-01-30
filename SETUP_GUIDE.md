# Setup Guide: NEXT_PUBLIC_SHEETS_APP_URL

## What is this?

`NEXT_PUBLIC_SHEETS_APP_URL` is the URL of your Google Apps Script Web App that acts as the backend API for this application. Your app uses **Google Sheets as a database**, and the Apps Script provides the API layer to read/write data.

## Architecture Flow

```
Next.js App (Vercel) 
  ↓ (makes request to)
/api/sheets (Next.js API route)
  ↓ (proxies to)
Google Apps Script Web App (NEXT_PUBLIC_SHEETS_APP_URL)
  ↓ (reads/writes from/to)
Google Sheets (Database)
```

## Step-by-Step Setup

### Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it something like "Merkaz Miyum Database" (or any name you prefer)
4. **Keep this tab open** - you'll need it in the next step

### Step 2: Create Google Apps Script Project

1. In your Google Sheet, click **Extensions** → **Apps Script**
   - Or go directly to [script.google.com](https://script.google.com)
2. Delete any default code in the editor
3. Copy the entire contents of `/google-sheets-api/Code.gs` from this project
4. Paste it into the Apps Script editor
5. Click **Save** (💾 icon or Ctrl+S / Cmd+S)
6. Name your project (e.g., "Merkaz Miyum API")

### Step 3: Link Script to Your Sheet

1. In the Apps Script editor, click the **Settings** (⚙️) icon on the left sidebar
2. Under **Google Cloud Platform (GCP) Project**, make sure it's linked to your sheet
3. If you created the script from the sheet (Extensions → Apps Script), it's already linked
4. If you created it separately, you need to:
   - In the Apps Script editor, go to **Resources** → **Cloud Platform project...**
   - Or set the spreadsheet ID in the script properties (see Code.gs line 58)

### Step 4: Initialize the Database

1. In the Apps Script editor, select the function `ensureAdminUser` from the dropdown at the top
2. Click **Run** (▶️ icon)
3. Authorize the script when prompted (allow access to Google Sheets)
4. This creates the initial admin user:
   - **Username**: `admin`
   - **Password**: `admin123`
5. Check your Google Sheet - you should see new tabs created (Users, Skills, etc.)

### Step 5: Deploy as Web App

1. In the Apps Script editor, click **Deploy** → **New deployment**
2. Click the **gear icon** (⚙️) next to "Select type" → choose **Web app**
3. Configure:
   - **Description**: "Merkaz Miyum API" (or any description)
   - **Execute as**: **Me** (your email)
   - **Who has access**: **Anyone** (important!)
4. Click **Deploy**
5. **Copy the Web App URL** - it looks like:
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```
   ⚠️ **SAVE THIS URL** - you'll need it next!

### Step 6: Set Environment Variable

#### For Local Development:

1. Create a file `.env.local` in the project root:
   ```bash
   cd /Users/davidscebat/Documents/mimush
   touch .env.local
   ```

2. Add this line (replace with YOUR Web App URL):
   ```env
   NEXT_PUBLIC_SHEETS_APP_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```

3. Restart your dev server:
   ```bash
   npm run dev
   ```

#### For Vercel Production:

1. Go to your Vercel project: https://vercel.com/davids-projects-794668e3/mimush/settings
2. Click **Environment Variables** in the left sidebar
3. Click **Add New**
4. Add:
   - **Name**: `NEXT_PUBLIC_SHEETS_APP_URL`
   - **Value**: Your Web App URL (from Step 5)
   - **Environment**: Select all (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** your app (or it will auto-deploy on next push)

## Testing

1. Visit your app: https://mimush.vercel.app/login
2. Try logging in with:
   - Username: `admin`
   - Password: `admin123`
3. If it works, you're all set! 🎉

## Troubleshooting

### Error: "NEXT_PUBLIC_SHEETS_APP_URL is not set"
- Make sure you created `.env.local` for local development
- Make sure you added the environment variable in Vercel settings
- Restart your dev server after creating `.env.local`

### Error: "Access denied" or CORS errors
- Make sure your Web App deployment has **"Who has access: Anyone"**
- Redeploy the Web App if you changed the access settings

### Error: "Script not found" or 404
- Double-check the Web App URL is correct
- Make sure you copied the full URL including `/exec` at the end
- Try redeploying the Web App and getting a fresh URL

### Data not appearing
- Run `ensureAdminUser` function again in Apps Script
- Check your Google Sheet to see if tabs were created
- Make sure the script is linked to the correct spreadsheet

## Security Notes

⚠️ **Important**: The default admin password is `admin123`. Change it immediately after setup!

To change the password:
1. Log in to your app
2. Go to admin settings (if available)
3. Or manually edit the `Users` tab in your Google Sheet

## Need Help?

- Check the main README.md for more details
- Review the Google Apps Script code in `/google-sheets-api/Code.gs`
- Check Vercel deployment logs for API errors
