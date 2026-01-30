# Service Account Setup Complete ✅

## What's Been Added

✅ Service account credentials added to `.env.local`

## Next Steps

### 1. Share Google Sheet with Service Account

**IMPORTANT**: You must share your Google Sheet with the service account email:

1. Open your Google Sheet:
   https://docs.google.com/spreadsheets/d/1jH1Iolq2nwMTFHhvmS9VVmKDCr_QqcmnWyKNfUjybxE

2. Click **Share** button

3. Add this email address:
   ```
   mimush-sheets@zippy-chariot-485918-t2.iam.gserviceaccount.com
   ```

4. Give it **Editor** permissions

5. Click **Send**

**Without this step, the API won't be able to access your sheet!**

### 2. Test Locally

```bash
npm run dev
```

Then visit: http://localhost:3000/login

Try logging in with: `admin` / `admin123`

### 3. Add to Vercel

Once it works locally, add the same environment variables to Vercel:

```bash
vercel env add GOOGLE_SHEETS_SPREADSHEET_ID production
# Enter: 1jH1Iolq2nwMTFHhvmS9VVmKDCr_QqcmnWyKNfUjybxE

vercel env add GOOGLE_SERVICE_ACCOUNT_EMAIL production
# Enter: mimush-sheets@zippy-chariot-485918-t2.iam.gserviceaccount.com

vercel env add GOOGLE_PRIVATE_KEY production
# Paste the entire private key (with \n characters)
```

Then redeploy:
```bash
vercel --prod
```

## What Changed

- ✅ No more Apps Script needed
- ✅ Direct Google Sheets API access
- ✅ No CORS issues
- ✅ More reliable
- ✅ Still free!

## Troubleshooting

If you get "Permission denied" errors:
- Make sure you shared the Google Sheet with the service account email
- Make sure you gave it **Editor** permissions (not Viewer)

If you get "Invalid credentials" errors:
- Check that the private key in `.env.local` has `\n` characters preserved
- Make sure the key is wrapped in quotes
