"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getSkillMetrics, saveSelfAssessment } from "@/lib/sheets-api";
import type { SkillMetric, SelfAssessmentRecord } from "@/lib/types";

export default function SkillAssessPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const skillId = params.id as string;
  const [metrics, setMetrics] = useState<SkillMetric[]>([]);
  const [values, setValues] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!skillId || !user?.id) return;
    getSkillMetrics(skillId)
      .then((r) => {
        const m = r.metrics || [];
        setMetrics(m);
        setValues(
          m.reduce<Record<string, boolean>>((acc, x) => {
            acc[x.id] = false;
            return acc;
          }, {})
        );
      })
      .catch(() => setMetrics([]))
      .finally(() => setLoading(false));
  }, [skillId, user?.id]);

  const skillNames: Record<string, string> = {
    cooking: "בישול",
    computer: "מחשב",
    drawing: "ציור",
    social: "כישורים חברתיים",
    cleaning: "ניקיון וארגון",
    fitness: "פעילות גופנית",
  };
  const skillName = skillNames[skillId] || skillId;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setError("");
    const records: SelfAssessmentRecord[] = metrics.map((m) => ({
      skillId,
      metricId: m.id,
      value: values[m.id] ?? false,
    }));
    try {
      await saveSelfAssessment(user.id, skillId, records);
      router.push("/dashboard");
    } catch (err) {
      setError((err as Error).message || "שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  }

  const progress = metrics.length
    ? Math.round(
        (Object.values(values).filter(Boolean).length / metrics.length) * 100
      )
    : 0;

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="flex-1 w-full max-w-[800px] mx-auto px-4 md:px-10 lg:px-16 py-8">
      <nav className="mb-6 flex flex-wrap gap-2 text-sm text-text-secondary">
        <Link href="/dashboard" className="transition-colors hover:text-primary">
          בית
        </Link>
        <span>/</span>
        <Link href="/dashboard/skills" className="transition-colors hover:text-primary">
          הכישורים שלי
        </Link>
        <span>/</span>
        <span className="text-text">הערכה עצמית - {skillName}</span>
      </nav>

      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-black text-text md:text-4xl">
          איך היה לי היום ב{skillName}?
        </h1>
        <p className="text-lg text-text-secondary">
          קח רגע לחשוב על השיעור. היה כנה עם עצמך!
        </p>
      </div>

      <div className="mb-8">
        <div className="mb-2 flex items-end justify-between">
          <p className="font-medium text-text">שלב 1 מתוך 3: הערכה עצמית</p>
          <span className="text-sm font-bold text-primary">{progress}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-progress-track">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1 text-sm text-text-secondary">כל הכבוד, ממשיך!</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-lg border border-danger/30 bg-danger-muted p-4 text-sm text-danger">
            {error}
          </div>
        )}
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className="flex flex-col justify-between gap-6 rounded-xl border border-border bg-surface p-6 transition-colors hover:border-primary/50 md:flex-row md:items-center"
          >
            <div className="flex items-start gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-progress-track text-text">
                <span className="material-symbols-outlined text-2xl">
                  {metric.id === "teamwork" ? "groups" : metric.id === "quality" ? "stars" : "assignment_turned_in"}
                </span>
              </div>
              <div>
                <p className="text-lg font-bold text-text">{metric.nameHe}</p>
                <p className="text-base text-text-secondary">{metric.descriptionHe}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 self-end md:self-center">
              <span className="text-sm font-medium uppercase tracking-wider text-text-muted">
                לא
              </span>
              <label className="relative flex h-9 w-14 cursor-pointer items-center justify-start rounded-full bg-progress-track p-1 transition-colors duration-300 has-[:checked]:justify-end has-[:checked]:bg-primary">
                <input
                  type="checkbox"
                  checked={values[metric.id] ?? false}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [metric.id]: e.target.checked }))
                  }
                  className="sr-only"
                />
                <div className="h-7 w-7 shrink-0 rounded-full bg-text shadow-sm transition-transform duration-300" />
              </label>
              <span className="text-sm font-bold uppercase tracking-wider text-text">
                כן
              </span>
            </div>
          </div>
        ))}

        <div className="flex flex-col-reverse items-center justify-between gap-6 pt-8 pb-12 md:flex-row">
          <Link
            href="/dashboard"
            className="px-6 py-3 text-base font-medium text-text-secondary transition-colors hover:text-text"
          >
            ביטול
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex min-w-[240px] items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-bold text-bg shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-primary-hover hover:-translate-y-0.5 disabled:opacity-70 md:w-auto"
          >
            <span>{saving ? "שומר..." : "שמור התקדמות"}</span>
            <span className="material-symbols-outlined text-xl">check_circle</span>
          </button>
        </div>
      </form>
    </main>
  );
}
