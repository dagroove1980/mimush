/**
 * Client for Google Apps Script Web App backend.
 * Calls Google Apps Script directly from client-side (browser) to avoid server-side blocking.
 * Set NEXT_PUBLIC_SHEETS_APP_URL in .env.local and Vercel.
 */

// Get URL - NEXT_PUBLIC_ vars are available in browser in Next.js
function getSheetsUrl(): string {
  // In Next.js, NEXT_PUBLIC_ variables are injected at build time and available in browser
  return process.env.NEXT_PUBLIC_SHEETS_APP_URL || "";
}

async function fetchApi<T>(
  action: string,
  _method: "GET" | "POST" = "POST",
  body?: Record<string, unknown>
): Promise<T> {
  const SHEETS_URL = getSheetsUrl();
  if (!SHEETS_URL) {
    throw new Error("NEXT_PUBLIC_SHEETS_APP_URL is not set. Please check your environment variables.");
  }
  
  // Call Google Apps Script directly from client-side (browser)
  // This works because browser requests aren't blocked like server-side requests
  const url = `${SHEETS_URL}?action=${encodeURIComponent(action)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...body }),
  });
  
  const text = await res.text();
  
  // Check if we got HTML instead of JSON (shouldn't happen from browser, but just in case)
  if (text.trim().toLowerCase().startsWith("<!doctype") || text.includes("<html")) {
    throw new Error("Web App returned HTML instead of JSON. Please check Web App deployment settings.");
  }
  
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
  }
  
  const errorData = data as { error?: string };
  if (!res.ok || errorData.error) {
    throw new Error(errorData.error || res.statusText);
  }
  
  return data as T;
}

// Auth
export async function login(username: string, password: string) {
  return fetchApi<{ success: boolean; user?: import("./types").User; error?: string }>(
    "login",
    "POST",
    { username, password }
  );
}

// Students (admin)
export async function getStudents() {
  return fetchApi<{ students: import("./types").User[] }>("getStudents");
}

export async function addStudent(data: {
  username: string;
  password: string;
  displayName: string;
}) {
  return fetchApi<{ success: boolean; id?: string; error?: string }>("addStudent", "POST", data);
}

export async function updateStudentPassword(studentId: string, newPassword: string) {
  return fetchApi<{ success: boolean; error?: string }>("updateStudentPassword", "POST", {
    studentId,
    newPassword,
  });
}

export async function updateStudentStatus(studentId: string, status: string) {
  return fetchApi<{ success: boolean; error?: string }>("updateStudentStatus", "POST", {
    studentId,
    status,
  });
}

// Skills
export async function getSkills() {
  return fetchApi<{ skills: import("./types").Skill[] }>("getSkills");
}

export async function getStudentSkills(studentId: string) {
  return fetchApi<{ skills: import("./types").Skill[] }>("getStudentSkills", "POST", {
    studentId,
  });
}

export async function getSkillMetrics(skillId: string) {
  return fetchApi<{ metrics: import("./types").SkillMetric[] }>("getSkillMetrics", "POST", {
    skillId,
  });
}

export async function saveSelfAssessment(
  studentId: string,
  skillId: string,
  metrics: import("./types").SelfAssessmentRecord[]
) {
  return fetchApi<{ success: boolean; error?: string }>("saveSelfAssessment", "POST", {
    studentId,
    skillId,
    metrics,
  });
}

// Personal plan tasks
export async function getPersonalPlanTasks(studentId: string, date: string) {
  return fetchApi<{ tasks: import("./types").PersonalPlanTask[] }>("getPersonalPlanTasks", "POST", {
    studentId,
    date,
  });
}

export async function setTaskCompleted(
  studentId: string,
  taskId: string,
  date: string,
  completed: boolean
) {
  return fetchApi<{ success: boolean; error?: string }>("setTaskCompleted", "POST", {
    studentId,
    taskId,
    date,
    completed,
  });
}

// Activities (admin calendar → student dashboard)
export async function getActivitiesForDate(studentId: string, date: string) {
  return fetchApi<{ activities: import("./types").Activity[] }>("getActivitiesForDate", "POST", {
    studentId,
    date,
  });
}

export async function getActivitiesForDateRange(
  startDate: string,
  endDate: string
) {
  return fetchApi<{ activities: import("./types").Activity[] }>("getActivitiesForDateRange", "POST", {
    startDate,
    endDate,
  });
}

export async function addActivity(data: {
  date: string;
  titleHe: string;
  descriptionHe?: string;
  timeStart?: string;
  timeEnd?: string;
  studentIds?: string[]; // empty = all
}) {
  return fetchApi<{ success: boolean; id?: string; error?: string }>("addActivity", "POST", data);
}

export async function updateActivity(
  activityId: string,
  data: Partial<{
    date: string;
    titleHe: string;
    descriptionHe: string;
    timeStart: string;
    timeEnd: string;
  }>
) {
  return fetchApi<{ success: boolean; error?: string }>("updateActivity", "POST", {
    activityId,
    ...data,
  });
}

export async function deleteActivity(activityId: string) {
  return fetchApi<{ success: boolean; error?: string }>("deleteActivity", "POST", {
    activityId,
  });
}

export async function setActivityCompleted(
  studentId: string,
  activityId: string,
  completed: boolean
) {
  return fetchApi<{ success: boolean; error?: string }>("setActivityCompleted", "POST", {
    studentId,
    activityId,
    completed,
  });
}

export async function getActivityMetrics(activityId: string) {
  return fetchApi<{ metrics: import("./types").ActivityMetric[] }>("getActivityMetrics", "POST", {
    activityId,
  });
}

export async function getActivityAssessment(studentId: string, activityId: string) {
  return fetchApi<{ values: import("./types").ActivityAssessmentRecord[] }>("getActivityAssessment", "POST", {
    studentId,
    activityId,
  });
}

export async function saveActivityAssessment(
  studentId: string,
  activityId: string,
  metrics: import("./types").ActivityAssessmentRecord[]
) {
  return fetchApi<{ success: boolean; error?: string }>("saveActivityAssessment", "POST", {
    studentId,
    activityId,
    metrics,
  });
}

// Personal plan templates (admin manages; students get their daily list)
export async function getPersonalPlanTemplates() {
  return fetchApi<{ tasks: { id: string; nameHe: string }[] }>("getPersonalPlanTemplates");
}

export async function assignTasksToStudent(studentId: string, date: string, taskIds: string[]) {
  return fetchApi<{ success: boolean; error?: string }>("assignTasksToStudent", "POST", {
    studentId,
    date,
    taskIds,
  });
}
