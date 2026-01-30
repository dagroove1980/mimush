# Enable Google Sheets API

## The Issue

The error says: "Google Sheets API has not been used in project 204621960736 before or it is disabled."

## Quick Fix

1. **Go to this URL** (it will enable the API for your project):
   https://console.developers.google.com/apis/api/sheets.googleapis.com/overview?project=204621960736

2. Click **Enable** (if the button is there)

3. **OR** if that doesn't work, do this:
   - Go to: https://console.cloud.google.com/apis/library
   - Search for "Google Sheets API"
   - Click on it
   - Click **Enable**
   - Make sure you're in the correct project: `zippy-chariot-485918-t2`

4. **Wait 1-2 minutes** for the API to propagate

5. **Test again**: https://mimush.vercel.app/api/test-credentials

## Alternative: Enable via API

If you prefer, you can also enable it via the Google Cloud Console:
1. Go to: https://console.cloud.google.com/
2. Select project: `zippy-chariot-485918-t2`
3. Go to **APIs & Services** → **Library**
4. Search "Google Sheets API"
5. Click **Enable**

## Verify It's Enabled

After enabling, the test endpoint should return `success: true` instead of the API disabled error.
