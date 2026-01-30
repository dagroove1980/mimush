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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    if (!action) {
      return NextResponse.json({ error: "Missing action" }, { status: 400 });
    }

    let result: any = { error: 'Unknown action' };

    // Initialize sheets if needed
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
      // Add more actions as needed
      default:
        result = { error: `Action ${action} not implemented yet` };
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Request failed";
    console.error("[API] Error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// Login handler
async function handleLogin(username: string, password: string) {
  const data = await readSheet(SHEET_NAMES.USERS);
  if (data.length < 2) {
    // Create default admin if no users exist
    await appendRow(SHEET_NAMES.USERS, ['ADMIN-1', 'admin', 'admin123', 'admin', 'מנהל', 'active']);
    const newData = await readSheet(SHEET_NAMES.USERS);
    return checkLogin(newData, username, password);
  }
  return checkLogin(data, username, password);
}

function checkLogin(data: any[][], username: string, password: string) {
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
