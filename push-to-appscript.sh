#!/bin/bash
# Script to push code to Apps Script using clasp

echo "🚀 Pushing code to Apps Script..."
echo ""

# Check if .clasp.json exists
if [ ! -f ".clasp.json" ]; then
    echo "❌ .clasp.json not found!"
    echo ""
    echo "Please create .clasp.json with your Script ID:"
    echo ""
    echo "To get your Script ID:"
    echo "1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1jH1Iolq2nwMTFHhvmS9VVmKDCr_QqcmnWyKNfUjybxE"
    echo "2. Click Extensions → Apps Script"
    echo "3. Click Project Settings (⚙️)"
    echo "4. Copy the 'Script ID'"
    echo ""
    echo "Then create .clasp.json:"
    echo '{'
    echo '  "scriptId": "YOUR_SCRIPT_ID_HERE",'
    echo '  "rootDir": "google-sheets-api"'
    echo '}'
    echo ""
    exit 1
fi

# Check if logged in
echo "Checking clasp login status..."
npx clasp login --no-localhost 2>&1 | grep -q "Logged in" || {
    echo "⚠️  Not logged in. Running clasp login..."
    npx clasp login
}

# Push code
echo ""
echo "📤 Pushing code to Apps Script..."
npx clasp push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Code pushed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Go to Apps Script and verify the code"
    echo "2. Run 'ensureAdminUser' function to initialize database"
    echo "3. Redeploy Web App if needed"
else
    echo ""
    echo "❌ Push failed. Check the error above."
fi
