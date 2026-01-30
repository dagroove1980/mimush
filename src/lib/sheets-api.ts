/**
 * Client for Google Apps Script Web App backend.
 * Uses Next.js API proxy (/api/sheets) to avoid CORS issues.
 * Set NEXT_PUBLIC_SHEETS_APP_URL in .env.local and Vercel.
 */

async function fetchApi<T>(
  action: string,
  _method: "GET" | "POST" = "POST",
  body?: Record<string, unknown>
): Promise<T> {
  // Use Next.js API proxy to avoid CORS issues
  // The proxy calls Google Apps Script server-side where CORS doesn't apply
  const url = "/api/sheets";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...body }),
  });
  
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = (data as { error?: string; details?: string })?.error || res.statusText;
    const details = (data as { details?: string })?.details;
    throw new Error(details ? `${err}: ${details}` : err);
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
