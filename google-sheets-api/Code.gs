/**
 * Merkaz Miyum - Google Sheets API Backend
 * Deploy as Web App: Execute as me, Who has access: Anyone.
 * Use doGet with ?action=... and POST body for actions that need data.
 */

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

var DEFAULT_DEMO_METRICS = [
  { id: 'teamwork', nameHe: 'עבודת צוות', descriptionHe: 'הקשבתי לאחרים ועזרתי לקבוצה?' },
  { id: 'quality', nameHe: 'איכות עבודה', descriptionHe: 'השקעתי באיכות והשלמתי כמו שצריך?' },
  { id: 'responsibility', nameHe: 'אחריות', descriptionHe: 'הייתי אחראי וסידרתי בסיום?' },
];

var DEFAULT_DEMO_SKILLS = [
  { id: 'cooking', nameHe: 'בישול' },
  { id: 'computer', nameHe: 'מחשב' },
  { id: 'drawing', nameHe: 'ציור' },
  { id: 'social', nameHe: 'כישורים חברתיים' },
  { id: 'cleaning', nameHe: 'ניקיון וארגון' },
  { id: 'fitness', nameHe: 'פעילות גופנית' },
];

var DEFAULT_SKILL_METRICS = [
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

function getSpreadsheet() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet(name) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    initSheet(name, sheet);
  }
  return sheet;
}

function ensureAdminUser() {
  const sheet = getSheet(SHEET_NAMES.USERS);
  const data = sheet.getDataRange().getValues();
  if (data.length >= 2) return;
  sheet.appendRow(['ADMIN-1', 'admin', 'admin123', 'admin', 'מנהל', 'active']);
}

function initSheet(name, sheet) {
  const headers = {
    Users: ['id', 'username', 'password', 'role', 'displayName', 'status'],
    Skills: ['id', 'nameHe'],
    SkillMetrics: ['id', 'skillId', 'nameHe', 'descriptionHe'],
    StudentSkillLevels: ['studentId', 'skillId', 'level', 'progressPercent'],
    SelfAssessments: ['studentId', 'skillId', 'date', 'metricId', 'value'],
    PersonalPlanTemplates: ['id', 'nameHe'],
    StudentDailyTasks: ['studentId', 'taskId', 'date', 'completed', 'timeLabel', 'priority'],
    Activities: ['id', 'date', 'titleHe', 'descriptionHe', 'timeStart', 'timeEnd'],
    ActivityCompletions: ['activityId', 'studentId', 'completed'],
    ActivityMetrics: ['activityId', 'metricId', 'nameHe', 'descriptionHe'],
    ActivityAssessments: ['activityId', 'studentId', 'metricId', 'value'],
  };
  if (headers[name]) {
    sheet.getRange(1, 1, 1, headers[name].length).setValues([headers[name]]);
    sheet.getRange(1, 1, 1, headers[name].length).setFontWeight('bold');
  }
}

function doGet(e) {
  return handleRequest(e, e.parameter);
}

function doPost(e) {
  let params = e.parameter || {};
  try {
    if (e.postData && e.postData.contents) {
      const body = JSON.parse(e.postData.contents);
      params = Object.assign({}, params, body);
    }
  } catch (err) {}
  return handleRequest(e, params);
}

function handleRequest(e, params) {
  const action = params.action;
  let result = { error: 'Unknown action' };
  try {
    ensureAdminUser();
    ensureDemoSkills();
    if (action === 'login') {
      result = apiLogin(params.username, params.password);
    } else if (action === 'getStudents') {
      result = apiGetStudents();
    } else if (action === 'addStudent') {
      result = apiAddStudent(params);
    } else if (action === 'updateStudentPassword') {
      result = apiUpdateStudentPassword(params.studentId, params.newPassword);
    } else if (action === 'updateStudentStatus') {
      result = apiUpdateStudentStatus(params.studentId, params.status);
    } else if (action === 'getSkills') {
      result = apiGetSkills();
    } else if (action === 'getStudentSkills') {
      result = apiGetStudentSkills(params.studentId);
    } else if (action === 'getSkillMetrics') {
      result = apiGetSkillMetrics(params.skillId);
    } else if (action === 'saveSelfAssessment') {
      result = apiSaveSelfAssessment(params.studentId, params.skillId, params.metrics);
    } else if (action === 'getPersonalPlanTasks') {
      result = apiGetPersonalPlanTasks(params.studentId, params.date);
    } else if (action === 'setTaskCompleted') {
      result = apiSetTaskCompleted(params.studentId, params.taskId, params.date, params.completed);
    } else if (action === 'getActivitiesForDate') {
      result = apiGetActivitiesForDate(params.studentId, params.date);
    } else if (action === 'getActivitiesForDateRange') {
      result = apiGetActivitiesForDateRange(params.startDate, params.endDate);
    } else if (action === 'addActivity') {
      result = apiAddActivity(params);
    } else if (action === 'updateActivity') {
      result = apiUpdateActivity(params.activityId, params);
    } else if (action === 'deleteActivity') {
      result = apiDeleteActivity(params.activityId);
    } else if (action === 'setActivityCompleted') {
      result = apiSetActivityCompleted(params.studentId, params.activityId, params.completed);
    } else if (action === 'getActivityMetrics') {
      result = apiGetActivityMetrics(params.activityId);
    } else if (action === 'getActivityAssessment') {
      result = apiGetActivityAssessment(params.studentId, params.activityId);
    } else if (action === 'saveActivityAssessment') {
      result = apiSaveActivityAssessment(params.studentId, params.activityId, params.metrics);
    } else if (action === 'getPersonalPlanTemplates') {
      result = apiGetPersonalPlanTemplates();
    } else if (action === 'assignTasksToStudent') {
      result = apiAssignTasksToStudent(params.studentId, params.date, params.taskIds);
    }
  } catch (err) {
    result = { error: err.toString() };
  }
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// --- Users & Auth ---
function apiLogin(username, password) {
  if (!username || !password) return { success: false, error: 'Missing credentials' };
  const sheet = getSheet(SHEET_NAMES.USERS);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return { success: false, error: 'Invalid credentials' };
  const headers = data[0];
  const idIdx = headers.indexOf('id');
  const userIdx = headers.indexOf('username');
  const passIdx = headers.indexOf('password');
  const roleIdx = headers.indexOf('role');
  const displayIdx = headers.indexOf('displayName');
  const statusIdx = headers.indexOf('status');
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (String(row[userIdx]).toLowerCase() === String(username).toLowerCase() && String(row[passIdx]) === String(password)) {
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

function apiGetStudents() {
  const sheet = getSheet(SHEET_NAMES.USERS);
  const data = sheet.getDataRange().getValues();
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

function apiAddStudent(params) {
  const sheet = getSheet(SHEET_NAMES.USERS);
  const id = 'ST-' + Date.now();
  const row = [
    id,
    params.username,
    params.password,
    'student',
    params.displayName || params.username,
    'active',
  ];
  sheet.appendRow(row);
  return { success: true, id };
}

function apiUpdateStudentPassword(studentId, newPassword) {
  const sheet = getSheet(SHEET_NAMES.USERS);
  const data = sheet.getDataRange().getValues();
  const idIdx = data[0].indexOf('id');
  const passIdx = data[0].indexOf('password');
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIdx]) === String(studentId)) {
      sheet.getRange(i + 1, passIdx + 1).setValue(newPassword);
      return { success: true };
    }
  }
  return { success: false, error: 'Student not found' };
}

function apiUpdateStudentStatus(studentId, status) {
  const sheet = getSheet(SHEET_NAMES.USERS);
  const data = sheet.getDataRange().getValues();
  const idIdx = data[0].indexOf('id');
  const statusIdx = data[0].indexOf('status');
  if (statusIdx < 0) return { success: false, error: 'No status column' };
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIdx]) === String(studentId)) {
      sheet.getRange(i + 1, statusIdx + 1).setValue(status);
      return { success: true };
    }
  }
  return { success: false, error: 'Student not found' };
}

// --- Skills (common demo skills for all students) ---
function ensureDemoSkills() {
  const sheet = getSheet(SHEET_NAMES.SKILLS);
  const data = sheet.getDataRange().getValues();
  if (data.length >= 2) return;
  for (var i = 0; i < DEFAULT_DEMO_SKILLS.length; i++) {
    var s = DEFAULT_DEMO_SKILLS[i];
    sheet.appendRow([s.id, s.nameHe]);
  }
  const metricsSheet = getSheet(SHEET_NAMES.SKILL_METRICS);
  const metricsData = metricsSheet.getDataRange().getValues();
  if (metricsData.length >= 2) return;
  for (var j = 0; j < DEFAULT_SKILL_METRICS.length; j++) {
    var m = DEFAULT_SKILL_METRICS[j];
    metricsSheet.appendRow([m.metricId, m.skillId, m.nameHe, m.descriptionHe]);
  }
}

function apiGetSkills() {
  ensureDemoSkills();
  const sheet = getSheet(SHEET_NAMES.SKILLS);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return { skills: [] };
  const headers = data[0];
  const idIdx = headers.indexOf('id');
  const nameIdx = headers.indexOf('nameHe');
  const skills = [];
  for (let i = 1; i < data.length; i++) {
    skills.push({ id: String(data[i][idIdx]), nameHe: String(data[i][nameIdx]) });
  }
  return { skills };
}

function apiGetStudentSkills(studentId) {
  const skillsSheet = getSheet(SHEET_NAMES.SKILLS);
  const levelsSheet = getSheet(SHEET_NAMES.STUDENT_SKILL_LEVELS);
  const skillData = skillsSheet.getDataRange().getValues();
  const levelData = levelsSheet.getLastRow() >= 2 ? levelsSheet.getDataRange().getValues() : [];
  const skills = [];
  const idIdx = skillData[0].indexOf('id');
  const nameIdx = skillData[0].indexOf('nameHe');
  const levelMap = {};
  if (levelData.length >= 2) {
    const sIdIdx = levelData[0].indexOf('studentId');
    const skIdx = levelData[0].indexOf('skillId');
    const lvlIdx = levelData[0].indexOf('level');
    const pctIdx = levelData[0].indexOf('progressPercent');
    for (let i = 1; i < levelData.length; i++) {
      if (String(levelData[i][sIdIdx]) === String(studentId)) {
        levelMap[String(levelData[i][skIdx])] = {
          level: Number(levelData[i][lvlIdx]) || 1,
          progressPercent: pctIdx >= 0 ? Number(levelData[i][pctIdx]) : 50,
        };
      }
    }
  }
  for (let i = 1; i < skillData.length; i++) {
    const sid = String(skillData[i][idIdx]);
    const lev = levelMap[sid] || { level: 1, progressPercent: 0 };
    skills.push({
      id: sid,
      nameHe: String(skillData[i][nameIdx]),
      level: lev.level,
      progressPercent: lev.progressPercent,
    });
  }
  return { skills };
}

function apiGetSkillMetrics(skillId) {
  const sheet = getSheet(SHEET_NAMES.SKILL_METRICS);
  const data = sheet.getDataRange().getValues();
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

function apiSaveSelfAssessment(studentId, skillId, metrics) {
  const sheet = getSheet(SHEET_NAMES.SELF_ASSESSMENTS);
  const date = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  for (let i = 0; i < metrics.length; i++) {
    const m = metrics[i];
    sheet.appendRow([studentId, skillId, date, m.metricId, m.value ? 'yes' : 'no']);
  }
  return { success: true };
}

// --- Personal Plan ---
function apiGetPersonalPlanTemplates() {
  const sheet = getSheet(SHEET_NAMES.PERSONAL_PLAN_TEMPLATES);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) {
    [['t1', 'נקה את השולחן'], ['t2', 'הצטרף לסדנאות'], ['t3', 'שים את המעיל במקום'], ['t4', 'תורנות צהריים']].forEach(function (r) { sheet.appendRow(r); });
    return apiGetPersonalPlanTemplates();
  }
  const idIdx = data[0].indexOf('id');
  const nameIdx = data[0].indexOf('nameHe');
  const tasks = [];
  for (let i = 1; i < data.length; i++) {
    tasks.push({ id: String(data[i][idIdx]), nameHe: String(data[i][nameIdx]) });
  }
  return { tasks };
}

function apiGetPersonalPlanTasks(studentId, date) {
  const sheet = getSheet(SHEET_NAMES.STUDENT_DAILY_TASKS);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return { tasks: [] };
  const headers = data[0];
  const sIdx = headers.indexOf('studentId');
  const tIdx = headers.indexOf('taskId');
  const dIdx = headers.indexOf('date');
  const cIdx = headers.indexOf('completed');
  const timeIdx = headers.indexOf('timeLabel');
  const priIdx = headers.indexOf('priority');
  const templates = apiGetPersonalPlanTemplates().tasks;
  const nameMap = {};
  templates.forEach(function (t) { nameMap[t.id] = t.nameHe; });
  const tasks = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
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
  if (tasks.length === 0 && templates.length > 0) {
    templates.forEach(function (t) {
      sheet.appendRow([studentId, t.id, date, false, '', 'normal']);
    });
    return apiGetPersonalPlanTasks(studentId, date);
  }
  return { tasks };
}

function apiSetTaskCompleted(studentId, taskId, date, completed) {
  const sheet = getSheet(SHEET_NAMES.STUDENT_DAILY_TASKS);
  const data = sheet.getDataRange().getValues();
  const sIdx = data[0].indexOf('studentId');
  const tIdx = data[0].indexOf('taskId');
  const dIdx = data[0].indexOf('date');
  const cIdx = data[0].indexOf('completed');
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][sIdx]) === String(studentId) && String(data[i][tIdx]) === String(taskId) && String(data[i][dIdx]) === String(date)) {
      sheet.getRange(i + 1, cIdx + 1).setValue(completed);
      return { success: true };
    }
  }
  sheet.appendRow([studentId, taskId, date, completed, '', 'normal']);
  return { success: true };
}

function apiAssignTasksToStudent(studentId, date, taskIds) {
  const sheet = getSheet(SHEET_NAMES.STUDENT_DAILY_TASKS);
  taskIds.forEach(function (taskId) {
    sheet.appendRow([studentId, taskId, date, false, '', 'normal']);
  });
  return { success: true };
}

// --- Activities ---
// Normalize sheet date (Date object, string, or number) to YYYY-MM-DD for comparison.
// Google Sheets returns date cells as Date objects; String(date) !== "2026-01-30".
function toDateKey(val) {
  if (val == null || val === '') return '';
  if (typeof val === 'string') return val.slice(0, 10);
  var d = val instanceof Date ? val : new Date(val);
  if (isNaN(d.getTime())) return '';
  var y = d.getFullYear();
  var m = d.getMonth() + 1;
  var day = d.getDate();
  return y + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
}

function apiGetActivitiesForDate(studentId, date) {
  const sheet = getSheet(SHEET_NAMES.ACTIVITIES);
  const compSheet = getSheet(SHEET_NAMES.ACTIVITY_COMPLETIONS);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return { activities: [] };
  const headers = data[0];
  const idIdx = headers.indexOf('id');
  const dateIdx = headers.indexOf('date');
  const titleIdx = headers.indexOf('titleHe');
  const descIdx = headers.indexOf('descriptionHe');
  const startIdx = headers.indexOf('timeStart');
  const endIdx = headers.indexOf('timeEnd');
  const compData = compSheet.getLastRow() >= 2 ? compSheet.getDataRange().getValues() : [];
  const compMap = {};
  if (compData.length >= 2) {
    const aIdx = compData[0].indexOf('activityId');
    const sIdx = compData[0].indexOf('studentId');
    const cIdx = compData[0].indexOf('completed');
    for (let i = 1; i < compData.length; i++) {
      if (String(compData[i][sIdx]) === String(studentId)) {
        compMap[String(compData[i][aIdx])] = compData[i][cIdx] === true || String(compData[i][cIdx]).toLowerCase() === 'true';
      }
    }
  }
  const dateStr = String(date).slice(0, 10);
  const activities = [];
  for (let i = 1; i < data.length; i++) {
    const rowDateKey = toDateKey(data[i][dateIdx]);
    if (rowDateKey === dateStr) {
      const aid = String(data[i][idIdx]);
      activities.push({
        id: aid,
        date: rowDateKey,
        titleHe: String(data[i][titleIdx]),
        descriptionHe: descIdx >= 0 ? String(data[i][descIdx]) : '',
        timeStart: startIdx >= 0 ? String(data[i][startIdx]) : '',
        timeEnd: endIdx >= 0 ? String(data[i][endIdx]) : '',
        completed: compMap[aid] || false,
      });
    }
  }
  return { activities };
}

function apiGetActivitiesForDateRange(startDate, endDate) {
  const sheet = getSheet(SHEET_NAMES.ACTIVITIES);
  const data = sheet.getDataRange().getValues();
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

function apiAddActivity(params) {
  if (!params || !params.date || !params.titleHe) {
    return { success: false, error: 'Missing date or titleHe' };
  }
  const sheet = getSheet(SHEET_NAMES.ACTIVITIES);
  const id = 'ACT-' + Date.now();
  sheet.appendRow([
    id,
    String(params.date),
    String(params.titleHe),
    params.descriptionHe ? String(params.descriptionHe) : '',
    params.timeStart ? String(params.timeStart) : '',
    params.timeEnd ? String(params.timeEnd) : '',
  ]);
  createDemoMetricsForActivity(id);
  SpreadsheetApp.flush();
  return { success: true, id: id };
}

function createDemoMetricsForActivity(activityId) {
  const sheet = getSheet(SHEET_NAMES.ACTIVITY_METRICS);
  for (var i = 0; i < DEFAULT_DEMO_METRICS.length; i++) {
    var m = DEFAULT_DEMO_METRICS[i];
    sheet.appendRow([activityId, m.id, m.nameHe, m.descriptionHe]);
  }
}

function apiGetActivityMetrics(activityId) {
  const sheet = getSheet(SHEET_NAMES.ACTIVITY_METRICS);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return { metrics: [] };
  const headers = data[0];
  const aIdx = headers.indexOf('activityId');
  const idIdx = headers.indexOf('metricId');
  const nameIdx = headers.indexOf('nameHe');
  const descIdx = headers.indexOf('descriptionHe');
  const metrics = [];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][aIdx]) === String(activityId)) {
      metrics.push({
        id: String(data[i][idIdx]),
        activityId: String(data[i][aIdx]),
        nameHe: String(data[i][nameIdx]),
        descriptionHe: descIdx >= 0 ? String(data[i][descIdx]) : '',
      });
    }
  }
  if (metrics.length === 0 && DEFAULT_DEMO_METRICS.length > 0) {
    createDemoMetricsForActivity(activityId);
    return apiGetActivityMetrics(activityId);
  }
  return { metrics: metrics };
}

function apiGetActivityAssessment(studentId, activityId) {
  const sheet = getSheet(SHEET_NAMES.ACTIVITY_ASSESSMENTS);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return { values: [] };
  const headers = data[0];
  const aIdx = headers.indexOf('activityId');
  const sIdx = headers.indexOf('studentId');
  const metricIdx = headers.indexOf('metricId');
  const vIdx = headers.indexOf('value');
  const values = [];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][aIdx]) === String(activityId) && String(data[i][sIdx]) === String(studentId)) {
      values.push({
        metricId: String(data[i][metricIdx]),
        value: data[i][vIdx] === true || String(data[i][vIdx]).toLowerCase() === 'yes',
      });
    }
  }
  return { values: values };
}

function apiSaveActivityAssessment(studentId, activityId, metrics) {
  const sheet = getSheet(SHEET_NAMES.ACTIVITY_ASSESSMENTS);
  const data = sheet.getDataRange().getValues();
  const aIdx = data[0].indexOf('activityId');
  const sIdx = data[0].indexOf('studentId');
  const metricIdx = data[0].indexOf('metricId');
  const vIdx = data[0].indexOf('value');
  for (var i = 0; i < metrics.length; i++) {
    var m = metrics[i];
    var found = false;
    for (var r = 1; r < data.length; r++) {
      if (String(data[r][aIdx]) === String(activityId) && String(data[r][sIdx]) === String(studentId) && String(data[r][metricIdx]) === String(m.metricId)) {
        sheet.getRange(r + 1, vIdx + 1).setValue(m.value ? 'yes' : 'no');
        found = true;
        break;
      }
    }
    if (!found) {
      sheet.appendRow([activityId, studentId, m.metricId, m.value ? 'yes' : 'no']);
    }
  }
  return { success: true };
}

function apiUpdateActivity(activityId, params) {
  const sheet = getSheet(SHEET_NAMES.ACTIVITIES);
  const data = sheet.getDataRange().getValues();
  const idIdx = data[0].indexOf('id');
  const cols = { date: 'date', titleHe: 'titleHe', descriptionHe: 'descriptionHe', timeStart: 'timeStart', timeEnd: 'timeEnd' };
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIdx]) === String(activityId)) {
      Object.keys(cols).forEach(function (key) {
        if (params[key] !== undefined) {
          const colIdx = data[0].indexOf(key);
          if (colIdx >= 0) sheet.getRange(i + 1, colIdx + 1).setValue(params[key]);
        }
      });
      return { success: true };
    }
  }
  return { success: false, error: 'Not found' };
}

function apiDeleteActivity(activityId) {
  const sheet = getSheet(SHEET_NAMES.ACTIVITIES);
  const data = sheet.getDataRange().getValues();
  const idIdx = data[0].indexOf('id');
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][idIdx]) === String(activityId)) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: 'Not found' };
}

function apiSetActivityCompleted(studentId, activityId, completed) {
  const sheet = getSheet(SHEET_NAMES.ACTIVITY_COMPLETIONS);
  const data = sheet.getDataRange().getValues();
  const aIdx = data[0].indexOf('activityId');
  const sIdx = data[0].indexOf('studentId');
  const cIdx = data[0].indexOf('completed');
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][aIdx]) === String(activityId) && String(data[i][sIdx]) === String(studentId)) {
      sheet.getRange(i + 1, cIdx + 1).setValue(completed);
      return { success: true };
    }
  }
  sheet.appendRow([activityId, studentId, completed]);
  return { success: true };
}

// Test function to verify spreadsheet connection
function testConnection() {
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName('Users');
    if (!sheet) {
      Logger.log('Users sheet does not exist - will be created');
      return { success: true, message: 'Spreadsheet accessible, Users sheet will be created on first use' };
    }
    const data = sheet.getDataRange().getValues();
    Logger.log('Success! Found ' + data.length + ' rows in Users sheet');
    return { success: true, message: 'Spreadsheet accessible', rows: data.length };
  } catch (err) {
    Logger.log('Error: ' + err.toString());
    return { success: false, error: err.toString() };
  }
}
