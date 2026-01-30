# פתרון בעיות - Troubleshooting

## בעיה: לא ניתן להתחבר / API לא עובד

אם אתה מקבל שגיאה "לא ניתן להתחבר" או שהאפליקציה לא מתחברת ל-Google Sheets:

### ✅ פתרון 1: ודא שה-Apps Script מקושר לגיליון

הבעיה הנפוצה ביותר היא שה-Apps Script לא יודע איזה גיליון להשתמש.

#### אפשרות א': קשר את הסקריפט לגיליון (מומלץ)

1. פתח את הגיליון שלך: https://docs.google.com/spreadsheets/d/1jH1Iolq2nwMTFHhvmS9VVmKDCr_QqcmnWyKNfUjybxE
2. לחץ על **Extensions** → **Apps Script**
3. אם אתה רואה את הקוד של הסקריפט - זה טוב! ✅
4. אם לא, העתק את כל הקוד מ-`/google-sheets-api/Code.gs` והדבק שם
5. שמור (Ctrl+S / Cmd+S)

#### אפשרות ב': הגדר את ה-SPREADSHEET_ID בסקריפט

1. פתח את פרויקט ה-Apps Script שלך: https://script.google.com/home/projects
2. מצא את הפרויקט שלך ופתח אותו
3. לחץ על **Project Settings** (⚙️) בתפריט השמאלי
4. גלול למטה ל-**Script Properties**
5. לחץ על **Add script property**
6. הוסף:
   - **Property**: `SPREADSHEET_ID`
   - **Value**: `1jH1Iolq2nwMTFHhvmS9VVmKDCr_QqcmnWyKNfUjybxE`
7. לחץ **Save script properties**

### ✅ פתרון 2: ודא שה-Web App מוגדר נכון

1. פתח את פרויקט ה-Apps Script שלך
2. לחץ על **Deploy** → **Manage deployments**
3. לחץ על **Edit** (עריכה) ליד הפריסה שלך
4. ודא שההגדרות הן:
   - **Execute as**: **Me** (אתה)
   - **Who has access**: **Anyone** (כל אחד) ⚠️ חשוב מאוד!
5. לחץ **Deploy**
6. העתק את ה-URL החדש (אם השתנה) ועדכן את `.env.local` ו-Vercel

### ✅ פתרון 3: אתחל את מסד הנתונים

לפני השימוש באפליקציה, צריך לאתחל את הגיליון:

1. פתח את פרויקט ה-Apps Script שלך
2. בחר את הפונקציה `ensureAdminUser` מהתפריט הנפתח למעלה
3. לחץ **Run** (▶️)
4. אם תתבקש להרשות גישה - לחץ **Review permissions** → **Allow**
5. זה יוצר:
   - את כל הטאבים הנדרשים (Users, Skills, וכו')
   - משתמש מנהל ברירת מחדל:
     - שם משתמש: `admin`
     - סיסמה: `admin123`

### ✅ פתרון 4: בדוק את כתובת ה-API

1. פתח את `.env.local` ובדוק שהכתובת נכונה:
   ```env
   NEXT_PUBLIC_SHEETS_APP_URL=https://script.google.com/macros/s/AKfycbwodOQrXwrP8jVxnL77OfzVtaSDcybsTyMSiXYz4wo9Tbo5fkj9VXFctmYBKkQSXtFb/exec
   ```

2. ודא שאין רווחים או תווים מיותרים

3. ודא שה-URL מסתיים ב-`/exec`

### ✅ פתרון 5: בדוק את Vercel

1. לך ל-Vercel: https://vercel.com/davids-projects-794668e3/mimush/settings/environment-variables
2. ודא שיש משתנה סביבה `NEXT_PUBLIC_SHEETS_APP_URL` עם הערך הנכון
3. אם שינית משהו, צריך לעשות **Redeploy**:
   ```bash
   vercel --prod
   ```

## בדיקת חיבור

לבדוק אם ה-API עובד:

1. פתח את הדפדפן
2. לך לכתובת: `https://script.google.com/macros/s/AKfycbwodOQrXwrP8jVxnL77OfzVtaSDcybsTyMSiXYz4wo9Tbo5fkj9VXFctmYBKkQSXtFb/exec?action=test`
3. אם אתה רואה `{"error":"Unknown action"}` - זה טוב! זה אומר שה-API עובד אבל צריך action נכון
4. אם אתה רואה שגיאת HTML או "לא ניתן לפתוח את הקובץ" - יש בעיה בהגדרות

## שגיאות נפוצות

### "Unknown action"
- זה תקין! זה אומר שה-API עובד אבל צריך action ספציפי
- האפליקציה תשלח את ה-action הנכון

### "NEXT_PUBLIC_SHEETS_APP_URL is not set"
- ודא שיצרת את `.env.local` עם המשתנה
- ודא שהוספת את המשתנה ב-Vercel
- הפעל מחדש את שרת הפיתוח (`npm run dev`)

### "Access denied" או CORS errors
- ודא שה-Web App מוגדר עם **"Who has access: Anyone"**
- פרס מחדש את ה-Web App

### "Script not found" או 404
- בדוק שה-URL נכון
- ודא שה-Web App לא נמחק
- נסה לפרס מחדש את ה-Web App

## צעדים מומלצים לפי סדר

1. ✅ ודא שה-Apps Script מקושר לגיליון (פתרון 1)
2. ✅ אתחל את מסד הנתונים (פתרון 3)
3. ✅ בדוק את הגדרות ה-Web App (פתרון 2)
4. ✅ בדוק את `.env.local` (פתרון 4)
5. ✅ בדוק את Vercel (פתרון 5)
6. ✅ נסה להתחבר שוב

## עזרה נוספת

אם עדיין לא עובד:
- בדוק את לוגי ה-Apps Script: **Executions** בתפריט השמאלי
- בדוק את לוגי Vercel: https://vercel.com/davids-projects-794668e3/mimush
- ודא שהגיליון קיים וניתן לגישה
