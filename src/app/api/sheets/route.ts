/**
 * Google Sheets API Route (Direct Access)
 * Replaces Apps Script with direct Google Sheets API calls
 */

import { NextRequest, NextResponse } from "next/server";
import {
  readSheet,
  appendRow,
  updateCell,
  updateRange,
  findRows,
  ensureSheet,
  findAndUpdateCell,
  deleteRow,
} from "@/lib/google-sheets-client";

const SHEET_NAMES = {
  USERS: 'Users',
  SKILLS: 'Skills',
  SKILL_METRICS: 'SkillMetrics',
  STUDENT_SKILL_LEVELS: 'StudentSkillLevels',
  SELF_ASSESSMENTS: 'SelfAssessments',
  PERSONAL_PLAN_TEMPLATES: 'PersonalPlanTemplates',
  STUDENT_DAILY_TASKS: 'StudentDailyTasks',
  ACTIVITIES: 'Activities',
  ACTIVITY_COMPLETIONS: 'ActivityCompletions',
  ACTIVITY_METRICS: 'ActivityMetrics',
  ACTIVITY_ASSESSMENTS: 'ActivityAssessments',
};

const DEFAULT_DEMO_SKILLS = [
  { id: 'cooking', nameHe: 'בישול' },
  { id: 'computer', nameHe: 'מחשב' },
  { id: 'drawing', nameHe: 'ציור' },
  { id: 'social', nameHe: 'כישורים חברתיים' },
  { id: 'cleaning', nameHe: 'ניקיון וארגון' },
  { id: 'fitness', nameHe: 'פעילות גופנית' },
];

const DEFAULT_SKILL_METRICS = [
  { skillId: 'cooking', metricId: 'teamwork', nameHe: 'עבודת צוות', descriptionHe: 'הקשבתי לאחרים ועזרתי לקבוצה?' },
  { skillId: 'cooking', metricId: 'quality', nameHe: 'איכות עבודה', descriptionHe: 'עקבתי אחר המתכון בקפידה?' },
  { skillId: 'cooking', metricId: 'responsibility', nameHe: 'אחריות', descriptionHe: 'ניקיתי את התחנה שלי בסיום?' },
  { skillId: 'computer', metricId: 'teamwork', nameHe: 'עבודת צוות', descriptionHe: 'שיתפתי פעולה עם אחרים?' },
  { skillId: 'computer', metricId: 'quality', nameHe: 'איכות עבודה', descriptionHe: 'השלמתי את המשימה ברמה טובה?' },
  { skillId: 'computer', metricId: 'responsibility', nameHe: 'אחריות', descriptionHe: 'שמרתי על הסדר?' },
  { skillId: 'drawing', metricId: 'teamwork', nameHe: 'עבודת צוות', descriptionHe: 'עבדתי יפה עם אחרים?' },
  { skillId: 'drawing', metricId: 'quality', nameHe: 'איכות עבודה', descriptionHe: 'השקעתי באיכות?' },
  { skillId: 'drawing', metricId: 'responsibility', nameHe: 'אחריות', descriptionHe: 'סידרתי את החומרים?' },
  { skillId: 'social', metricId: 'teamwork', nameHe: 'עבודת צוות', descriptionHe: 'הקשבתי ועזרתי?' },
  { skillId: 'social', metricId: 'quality', nameHe: 'איכות עבודה', descriptionHe: 'השתתפתי בצורה טובה?' },
  { skillId: 'social', metricId: 'responsibility', nameHe: 'אחריות', descriptionHe: 'הייתי אחראי?' },
  { skillId: 'cleaning', metricId: 'teamwork', nameHe: 'עבודת צוות', descriptionHe: 'שיתפתי פעולה בתורנות?' },
  { skillId: 'cleaning', metricId: 'quality', nameHe: 'איכות עבודה', descriptionHe: 'ביצעתי את המשימה כמו שצריך?' },
  { skillId: 'cleaning', metricId: 'responsibility', nameHe: 'אחריות', descriptionHe: 'סידרתי והשלמתי?' },
  { skillId: 'fitness', metricId: 'teamwork', nameHe: 'עבודת צוות', descriptionHe: 'עבדתי יפה עם הקבוצה?' },
  { skillId: 'fitness', metricId: 'quality', nameHe: 'איכות עבודה', descriptionHe: 'השקעתי במאמץ?' },
  { skillId: 'fitness', metricId: 'responsibility', nameHe: 'אחריות', descriptionHe: 'הופעתי והשתתפתי?' },
];

export async function POST(request: NextRequest) {
  try {
    // Check environment variables
    if (!process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
      console.error("[API] GOOGLE_SHEETS_SPREADSHEET_ID not set");
      return NextResponse.json(
        { error: "GOOGLE_SHEETS_SPREADSHEET_ID not configured" },
        { status: 500 }
      );
    }
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      console.error("[API] GOOGLE_SERVICE_ACCOUNT_EMAIL not set");
      return NextResponse.json(
        { error: "GOOGLE_SERVICE_ACCOUNT_EMAIL not configured" },
        { status: 500 }
      );
    }
    if (!process.env.GOOGLE_PRIVATE_KEY) {
      console.error("[API] GOOGLE_PRIVATE_KEY not set");
      return NextResponse.json(
        { error: "GOOGLE_PRIVATE_KEY not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { action, ...params } = body;

    if (!action) {
      return NextResponse.json({ error: "Missing action" }, { status: 400 });
    }

    console.log("[API] Action:", action);

    // Initialize sheets
    await initializeSheets();

    let result: any = { error: 'Unknown action' };

    // Handle actions
    switch (action) {
      case 'login':
        result = await handleLogin(params.username, params.password);
        break;
      case 'getStudents':
        result = await handleGetStudents();
        break;
      case 'addStudent':
        result = await handleAddStudent(params);
        break;
      case 'updateStudentPassword':
        result = await handleUpdateStudentPassword(params.studentId, params.newPassword);
        break;
      case 'updateStudentStatus':
        result = await handleUpdateStudentStatus(params.studentId, params.status);
        break;
      case 'getSkills':
        result = await handleGetSkills();
        break;
      case 'getStudentSkills':
        result = await handleGetStudentSkills(params.studentId);
        break;
      case 'getSkillMetrics':
        result = await handleGetSkillMetrics(params.skillId);
        break;
      case 'saveSelfAssessment':
        result = await handleSaveSelfAssessment(params.studentId, params.skillId, params.metrics);
        break;
      case 'getPersonalPlanTasks':
        result = await handleGetPersonalPlanTasks(params.studentId, params.date);
        break;
      case 'setTaskCompleted':
        result = await handleSetTaskCompleted(params.studentId, params.taskId, params.date, params.completed);
        break;
      case 'getActivitiesForDate':
        result = await handleGetActivitiesForDate(params.studentId, params.date);
        break;
      case 'getActivitiesForDateRange':
        result = await handleGetActivitiesForDateRange(params.startDate, params.endDate);
        break;
      case 'addActivity':
        result = await handleAddActivity(params);
        break;
      case 'updateActivity':
        result = await handleUpdateActivity(params.activityId, params);
        break;
      case 'deleteActivity':
        result = await handleDeleteActivity(params.activityId);
        break;
      case 'setActivityCompleted':
        result = await handleSetActivityCompleted(params.studentId, params.activityId, params.completed);
        break;
      case 'getActivityMetrics':
        result = await handleGetActivityMetrics(params.activityId);
        break;
      case 'getActivityAssessment':
        result = await handleGetActivityAssessment(params.studentId, params.activityId);
        break;
      case 'saveActivityAssessment':
        result = await handleSaveActivityAssessment(params.studentId, params.activityId, params.metrics);
        break;
      case 'getPersonalPlanTemplates':
        result = await handleGetPersonalPlanTemplates();
        break;
      case 'assignTasksToStudent':
        result = await handleAssignTasksToStudent(params.studentId, params.date, params.taskIds);
        break;
      default:
        result = { error: `Unknown action: ${action}` };
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Request failed";
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("[API] Error:", message);
    console.error("[API] Stack:", stack);
    console.error("[API] Full error:", err);
    
    // Provide more helpful error messages
    let errorMessage = message;
    if (message.includes('credentials')) {
      errorMessage = "Google Sheets API credentials not configured. Check environment variables.";
    } else if (message.includes('permission') || message.includes('access')) {
      errorMessage = "Permission denied. Make sure the Google Sheet is shared with the service account email.";
    } else if (message.includes('not found') || message.includes('404')) {
      errorMessage = "Google Sheet not found. Check GOOGLE_SHEETS_SPREADSHEET_ID.";
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? stack : undefined
      },
      { status: 500 }
    );
  }
}

// Initialize all sheets
async function initializeSheets() {
  await ensureSheet(SHEET_NAMES.USERS, ['id', 'username', 'password', 'role', 'displayName', 'status']);
  await ensureSheet(SHEET_NAMES.SKILLS, ['id', 'nameHe']);
  await ensureSheet(SHEET_NAMES.SKILL_METRICS, ['id', 'skillId', 'nameHe', 'descriptionHe']);
  await ensureSheet(SHEET_NAMES.STUDENT_SKILL_LEVELS, ['studentId', 'skillId', 'level', 'progressPercent']);
  await ensureSheet(SHEET_NAMES.SELF_ASSESSMENTS, ['studentId', 'skillId', 'date', 'metricId', 'value']);
  await ensureSheet(SHEET_NAMES.PERSONAL_PLAN_TEMPLATES, ['id', 'nameHe']);
  await ensureSheet(SHEET_NAMES.STUDENT_DAILY_TASKS, ['studentId', 'taskId', 'date', 'completed', 'timeLabel', 'priority']);
  await ensureSheet(SHEET_NAMES.ACTIVITIES, ['id', 'date', 'titleHe', 'descriptionHe', 'timeStart', 'timeEnd']);
  await ensureSheet(SHEET_NAMES.ACTIVITY_COMPLETIONS, ['activityId', 'studentId', 'completed']);
  await ensureSheet(SHEET_NAMES.ACTIVITY_METRICS, ['activityId', 'metricId', 'nameHe', 'descriptionHe']);
  await ensureSheet(SHEET_NAMES.ACTIVITY_ASSESSMENTS, ['activityId', 'studentId', 'metricId', 'value']);
  
  // Ensure admin user exists
  await ensureAdminUser();
  // Ensure demo skills exist
  await ensureDemoSkills();
}

async function ensureAdminUser() {
  const data = await readSheet(SHEET_NAMES.USERS);
  if (data.length < 2) {
    await appendRow(SHEET_NAMES.USERS, ['ADMIN-1', 'admin', 'admin123', 'admin', 'מנהל', 'active']);
  }
}

async function ensureDemoSkills() {
  const skillsData = await readSheet(SHEET_NAMES.SKILLS);
  if (skillsData.length < 2) {
    for (const skill of DEFAULT_DEMO_SKILLS) {
      await appendRow(SHEET_NAMES.SKILLS, [skill.id, skill.nameHe]);
    }
  }
  
  const metricsData = await readSheet(SHEET_NAMES.SKILL_METRICS);
  if (metricsData.length < 2) {
    for (const metric of DEFAULT_SKILL_METRICS) {
      await appendRow(SHEET_NAMES.SKILL_METRICS, [metric.metricId, metric.skillId, metric.nameHe, metric.descriptionHe]);
    }
  }
}

// Login handler
async function handleLogin(username: string, password: string) {
  if (!username || !password) {
    return { success: false, error: 'Missing credentials' };
  }
  
  const data = await readSheet(SHEET_NAMES.USERS);
  if (data.length < 2) {
    await ensureAdminUser();
    return await handleLogin(username, password);
  }
  
  const headers = data[0];
  const idIdx = headers.indexOf('id');
  const userIdx = headers.indexOf('username');
  const passIdx = headers.indexOf('password');
  const roleIdx = headers.indexOf('role');
  const displayIdx = headers.indexOf('displayName');
  const statusIdx = headers.indexOf('status');

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (
      String(row[userIdx]).toLowerCase() === String(username).toLowerCase() &&
      String(row[passIdx]) === String(password)
    ) {
      return {
        success: true,
        user: {
          id: String(row[idIdx]),
          username: String(row[userIdx]),
          displayName: String(displayIdx >= 0 ? row[displayIdx] : row[userIdx]),
          role: String(row[roleIdx] || 'student'),
          status: statusIdx >= 0 ? String(row[statusIdx]) : 'active',
        },
      };
    }
  }
  return { success: false, error: 'Invalid credentials' };
}

// Get students handler
async function handleGetStudents() {
  const data = await readSheet(SHEET_NAMES.USERS);
  if (data.length < 2) return { students: [] };
  
  const headers = data[0];
  const idIdx = headers.indexOf('id');
  const userIdx = headers.indexOf('username');
  const roleIdx = headers.indexOf('role');
  const displayIdx = headers.indexOf('displayName');
  const statusIdx = headers.indexOf('status');
  
  const students = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (String(row[roleIdx] || '') === 'student') {
      students.push({
        id: String(row[idIdx]),
        username: String(row[userIdx]),
        displayName: String(displayIdx >= 0 ? row[displayIdx] : row[userIdx]),
        role: 'student',
        status: statusIdx >= 0 ? String(row[statusIdx]) : 'active',
      });
    }
  }
  return { students };
}

// Add student handler
async function handleAddStudent(params: { username: string; password: string; displayName: string }) {
  const id = 'ST-' + Date.now();
  await appendRow(SHEET_NAMES.USERS, [
    id,
    params.username,
    params.password,
    'student',
    params.displayName || params.username,
    'active',
  ]);
  return { success: true, id };
}

// Update student password handler
async function handleUpdateStudentPassword(studentId: string, newPassword: string) {
  const data = await readSheet(SHEET_NAMES.USERS);
  const headers = data[0];
  const idIdx = headers.indexOf('id');
  const passIdx = headers.indexOf('password');
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIdx]) === String(studentId)) {
      await updateCell(SHEET_NAMES.USERS, i, passIdx, newPassword);
      return { success: true };
    }
  }
  return { success: false, error: 'Student not found' };
}

// Update student status handler
async function handleUpdateStudentStatus(studentId: string, status: string) {
  const data = await readSheet(SHEET_NAMES.USERS);
  const headers = data[0];
  const idIdx = headers.indexOf('id');
  const statusIdx = headers.indexOf('status');
  
  if (statusIdx < 0) return { success: false, error: 'No status column' };
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIdx]) === String(studentId)) {
      await updateCell(SHEET_NAMES.USERS, i, statusIdx, status);
      return { success: true };
    }
  }
  return { success: false, error: 'Student not found' };
}

// Get skills handler
async function handleGetSkills() {
  await ensureDemoSkills();
  const data = await readSheet(SHEET_NAMES.SKILLS);
  if (data.length < 2) return { skills: [] };
  
  const headers = data[0];
  const idIdx = headers.indexOf('id');
  const nameIdx = headers.indexOf('nameHe');
  
  const skills = [];
  for (let i = 1; i < data.length; i++) {
    skills.push({
      id: String(data[i][idIdx]),
      nameHe: String(data[i][nameIdx]),
    });
  }
  return { skills };
}

// Get student skills handler
async function handleGetStudentSkills(studentId: string) {
  const skillsData = await readSheet(SHEET_NAMES.SKILLS);
  const levelsData = await readSheet(SHEET_NAMES.STUDENT_SKILL_LEVELS);
  
  const skills = [];
  const headers = skillsData[0];
  const idIdx = headers.indexOf('id');
  const nameIdx = headers.indexOf('nameHe');
  
  const levelMap: Record<string, { level: number; progressPercent: number }> = {};
  if (levelsData.length >= 2) {
    const levelHeaders = levelsData[0];
    const sIdIdx = levelHeaders.indexOf('studentId');
    const skIdx = levelHeaders.indexOf('skillId');
    const lvlIdx = levelHeaders.indexOf('level');
    const pctIdx = levelHeaders.indexOf('progressPercent');
    
    for (let i = 1; i < levelsData.length; i++) {
      if (String(levelsData[i][sIdIdx]) === String(studentId)) {
        levelMap[String(levelsData[i][skIdx])] = {
          level: Number(levelsData[i][lvlIdx]) || 1,
          progressPercent: pctIdx >= 0 ? Number(levelsData[i][pctIdx]) : 50,
        };
      }
    }
  }
  
  for (let i = 1; i < skillsData.length; i++) {
    const sid = String(skillsData[i][idIdx]);
    const lev = levelMap[sid] || { level: 1, progressPercent: 0 };
    skills.push({
      id: sid,
      nameHe: String(skillsData[i][nameIdx]),
      level: lev.level,
      progressPercent: lev.progressPercent,
    });
  }
  return { skills };
}

// Get skill metrics handler
async function handleGetSkillMetrics(skillId: string) {
  const data = await readSheet(SHEET_NAMES.SKILL_METRICS);
  if (data.length < 2) return { metrics: [] };
  
  const headers = data[0];
  const idIdx = headers.indexOf('id');
  const skillIdx = headers.indexOf('skillId');
  const nameIdx = headers.indexOf('nameHe');
  const descIdx = headers.indexOf('descriptionHe');
  
  const metrics = [];
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][skillIdx]) === String(skillId)) {
      metrics.push({
        id: String(data[i][idIdx]),
        skillId: String(data[i][skillIdx]),
        nameHe: String(data[i][nameIdx]),
        descriptionHe: descIdx >= 0 ? String(data[i][descIdx]) : '',
      });
    }
  }
  return { metrics };
}

// Save self assessment handler
async function handleSaveSelfAssessment(studentId: string, skillId: string, metrics: any[]) {
  const date = new Date().toISOString().split('T')[0];
  for (const metric of metrics) {
    await appendRow(SHEET_NAMES.SELF_ASSESSMENTS, [
      studentId,
      skillId,
      date,
      metric.metricId,
      metric.value ? 'yes' : 'no',
    ]);
  }
  return { success: true };
}

// Get personal plan tasks handler
async function handleGetPersonalPlanTasks(studentId: string, date: string) {
  const tasksData = await readSheet(SHEET_NAMES.STUDENT_DAILY_TASKS);
  const templates = await handleGetPersonalPlanTemplates();
  
  const nameMap: Record<string, string> = {};
  templates.tasks.forEach((t: any) => {
    nameMap[t.id] = t.nameHe;
  });
  
  const headers = tasksData[0] || [];
  const sIdx = headers.indexOf('studentId');
  const tIdx = headers.indexOf('taskId');
  const dIdx = headers.indexOf('date');
  const cIdx = headers.indexOf('completed');
  const timeIdx = headers.indexOf('timeLabel');
  const priIdx = headers.indexOf('priority');
  
  const tasks = [];
  for (let i = 1; i < tasksData.length; i++) {
    const row = tasksData[i];
    if (String(row[sIdx]) === String(studentId) && String(row[dIdx]) === String(date)) {
      tasks.push({
        id: String(row[tIdx]),
        nameHe: nameMap[row[tIdx]] || String(row[tIdx]),
        completed: String(row[cIdx]).toLowerCase() === 'true' || row[cIdx] === true,
        timeLabel: timeIdx >= 0 ? String(row[timeIdx]) : undefined,
        priority: priIdx >= 0 ? String(row[priIdx]) : undefined,
      });
    }
  }
  
  // If no tasks, create default ones
  if (tasks.length === 0 && templates.tasks.length > 0) {
    for (const template of templates.tasks) {
      await appendRow(SHEET_NAMES.STUDENT_DAILY_TASKS, [
        studentId,
        template.id,
        date,
        false,
        '',
        'normal',
      ]);
    }
    return await handleGetPersonalPlanTasks(studentId, date);
  }
  
  return { tasks };
}

// Set task completed handler
async function handleSetTaskCompleted(studentId: string, taskId: string, date: string, completed: boolean) {
  const data = await readSheet(SHEET_NAMES.STUDENT_DAILY_TASKS);
  const headers = data[0] || [];
  const sIdx = headers.indexOf('studentId');
  const tIdx = headers.indexOf('taskId');
  const dIdx = headers.indexOf('date');
  const cIdx = headers.indexOf('completed');
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (
      String(row[sIdx]) === String(studentId) &&
      String(row[tIdx]) === String(taskId) &&
      String(row[dIdx]) === String(date)
    ) {
      await updateCell(SHEET_NAMES.STUDENT_DAILY_TASKS, i, cIdx, completed);
      return { success: true };
    }
  }
  
  // Task doesn't exist, create it
  await appendRow(SHEET_NAMES.STUDENT_DAILY_TASKS, [studentId, taskId, date, completed, '', 'normal']);
  return { success: true };
}

// Get activities for date handler
async function handleGetActivitiesForDate(studentId: string, date: string) {
  const activitiesData = await readSheet(SHEET_NAMES.ACTIVITIES);
  const completionsData = await readSheet(SHEET_NAMES.ACTIVITY_COMPLETIONS);
  
  const dateStr = String(date).slice(0, 10);
  const headers = activitiesData[0] || [];
  const idIdx = headers.indexOf('id');
  const dateIdx = headers.indexOf('date');
  const titleIdx = headers.indexOf('titleHe');
  const descIdx = headers.indexOf('descriptionHe');
  const startIdx = headers.indexOf('timeStart');
  const endIdx = headers.indexOf('timeEnd');
  
  const compMap: Record<string, boolean> = {};
  if (completionsData.length >= 2) {
    const compHeaders = completionsData[0];
    const aIdx = compHeaders.indexOf('activityId');
    const sIdx = compHeaders.indexOf('studentId');
    const cIdx = compHeaders.indexOf('completed');
    
    for (let i = 1; i < completionsData.length; i++) {
      if (String(completionsData[i][sIdx]) === String(studentId)) {
        compMap[String(completionsData[i][aIdx])] = 
          completionsData[i][cIdx] === true || String(completionsData[i][cIdx]).toLowerCase() === 'true';
      }
    }
  }
  
  const activities = [];
  for (let i = 1; i < activitiesData.length; i++) {
    const rowDate = toDateKey(activitiesData[i][dateIdx]);
    if (rowDate === dateStr) {
      const aid = String(activitiesData[i][idIdx]);
      activities.push({
        id: aid,
        date: rowDate,
        titleHe: String(activitiesData[i][titleIdx]),
        descriptionHe: descIdx >= 0 ? String(activitiesData[i][descIdx]) : '',
        timeStart: startIdx >= 0 ? String(activitiesData[i][startIdx]) : '',
        timeEnd: endIdx >= 0 ? String(activitiesData[i][endIdx]) : '',
        completed: compMap[aid] || false,
      });
    }
  }
  return { activities };
}

// Get activities for date range handler
async function handleGetActivitiesForDateRange(startDate: string, endDate: string) {
  const data = await readSheet(SHEET_NAMES.ACTIVITIES);
  if (data.length < 2) return { activities: [] };
  
  const headers = data[0];
  const idIdx = headers.indexOf('id');
  const dateIdx = headers.indexOf('date');
  const titleIdx = headers.indexOf('titleHe');
  const descIdx = headers.indexOf('descriptionHe');
  const startIdx = headers.indexOf('timeStart');
  const endIdx = headers.indexOf('timeEnd');
  
  const startKey = String(startDate).slice(0, 10);
  const endKey = String(endDate).slice(0, 10);
  
  const activities = [];
  for (let i = 1; i < data.length; i++) {
    const rowDateKey = toDateKey(data[i][dateIdx]);
    if (rowDateKey >= startKey && rowDateKey <= endKey) {
      activities.push({
        id: String(data[i][idIdx]),
        date: rowDateKey,
        titleHe: String(data[i][titleIdx]),
        descriptionHe: descIdx >= 0 ? String(data[i][descIdx]) : '',
        timeStart: startIdx >= 0 ? String(data[i][startIdx]) : '',
        timeEnd: endIdx >= 0 ? String(data[i][endIdx]) : '',
      });
    }
  }
  return { activities };
}

// Add activity handler
async function handleAddActivity(params: any) {
  if (!params.date || !params.titleHe) {
    return { success: false, error: 'Missing date or titleHe' };
  }
  const id = 'ACT-' + Date.now();
  await appendRow(SHEET_NAMES.ACTIVITIES, [
    id,
    String(params.date),
    String(params.titleHe),
    params.descriptionHe ? String(params.descriptionHe) : '',
    params.timeStart ? String(params.timeStart) : '',
    params.timeEnd ? String(params.timeEnd) : '',
  ]);
  
  // Create default metrics
  for (const metric of DEFAULT_SKILL_METRICS.slice(0, 3)) {
    await appendRow(SHEET_NAMES.ACTIVITY_METRICS, [id, metric.metricId, metric.nameHe, metric.descriptionHe]);
  }
  
  return { success: true, id };
}

// Update activity handler
async function handleUpdateActivity(activityId: string, params: any) {
  const data = await readSheet(SHEET_NAMES.ACTIVITIES);
  const headers = data[0];
  const idIdx = headers.indexOf('id');
  
  const cols: Record<string, number> = {
    date: headers.indexOf('date'),
    titleHe: headers.indexOf('titleHe'),
    descriptionHe: headers.indexOf('descriptionHe'),
    timeStart: headers.indexOf('timeStart'),
    timeEnd: headers.indexOf('timeEnd'),
  };
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIdx]) === String(activityId)) {
      for (const [key, colIdx] of Object.entries(cols)) {
        if (params[key] !== undefined && colIdx >= 0) {
          await updateCell(SHEET_NAMES.ACTIVITIES, i, colIdx, params[key]);
        }
      }
      return { success: true };
    }
  }
  return { success: false, error: 'Not found' };
}

// Delete activity handler
async function handleDeleteActivity(activityId: string) {
  const data = await readSheet(SHEET_NAMES.ACTIVITIES);
  const headers = data[0];
  const idIdx = headers.indexOf('id');
  
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][idIdx]) === String(activityId)) {
      await deleteRow(SHEET_NAMES.ACTIVITIES, i);
      return { success: true };
    }
  }
  return { success: false, error: 'Not found' };
}

// Set activity completed handler
async function handleSetActivityCompleted(studentId: string, activityId: string, completed: boolean) {
  const data = await readSheet(SHEET_NAMES.ACTIVITY_COMPLETIONS);
  const headers = data[0] || [];
  const aIdx = headers.indexOf('activityId');
  const sIdx = headers.indexOf('studentId');
  const cIdx = headers.indexOf('completed');
  
  for (let i = 1; i < data.length; i++) {
    if (
      String(data[i][aIdx]) === String(activityId) &&
      String(data[i][sIdx]) === String(studentId)
    ) {
      await updateCell(SHEET_NAMES.ACTIVITY_COMPLETIONS, i, cIdx, completed);
      return { success: true };
    }
  }
  
  // Doesn't exist, create it
  await appendRow(SHEET_NAMES.ACTIVITY_COMPLETIONS, [activityId, studentId, completed]);
  return { success: true };
}

// Get activity metrics handler
async function handleGetActivityMetrics(activityId: string) {
  const data = await readSheet(SHEET_NAMES.ACTIVITY_METRICS);
  if (data.length < 2) {
    // Create default metrics
    for (const metric of DEFAULT_SKILL_METRICS.slice(0, 3)) {
      await appendRow(SHEET_NAMES.ACTIVITY_METRICS, [activityId, metric.metricId, metric.nameHe, metric.descriptionHe]);
    }
    return await handleGetActivityMetrics(activityId);
  }
  
  const headers = data[0];
  const aIdx = headers.indexOf('activityId');
  const idIdx = headers.indexOf('metricId');
  const nameIdx = headers.indexOf('nameHe');
  const descIdx = headers.indexOf('descriptionHe');
  
  const metrics = [];
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][aIdx]) === String(activityId)) {
      metrics.push({
        id: String(data[i][idIdx]),
        activityId: String(data[i][aIdx]),
        nameHe: String(data[i][nameIdx]),
        descriptionHe: descIdx >= 0 ? String(data[i][descIdx]) : '',
      });
    }
  }
  return { metrics };
}

// Get activity assessment handler
async function handleGetActivityAssessment(studentId: string, activityId: string) {
  const data = await readSheet(SHEET_NAMES.ACTIVITY_ASSESSMENTS);
  if (data.length < 2) return { values: [] };
  
  const headers = data[0];
  const aIdx = headers.indexOf('activityId');
  const sIdx = headers.indexOf('studentId');
  const metricIdx = headers.indexOf('metricId');
  const vIdx = headers.indexOf('value');
  
  const values = [];
  for (let i = 1; i < data.length; i++) {
    if (
      String(data[i][aIdx]) === String(activityId) &&
      String(data[i][sIdx]) === String(studentId)
    ) {
      values.push({
        metricId: String(data[i][metricIdx]),
        value: data[i][vIdx] === true || String(data[i][vIdx]).toLowerCase() === 'yes',
      });
    }
  }
  return { values };
}

// Save activity assessment handler
async function handleSaveActivityAssessment(studentId: string, activityId: string, metrics: any[]) {
  const data = await readSheet(SHEET_NAMES.ACTIVITY_ASSESSMENTS);
  const headers = data[0] || [];
  const aIdx = headers.indexOf('activityId');
  const sIdx = headers.indexOf('studentId');
  const metricIdx = headers.indexOf('metricId');
  const vIdx = headers.indexOf('value');
  
  for (const metric of metrics) {
    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (
        String(data[i][aIdx]) === String(activityId) &&
        String(data[i][sIdx]) === String(studentId) &&
        String(data[i][metricIdx]) === String(metric.metricId)
      ) {
        await updateCell(SHEET_NAMES.ACTIVITY_ASSESSMENTS, i, vIdx, metric.value ? 'yes' : 'no');
        found = true;
        break;
      }
    }
    if (!found) {
      await appendRow(SHEET_NAMES.ACTIVITY_ASSESSMENTS, [
        activityId,
        studentId,
        metric.metricId,
        metric.value ? 'yes' : 'no',
      ]);
    }
  }
  return { success: true };
}

// Get personal plan templates handler
async function handleGetPersonalPlanTemplates() {
  const data = await readSheet(SHEET_NAMES.PERSONAL_PLAN_TEMPLATES);
  if (data.length < 2) {
    // Create default templates
    const defaults = [
      ['t1', 'נקה את השולחן'],
      ['t2', 'הצטרף לסדנאות'],
      ['t3', 'שים את המעיל במקום'],
      ['t4', 'תורנות צהריים'],
    ];
    for (const template of defaults) {
      await appendRow(SHEET_NAMES.PERSONAL_PLAN_TEMPLATES, template);
    }
    return await handleGetPersonalPlanTemplates();
  }
  
  const headers = data[0];
  const idIdx = headers.indexOf('id');
  const nameIdx = headers.indexOf('nameHe');
  
  const tasks = [];
  for (let i = 1; i < data.length; i++) {
    tasks.push({
      id: String(data[i][idIdx]),
      nameHe: String(data[i][nameIdx]),
    });
  }
  return { tasks };
}

// Assign tasks to student handler
async function handleAssignTasksToStudent(studentId: string, date: string, taskIds: string[]) {
  for (const taskId of taskIds) {
    await appendRow(SHEET_NAMES.STUDENT_DAILY_TASKS, [studentId, taskId, date, false, '', 'normal']);
  }
  return { success: true };
}

// Helper function to normalize dates
function toDateKey(val: any): string {
  if (val == null || val === '') return '';
  if (typeof val === 'string') return val.slice(0, 10);
  const d = val instanceof Date ? val : new Date(val);
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}-${m < 10 ? '0' : ''}${m}-${day < 10 ? '0' : ''}${day}`;
}
