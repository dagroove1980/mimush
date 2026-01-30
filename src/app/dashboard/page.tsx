"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  getStudentSkills,
  getPersonalPlanTasks,
  getActivitiesForDate,
  setTaskCompleted,
  setActivityCompleted,
  getActivityMetrics,
  getActivityAssessment,
  saveActivityAssessment,
} from "@/lib/sheets-api";
import type { Skill, PersonalPlanTask, Activity, ActivityMetric } from "@/lib/types";
import { formatDateKey } from "@/lib/date-utils";

function formatDateHe(d: Date) {
  return d.toLocaleDateString("he-IL", { day: "numeric", month: "long" });
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [tasks, setTasks] = useState<PersonalPlanTask[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [todayKey, setTodayKey] = useState(formatDateKey(new Date()));
  const [activityMetricsData, setActivityMetricsData] = useState<Record<string, { metrics: ActivityMetric[]; values: Record<string, boolean> }>>({});
  const [savingAssessment, setSavingAssessment] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const studentId = user?.id || "";

  useEffect(() => {
    if (!studentId) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    const today = formatDateKey(new Date());
    setTodayKey(today);

    Promise.all([
      getStudentSkills(studentId).then((r) => r.skills),
      getPersonalPlanTasks(studentId, today).then((r) => r.tasks),
      getActivitiesForDate(studentId, today).then((r) => r.activities),
    ])
      .then(([s, t, a]) => {
        if (!cancelled) {
          setSkills(s || []);
          setTasks(t || []);
          setActivities(a || []);
          const acts = (a || []) as Activity[];
          const data: Record<string, { metrics: ActivityMetric[]; values: Record<string, boolean> }> = {};
          acts.forEach((act) => {
            Promise.all([
              getActivityMetrics(act.id).then((r) => r.metrics || []),
              getActivityAssessment(studentId, act.id).then((r) => r.values || []),
            ]).then(([metrics, values]) => {
              if (cancelled) return;
              const valueMap: Record<string, boolean> = {};
              values.forEach((v) => {
                valueMap[v.metricId] = v.value;
              });
              setActivityMetricsData((prev) => ({
                ...prev,
                [act.id]: { metrics, values: valueMap },
              }));
            }).catch(() => {});
          });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "שגיאה בטעינת הנתונים");
          setSkills([]);
          setTasks([]);
          setActivities([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  async function handleTaskToggle(taskId: string, completed: boolean) {
    try {
      await setTaskCompleted(studentId, taskId, todayKey, completed);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed } : t))
      );
    } catch {
      // revert on error
    }
  }

  async function handleActivityToggle(activityId: string, completed: boolean) {
    try {
      await setActivityCompleted(studentId, activityId, completed);
      setActivities((prev) =>
        prev.map((a) => (a.id === activityId ? { ...a, completed } : a))
      );
    } catch {
      // revert
    }
  }

  function setActivityMetricValue(activityId: string, metricId: string, value: boolean) {
    setActivityMetricsData((prev) => {
      const curr = prev[activityId];
      if (!curr) return prev;
      return {
        ...prev,
        [activityId]: {
          ...curr,
          values: { ...curr.values, [metricId]: value },
        },
      };
    });
  }

  async function handleSaveActivityAssessment(activityId: string) {
    const data = activityMetricsData[activityId];
    if (!data?.metrics.length) return;
    setSavingAssessment(activityId);
    try {
      const metrics = data.metrics.map((m) => ({
        metricId: m.id,
        value: data.values[m.id] ?? false,
      }));
      await saveActivityAssessment(studentId, activityId, metrics);
    } catch {
      // ignore
    } finally {
      setSavingAssessment(null);
    }
  }

  const greeting =
    new Date().getHours() < 12 ? "בוקר טוב" : new Date().getHours() < 17 ? "צהריים טובים" : "ערב טוב";
  const displayName = user?.displayName || user?.username || "חניך";

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8 lg:p-10">
      {error && (
        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-400">
          {error} (ייתכן שטרם הוגדרה כתובת ה-API ב-.env.local)
        </div>
      )}

      <div className="mb-10">
        <h2 className="mb-2 text-3xl font-bold text-text sm:text-4xl">
          {greeting}, {displayName}
        </h2>
        <div className="flex items-center gap-2 text-text-secondary">
          <span className="material-symbols-outlined text-amber-400">sunny</span>
          <span className="text-lg">היום {formatDateHe(new Date())}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: My Skills */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">הכישורים שלי</h3>
            <Link href="/dashboard/skills" className="text-primary font-medium hover:underline text-sm">
              הצג הכל
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {skills.slice(0, 4).map((skill) => (
              <Link
                key={skill.id}
                href={`/dashboard/skills/${skill.id}/assess`}
                className="group flex cursor-pointer flex-col rounded-xl border border-border bg-surface p-5 shadow-sm transition-colors hover:border-primary/50 hover:bg-surface-hover"
              >
                <div className="mb-4 flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-progress-track">
                  <span className="material-symbols-outlined text-5xl text-primary">
                    {skill.id === "cooking" ? "restaurant" : skill.id === "computer" ? "computer" : skill.id === "drawing" ? "palette" : skill.id === "social" ? "forum" : skill.id === "cleaning" ? "cleaning_services" : skill.id === "fitness" ? "fitness_center" : "star"}
                  </span>
                </div>
                <div className="mb-2 flex items-end justify-between">
                  <h4 className="text-lg font-bold text-text">{skill.nameHe}</h4>
                  {skill.level != null && (
                    <span className="text-sm font-bold text-primary">רמה {skill.level}</span>
                  )}
                </div>
                {skill.progressPercent != null && (
                  <>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-progress-track">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${skill.progressPercent}%` }}
                      />
                    </div>
                    <p className="mt-2 text-sm text-text-secondary">
                      {skill.progressPercent}% לרמה הבאה
                    </p>
                  </>
                )}
              </Link>
            ))}
            <Link
              href="/dashboard/skills"
              className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-surface p-5 transition-colors hover:border-primary hover:bg-surface-hover"
            >
              <div className="flex size-16 items-center justify-center rounded-full bg-primary-muted text-primary">
                <span className="material-symbols-outlined text-4xl">add</span>
              </div>
              <h4 className="text-center text-lg font-bold text-text-secondary">כישורים נוספים</h4>
            </Link>
          </div>
        </div>

        {/* Right: Personal Plan + Activities */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold text-text">התוכנית האישית שלי</h3>
              <span className="rounded-full bg-surface-hover px-3 py-1 text-sm font-medium text-text-secondary">
                {formatDateHe(new Date())}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {tasks.length === 0 && (
                <p className="text-sm text-text-secondary">אין משימות להיום.</p>
              )}
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`group flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-all ${
                    task.priority === "high"
                      ? "border-l-4 border-l-primary border-border shadow-md"
                      : "hover:border-primary/40"
                  } ${task.completed ? "opacity-60" : ""}`}
                >
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={(e) => handleTaskToggle(task.id, e.target.checked)}
                      className="peer size-8 cursor-pointer appearance-none rounded-lg border-2 border-border bg-transparent transition-colors checked:border-primary checked:bg-primary"
                    />
                    <span className="material-symbols-outlined checkbox-checked-icon pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-bg opacity-0 peer-checked:opacity-100 font-bold">
                      check
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={`text-lg font-medium ${
                        task.completed ? "text-text-secondary line-through" : "text-text"
                      }`}
                    >
                      {task.nameHe}
                    </span>
                    {task.timeLabel && (
                      <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                        {task.timeLabel}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-4">
            <h3 className="text-2xl font-bold text-text">הפעילויות להיום</h3>
            <div className="flex flex-col gap-4 rounded-xl border border-primary/30 bg-primary-muted p-5">
              {activities.length === 0 && (
                <p className="text-sm text-text-secondary">אין פעילויות מתוזמנות להיום.</p>
              )}
              {activities.map((act) => (
                <div
                  key={act.id}
                  className={`flex items-start gap-4 ${act.completed ? "opacity-70" : ""}`}
                >
                  <div className="flex min-w-[70px] flex-col items-center justify-center rounded-lg border border-border bg-surface p-3">
                    <span className="text-xs font-bold uppercase text-text-muted">
                      {act.date && new Date(act.date).toLocaleDateString("he-IL", { weekday: "short" })}
                    </span>
                    <span className={`text-2xl font-bold ${act.completed ? "text-text-muted" : "text-primary"}`}>
                      {act.date ? new Date(act.date).getDate() : ""}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-text">{act.titleHe}</h4>
                    {act.descriptionHe && (
                      <p className="text-sm text-text-secondary">{act.descriptionHe}</p>
                    )}
                    {(act.timeStart || act.timeEnd) && (
                      <div className="mt-2 flex items-center gap-1 text-sm font-medium text-primary">
                        <span className="material-symbols-outlined text-lg">schedule</span>
                        <span>
                          {act.timeStart || ""} - {act.timeEnd || ""}
                        </span>
                      </div>
                    )}
                    <label className="mt-2 flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={act.completed || false}
                        onChange={(e) => handleActivityToggle(act.id, e.target.checked)}
                        className="rounded border-2 border-primary bg-transparent checked:bg-primary"
                      />
                      <span className="text-sm text-text">ביצעתי את הפעילות</span>
                    </label>
                    {activityMetricsData[act.id]?.metrics && activityMetricsData[act.id].metrics.length > 0 && (
                      <div className="mt-4 space-y-3 border-t border-border pt-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">הערכה עצמית</p>
                        {activityMetricsData[act.id].metrics.map((m) => (
                          <div key={m.id} className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-sm font-bold text-text">{m.nameHe}</p>
                              {m.descriptionHe && (
                                <p className="text-xs text-text-secondary">{m.descriptionHe}</p>
                              )}
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <span className="text-xs text-text-muted">לא</span>
                              <label className="relative flex h-8 w-12 cursor-pointer items-center justify-start rounded-full bg-progress-track p-1 transition-colors duration-300 has-[:checked]:justify-end has-[:checked]:bg-primary">
                                <input
                                  type="checkbox"
                                  checked={activityMetricsData[act.id].values[m.id] ?? false}
                                  onChange={(e) => setActivityMetricValue(act.id, m.id, e.target.checked)}
                                  className="sr-only"
                                />
                                <div className="h-6 w-6 shrink-0 rounded-full bg-text shadow-sm transition-transform duration-300" />
                              </label>
                              <span className="text-xs font-bold text-text">כן</span>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleSaveActivityAssessment(act.id)}
                          disabled={savingAssessment === act.id}
                          className="mt-2 flex items-center gap-1 text-sm font-bold text-primary transition-colors hover:text-primary-hover disabled:opacity-70"
                        >
                          {savingAssessment === act.id ? "שומר..." : "שמור הערכה"}
                          <span className="material-symbols-outlined text-lg">check_circle</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
