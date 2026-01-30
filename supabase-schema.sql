-- Merkaz Miyum Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'student')),
  display_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  name_he TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skill Metrics table
CREATE TABLE IF NOT EXISTS skill_metrics (
  id TEXT PRIMARY KEY,
  skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  name_he TEXT NOT NULL,
  description_he TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student Skill Levels table
CREATE TABLE IF NOT EXISTS student_skill_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1,
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, skill_id)
);

-- Self Assessments table
CREATE TABLE IF NOT EXISTS self_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  metric_id TEXT NOT NULL,
  value TEXT NOT NULL CHECK (value IN ('yes', 'no')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personal Plan Templates table
CREATE TABLE IF NOT EXISTS personal_plan_templates (
  id TEXT PRIMARY KEY,
  name_he TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student Daily Tasks table
CREATE TABLE IF NOT EXISTS student_daily_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL REFERENCES personal_plan_templates(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  time_label TEXT,
  priority TEXT DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, task_id, date)
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  title_he TEXT NOT NULL,
  description_he TEXT,
  time_start TEXT,
  time_end TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Completions table
CREATE TABLE IF NOT EXISTS activity_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id TEXT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(activity_id, student_id)
);

-- Activity Metrics table
CREATE TABLE IF NOT EXISTS activity_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id TEXT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  metric_id TEXT NOT NULL,
  name_he TEXT NOT NULL,
  description_he TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Assessments table
CREATE TABLE IF NOT EXISTS activity_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id TEXT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  metric_id TEXT NOT NULL,
  value TEXT NOT NULL CHECK (value IN ('yes', 'no')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(activity_id, student_id, metric_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_skill_metrics_skill_id ON skill_metrics(skill_id);
CREATE INDEX IF NOT EXISTS idx_student_skill_levels_student ON student_skill_levels(student_id);
CREATE INDEX IF NOT EXISTS idx_student_skill_levels_skill ON student_skill_levels(skill_id);
CREATE INDEX IF NOT EXISTS idx_self_assessments_student ON self_assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_self_assessments_skill ON self_assessments(skill_id);
CREATE INDEX IF NOT EXISTS idx_self_assessments_date ON self_assessments(date);
CREATE INDEX IF NOT EXISTS idx_student_daily_tasks_student ON student_daily_tasks(student_id);
CREATE INDEX IF NOT EXISTS idx_student_daily_tasks_date ON student_daily_tasks(date);
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date);
CREATE INDEX IF NOT EXISTS idx_activity_completions_activity ON activity_completions(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_completions_student ON activity_completions(student_id);
CREATE INDEX IF NOT EXISTS idx_activity_metrics_activity ON activity_metrics(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_assessments_activity ON activity_assessments(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_assessments_student ON activity_assessments(student_id);

-- Insert default admin user
INSERT INTO users (id, username, password, role, display_name, status)
VALUES ('ADMIN-1', 'admin', 'admin123', 'admin', 'מנהל', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert default skills (same as in Apps Script)
INSERT INTO skills (id, name_he) VALUES
  ('cooking', 'בישול'),
  ('computer', 'מחשב'),
  ('drawing', 'ציור'),
  ('social', 'כישורים חברתיים'),
  ('cleaning', 'ניקיון וארגון'),
  ('fitness', 'פעילות גופנית')
ON CONFLICT (id) DO NOTHING;

-- Insert default skill metrics
INSERT INTO skill_metrics (id, skill_id, name_he, description_he) VALUES
  ('teamwork', 'cooking', 'עבודת צוות', 'הקשבתי לאחרים ועזרתי לקבוצה?'),
  ('quality', 'cooking', 'איכות עבודה', 'עקבתי אחר המתכון בקפידה?'),
  ('responsibility', 'cooking', 'אחריות', 'ניקיתי את התחנה שלי בסיום?'),
  ('teamwork', 'computer', 'עבודת צוות', 'שיתפתי פעולה עם אחרים?'),
  ('quality', 'computer', 'איכות עבודה', 'השלמתי את המשימה ברמה טובה?'),
  ('responsibility', 'computer', 'אחריות', 'שמרתי על הסדר?'),
  ('teamwork', 'drawing', 'עבודת צוות', 'עבדתי יפה עם אחרים?'),
  ('quality', 'drawing', 'איכות עבודה', 'השקעתי באיכות?'),
  ('responsibility', 'drawing', 'אחריות', 'סידרתי את החומרים?'),
  ('teamwork', 'social', 'עבודת צוות', 'הקשבתי ועזרתי?'),
  ('quality', 'social', 'איכות עבודה', 'השתתפתי בצורה טובה?'),
  ('responsibility', 'social', 'אחריות', 'הייתי אחראי?'),
  ('teamwork', 'cleaning', 'עבודת צוות', 'שיתפתי פעולה בתורנות?'),
  ('quality', 'cleaning', 'איכות עבודה', 'ביצעתי את המשימה כמו שצריך?'),
  ('responsibility', 'cleaning', 'אחריות', 'סידרתי והשלמתי?'),
  ('teamwork', 'fitness', 'עבודת צוות', 'עבדתי יפה עם הקבוצה?'),
  ('quality', 'fitness', 'איכות עבודה', 'השקעתי במאמץ?'),
  ('responsibility', 'fitness', 'אחריות', 'הופעתי והשתתפתי?')
ON CONFLICT (id, skill_id) DO NOTHING;

-- Insert default personal plan templates
INSERT INTO personal_plan_templates (id, name_he) VALUES
  ('t1', 'נקה את השולחן'),
  ('t2', 'הצטרף לסדנאות'),
  ('t3', 'שים את המעיל במקום'),
  ('t4', 'תורנות צהריים')
ON CONFLICT (id) DO NOTHING;
