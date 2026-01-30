export type Role = "student" | "admin";

export interface User {
  id: string;
  username: string;
  displayName: string;
  role: Role;
  status?: string; // active, on_leave, needs_review, inactive
}

export interface Student extends User {
  role: "student";
  studentId: string;
}

export interface Skill {
  id: string;
  nameHe: string;
  level?: number;
  progressPercent?: number;
}

export interface SkillMetric {
  id: string;
  skillId: string;
  nameHe: string;
  descriptionHe: string;
}

export interface SelfAssessmentRecord {
  skillId: string;
  metricId: string;
  value: boolean; // yes/no
}

export interface PersonalPlanTask {
  id: string;
  nameHe: string;
  completed: boolean;
  timeLabel?: string; // e.g. "Morning • 8:00"
  priority?: "high" | "normal";
}

export interface Activity {
  id: string;
  date: string; // YYYY-MM-DD
  titleHe: string;
  descriptionHe?: string;
  timeStart?: string;
  timeEnd?: string;
  completed?: boolean;
}

export interface ActivityMetric {
  id: string;
  activityId: string;
  nameHe: string;
  descriptionHe: string;
}

export interface ActivityAssessmentRecord {
  metricId: string;
  value: boolean;
}
