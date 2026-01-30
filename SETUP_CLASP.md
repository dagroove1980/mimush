# Setup Clasp to Push Code to Apps Script

## Initial Setup (One Time)

### Step 1: Login to Clasp

```bash
cd /Users/davidscebat/Documents/mimush
npx clasp login
```

This will open a browser window for Google authentication.

### Step 2: Get Your Script ID

You have two options:

**Option A: If your script is bound to the sheet (recommended)**
1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1jH1Iolq2nwMTFHhvmS9VVmKDCr_QqcmnWyKNfUjybxE
2. Click **Extensions** → **Apps Script**
3. Click **Project Settings** (⚙️)
4. Copy the **Script ID** (looks like: `1AbC2dEf3GhI4JkL5MnOp6QrStUvWxYz`)

**Option B: If your script is standalone**
1. Go to: https://script.google.com/home/projects
2. Find your project
3. Open it
4. Click **Project Settings** (⚙️)
5. Copy the **Script ID**

### Step 3: Create .clasp.json

Create a file `.clasp.json` in the project root:

```json
{
  "scriptId": "YOUR_SCRIPT_ID_HERE",
  "rootDir": "google-sheets-api"
}
```

Replace `YOUR_SCRIPT_ID_HERE` with the Script ID from Step 2.

### Step 4: Push Code

```bash
npx clasp push
```

This will push all files from `google-sheets-api/` to your Apps Script project.

## Daily Usage

After initial setup, whenever you update the code:

```bash
# Push code to Apps Script
npx clasp push

# Or pull code from Apps Script (if you edited it there)
npx clasp pull
```

## Add npm Scripts (Optional)

Add these to your `package.json`:

```json
{
  "scripts": {
    "push:appscript": "clasp push",
    "pull:appscript": "clasp pull",
    "open:appscript": "clasp open"
  }
}
```

Then you can use:
- `npm run push:appscript` - Push code
- `npm run pull:appscript` - Pull code
- `npm run open:appscript` - Open Apps Script in browser

## Troubleshooting

### "Script ID not found"
- Make sure you copied the Script ID (not the deployment URL)
- The Script ID is in Project Settings, not the Web App URL

### "Permission denied"
- Make sure you're logged in: `npx clasp login`
- Make sure you have edit access to the Apps Script project

### Files not pushing
- Check `.claspignore` - files listed there won't be pushed
- Make sure `rootDir` in `.clasp.json` points to the right folder
