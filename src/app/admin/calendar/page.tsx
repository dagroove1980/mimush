"use client";

import { useEffect, useState } from "react";
import {
  getActivitiesForDateRange,
  addActivity,
  deleteActivity,
  getStudents,
} from "@/lib/sheets-api";
import type { Activity } from "@/lib/types";
import type { User } from "@/lib/types";
import { formatDateKey } from "@/lib/date-utils";

function getWeekDates(base: Date): Date[] {
  const start = new Date(base);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

const DAY_NAMES_HE = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

function ActivityCard({
  activity,
  onDelete,
}: {
  activity: Activity;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-surface border-r-4 border-primary rounded-md p-2 text-xs relative">
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0 flex-1">
          <p className="text-text font-bold truncate">{activity.titleHe}</p>
          {(activity.timeStart || activity.timeEnd) && (
            <p className="text-text-secondary text-[10px]">
              {activity.timeStart}-{activity.timeEnd}
            </p>
          )}
        </div>
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className="p-0.5 rounded text-text-secondary hover:text-text hover:bg-surface-hover transition-colors"
            aria-label="פעולות"
          >
            <span className="material-symbols-outlined text-[16px]">more_vert</span>
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                aria-hidden
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-0.5 z-20 min-w-[80px] bg-surface border border-border rounded-lg shadow-lg overflow-hidden">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMenuOpen(false);
                    onDelete();
                  }}
                  className="w-full px-3 py-2 text-right text-danger hover:bg-danger-muted text-[10px] font-medium flex items-center gap-1 justify-end"
                >
                  <span className="material-symbols-outlined text-[14px]">delete</span>
                  מחק
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminCalendarPage() {
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(d);
    start.setDate(diff);
    return start;
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    date: formatDateKey(new Date()),
    titleHe: "",
    descriptionHe: "",
    timeStart: "",
    timeEnd: "",
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  const weekDates = getWeekDates(weekStart);
  const startKey = formatDateKey(weekDates[0]);
  const endKey = formatDateKey(weekDates[6]);

  useEffect(() => {
    getActivitiesForDateRange(startKey, endKey)
      .then((r) => setActivities(r.activities || []))
      .catch(() => setActivities([]));
    getStudents()
      .then((r) => setStudents(r.students || []))
      .catch(() => setStudents([]));
  }, [startKey, endKey]);

  useEffect(() => {
    setLoading(false);
  }, [activities]);

  function goPrevWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  }

  function goNextWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  }

  function goToday() {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(d);
    start.setDate(diff);
    setWeekStart(start);
  }

  async function handleAddActivity(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    setAddLoading(true);
    try {
      const res = await addActivity({
        date: addForm.date,
        titleHe: addForm.titleHe,
        descriptionHe: addForm.descriptionHe || undefined,
        timeStart: addForm.timeStart || undefined,
        timeEnd: addForm.timeEnd || undefined,
      });
      if (res.success && res.id) {
        const newActivity: Activity = {
          id: res.id,
          date: addForm.date,
          titleHe: addForm.titleHe,
          descriptionHe: addForm.descriptionHe || undefined,
          timeStart: addForm.timeStart || undefined,
          timeEnd: addForm.timeEnd || undefined,
        };
        setActivities((prev) => [...prev, newActivity]);
        setShowAddModal(false);
        setAddForm({
          date: formatDateKey(new Date()),
          titleHe: "",
          descriptionHe: "",
          timeStart: "",
          timeEnd: "",
        });
        getActivitiesForDateRange(startKey, endKey)
          .then((r) => {
            const fromServer = r.activities || [];
            setActivities((prev) => {
              const serverIds = new Set(fromServer.map((x) => x.id));
              const onlyInPrev = prev.filter((x) => !serverIds.has(x.id));
              return [...fromServer, ...onlyInPrev];
            });
          })
          .catch(() => {});
      } else {
        setAddError(res.error || "שגיאה ביצירת הפעילות");
      }
    } catch (err) {
      setAddError((err as Error).message || "שגיאה ביצירת הפעילות");
    } finally {
      setAddLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("למחוק את הפעילות?")) return;
    try {
      await deleteActivity(id);
      setActivities((prev) => prev.filter((a) => a.id !== id));
    } catch {
      // ignore
    }
  }

  const activitiesByDate = activities.reduce<Record<string, Activity[]>>((acc, a) => {
    if (!acc[a.date]) acc[a.date] = [];
    acc[a.date].push(a);
    return acc;
  }, {});

  const monthYear = weekStart.toLocaleDateString("he-IL", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <header className="flex items-center justify-between border-b border-border px-6 py-3 bg-surface shrink-0 z-20">
        <div className="flex items-center gap-4 text-text">
          <div className="size-8 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-3xl">diversity_3</span>
          </div>
          <h2 className="text-text text-lg font-bold leading-tight tracking-tight">
            לוח מנהלים
          </h2>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b border-border shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-text text-3xl font-black leading-tight tracking-tight">
            {monthYear}
          </h1>
          <div className="flex items-center gap-2 text-text-secondary">
            <button
              type="button"
              onClick={goPrevWeek}
              className="hover:text-text transition-colors p-1"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
            <span className="text-sm font-medium text-text-secondary">
              {weekDates[0].getDate()}-{weekDates[6].getDate()} {weekDates[0].toLocaleDateString("he-IL", { month: "short" })}
            </span>
            <button
              type="button"
              onClick={goNextWeek}
              className="hover:text-text transition-colors p-1"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={goToday}
              className="mr-2 text-xs font-bold text-primary border border-primary/30 bg-primary-muted px-2 py-0.5 rounded uppercase tracking-wide"
            >
              היום
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-bg px-4 py-2 rounded-lg font-bold text-sm transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span className="hidden sm:inline">פעילות חדשה</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-7 gap-2 min-w-[600px]">
          {weekDates.map((d) => {
            const key = formatDateKey(d);
            const isToday = key === formatDateKey(new Date());
            const dayName = DAY_NAMES_HE[d.getDay() === 0 ? 6 : d.getDay() - 1];
            const dayNum = d.getDate();
            const list = activitiesByDate[key] || [];
            return (
              <div
                key={key}
                className={`border border-border rounded-xl overflow-hidden ${
                  isToday ? "bg-surface-hover border-primary/30" : "bg-surface"
                }`}
              >
                <div className="p-2 border-b border-border text-center">
                  <span
                    className={`text-xs font-medium uppercase ${
                      isToday ? "text-primary font-bold" : "text-text-secondary"
                    }`}
                  >
                    {dayName}
                  </span>
                  <div
                    className={`mt-0.5 size-7 rounded-full flex items-center justify-center text-sm font-bold mx-auto ${
                      isToday ? "bg-primary text-bg" : "text-text"
                    }`}
                  >
                    {dayNum}
                  </div>
                </div>
                <div className="p-2 space-y-2 min-h-[120px]">
                  {list.map((a) => (
                    <ActivityCard
                      key={a.id}
                      activity={a}
                      onDelete={() => handleDelete(a.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-text mb-4">הוסף פעילות ליום</h3>
            <form onSubmit={handleAddActivity} className="flex flex-col gap-4">
              {addError && (
                <div className="p-3 rounded-lg bg-danger-muted border border-danger/30 text-danger text-sm">
                  {addError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">תאריך</label>
                <input
                  type="date"
                  value={addForm.date}
                  onChange={(e) => setAddForm((p) => ({ ...p, date: e.target.value }))}
                  className="w-full h-12 bg-bg border border-border rounded-lg px-4 text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">כותרת</label>
                <input
                  type="text"
                  value={addForm.titleHe}
                  onChange={(e) => setAddForm((p) => ({ ...p, titleHe: e.target.value }))}
                  placeholder="שם הפעילות"
                  className="w-full h-12 bg-bg border border-border rounded-lg px-4 text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">תיאור (אופציונלי)</label>
                <input
                  type="text"
                  value={addForm.descriptionHe}
                  onChange={(e) => setAddForm((p) => ({ ...p, descriptionHe: e.target.value }))}
                  placeholder="מיקום, פרטים"
                  className="w-full h-12 bg-bg border border-border rounded-lg px-4 text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">משעה</label>
                  <input
                    type="time"
                    value={addForm.timeStart}
                    onChange={(e) => setAddForm((p) => ({ ...p, timeStart: e.target.value }))}
                    className="w-full h-12 bg-bg border border-border rounded-lg px-4 text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">עד שעה</label>
                  <input
                    type="time"
                    value={addForm.timeEnd}
                    onChange={(e) => setAddForm((p) => ({ ...p, timeEnd: e.target.value }))}
                    className="w-full h-12 bg-bg border border-border rounded-lg px-4 text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-lg border border-border text-text-secondary hover:text-text hover:bg-surface-hover transition-colors"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 py-3 rounded-lg bg-primary text-bg font-bold hover:bg-primary-hover transition-colors disabled:opacity-70"
                >
                  {addLoading ? "שומר..." : "הוסף פעילות"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
