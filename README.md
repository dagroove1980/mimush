# מרכז מימוש – Merkaz Miyum

מערכת ניהול משימות ליום-יום עבור ארגון צעירים עם אוטיזם. כולל התחברות חניכים ומנהלים, לוח חניך (כישורים, תוכנית אישית, פעילויות), לוח מנהלים (חניכים, לוח שנה), והערכה עצמית לכישורים.

## טכנולוגיות

- **Frontend**: Next.js 16, React 19, Tailwind CSS, Hebrew RTL
- **Backend / DB**: Google Sheets (Google Apps Script כ-API)
- **Hosting**: Vercel

## התקנה והרצה

### 1. התקנת תלויות

```bash
npm install
```

### 2. הגדרת Google Sheets API

1. צור גיליון Google חדש.
2. העתק את תוכן התיקייה `google-sheets-api` לפרויקט Apps Script:
   - ב-Google Drive: חדש → עוד → Google Apps Script
   - הדבק את תוכן `Code.gs` לקובץ `Code.gs` בפרויקט
   - שמור את הפרויקט וקשר אותו לגיליון (בתפריט "הרצה" או בהגדרות הפרויקט, בחר את הגיליון כ-Spreadsheet)
3. הפעל פונקציה כלשהי (למשל `ensureAdminUser`) פעם אחת כדי ליצור את הגיליונות והמנהל הראשוני.
4. פרסם את הסקריפט כ-**Web App**:
   - פריסה → פריסה חדשה → סוג: יישום אינטרנט
   - הפעל כ: **אני**
   - גישה: **כל אחד**
   - העתק את כתובת ה-URL של היישום.

### 3. משתני סביבה

צור קובץ `.env.local` בשורש הפרויקט:

```env
NEXT_PUBLIC_SHEETS_APP_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

החלף את `YOUR_SCRIPT_ID` בכתובת שקיבלת משלב 2.

### 4. הרצה מקומית

```bash
npm run dev
```

פתח בדפדפן: [http://localhost:3000](http://localhost:3000).

### 5. פריסה ל-Vercel

- חבר את המאגר ל-Vercel.
- הוסף משתנה סביבה: `NEXT_PUBLIC_SHEETS_APP_URL` עם כתובת ה-Web App.
- פריסה אוטומטית בכל דחיפה.

## משתמש ברירת מחדל (מנהל)

לאחר הרצת `ensureAdminUser` פעם אחת:

- **שם משתמש**: `admin`
- **סיסמה**: `admin123`

מומלץ להחליף סיסמה מיד אחרי ההתקנה.

## מבנה הגיליון (Google Sheets)

כל הנתונים באותו גיליון, בטאבים:

| טאב | תיאור |
|-----|--------|
| Users | משתמשים: id, username, password, role, displayName, status |
| Skills | כישורים: id, nameHe |
| SkillMetrics | מדדי הערכה לכישור: id, skillId, nameHe, descriptionHe |
| StudentSkillLevels | רמת חניך בכישור: studentId, skillId, level, progressPercent |
| SelfAssessments | הערכות עצמיות: studentId, skillId, date, metricId, value |
| PersonalPlanTemplates | תבניות משימות: id, nameHe |
| StudentDailyTasks | משימות יומיות לחניך: studentId, taskId, date, completed, timeLabel, priority |
| Activities | פעילויות: id, date, titleHe, descriptionHe, timeStart, timeEnd |
| ActivityCompletions | ביצוע פעילות: activityId, studentId, completed |

## רישיון

פרטי.
