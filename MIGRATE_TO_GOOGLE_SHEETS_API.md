# Migrate to Direct Google Sheets API

## Why This Approach?

- ✅ **Free** - Google Sheets API is free
- ✅ **No Apps Script** - Direct API calls
- ✅ **No CORS issues** - Server-side API calls
- ✅ **No deployment headaches** - Just API credentials
- ✅ **Keep existing data** - Same Google Sheet, just different access method

## Step 1: Enable Google Sheets API

1. Go to: https://console.cloud.google.com/
2. Create a new project (or use existing)
3. Enable **Google Sheets API**:
   - APIs & Services → Library
   - Search "Google Sheets API"
   - Click **Enable**

## Step 2: Create Service Account

1. Go to: **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Fill in:
   - **Name**: `mimush-sheets-api`
   - **Description**: `Service account for Merkaz Miyum`
4. Click **Create and Continue**
5. Skip role assignment (click **Continue**)
6. Click **Done**

## Step 3: Create Service Account Key

1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key** → **Create new key**
4. Choose **JSON**
5. Download the JSON file
6. **Save it securely** - this is your credentials!

## Step 4: Share Google Sheet with Service Account

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1jH1Iolq2nwMTFHhvmS9VVmKDCr_QqcmnWyKNfUjybxE
2. Click **Share** button
3. Copy the **email address** from the service account JSON file (looks like `xxxxx@xxxxx.iam.gserviceaccount.com`)
4. Paste it in the Share dialog
5. Give it **Editor** permissions
6. Click **Send**

## Step 5: Install Google APIs Client

```bash
npm install googleapis
```

## Step 6: Set Environment Variables

Add to `.env.local`:
```env
GOOGLE_SHEETS_SPREADSHEET_ID=1jH1Iolq2nwMTFHhvmS9VVmKDCr_QqcmnWyKNfUjybxE
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxxxx@xxxxx.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Important**: The private key needs `\n` for newlines. Copy the entire key from the JSON file.

Add same to Vercel environment variables.

## Step 7: Create API Routes

Replace `/api/sheets` with new routes that use Google Sheets API directly.

## Benefits

- ✅ Completely free
- ✅ No Apps Script needed
- ✅ No CORS issues
- ✅ More reliable
- ✅ Better error handling
- ✅ Keep existing Google Sheet
