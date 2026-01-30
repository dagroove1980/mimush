# תיקון חיבור ה-API - Fix API Connection

## הבעיה
ה-API מחזיר שגיאה כי ה-Apps Script לא יודע איזה גיליון להשתמש.

## הפתרון המהיר

### שלב 1: קשר את הסקריפט לגיליון

**אפשרות א' - העתק את הקוד לגיליון (הכי פשוט):**

1. פתח את הגיליון שלך:
   https://docs.google.com/spreadsheets/d/1jH1Iolq2nwMTFHhvmS9VVmKDCr_QqcmnWyKNfUjybxE

2. לחץ על **Extensions** (תוספות) → **Apps Script**

3. אם אתה רואה קוד שם - מחק הכל

4. פתח את הקובץ `/google-sheets-api/Code.gs` מהפרויקט שלך

5. העתק את כל התוכן והדבק ב-Apps Script

6. לחץ **Save** (💾)

7. **חשוב**: ודא שהסקריפט מקושר לגיליון הזה (אם פתחת דרך Extensions, זה כבר קשור)

### שלב 2: אתחל את מסד הנתונים

1. ב-Apps Script, בחר את הפונקציה `ensureAdminUser` מהתפריט למעלה

2. לחץ **Run** (▶️)

3. אם תתבקש הרשאות - לחץ **Review permissions** → **Allow**

4. זה יוצר את כל הטאבים והמשתמש הראשוני

### שלב 3: פרס מחדש את ה-Web App

1. ב-Apps Script, לחץ **Deploy** → **Manage deployments**

2. לחץ על **Edit** (עריכה) ליד הפריסה הקיימת

3. ודא:
   - **Execute as**: **Me** (אתה)
   - **Who has access**: **Anyone** (כל אחד) ⚠️

4. לחץ **Deploy**

5. **העתק את ה-URL החדש** (אם השתנה)

### שלב 4: עדכן את הכתובת

אם קיבלת URL חדש, עדכן:

1. **ב-`.env.local`**:
   ```env
   NEXT_PUBLIC_SHEETS_APP_URL=<הכתובת החדשה>
   ```

2. **ב-Vercel**:
   ```bash
   vercel env rm NEXT_PUBLIC_SHEETS_APP_URL production
   vercel env add NEXT_PUBLIC_SHEETS_APP_URL production
   # הדבק את הכתובת החדשה
   ```

3. **פרס מחדש**:
   ```bash
   vercel --prod
   ```

---

## אפשרות ב' - הגדר SPREADSHEET_ID (אם לא רוצה להעתיק קוד)

אם אתה רוצה להשאיר את הסקריפט נפרד מהגיליון:

1. פתח את פרויקט ה-Apps Script שלך

2. לחץ **Project Settings** (⚙️)

3. גלול למטה ל-**Script Properties**

4. לחץ **Add script property**

5. הוסף:
   - **Property**: `SPREADSHEET_ID`
   - **Value**: `1jH1Iolq2nwMTFHhvmS9VVmKDCr_QqcmnWyKNfUjybxE`

6. לחץ **Save script properties**

7. חזור לשלב 2 למעלה (אתחל את מסד הנתונים)

---

## בדיקה

לאחר התיקון, נסה:

1. פתח: https://mimush.vercel.app/login
2. התחבר עם: `admin` / `admin123`

אם זה עובד - סיימת! ✅
