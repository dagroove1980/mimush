"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getStudentSkills } from "@/lib/sheets-api";
import type { Skill } from "@/lib/types";

const skillIcons: Record<string, string> = {
  cooking: "restaurant",
  computer: "computer",
  drawing: "palette",
  social: "forum",
  cleaning: "cleaning_services",
  fitness: "fitness_center",
  default: "star",
};

export default function SkillsListPage() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    getStudentSkills(user.id)
      .then((r) => setSkills(r.skills || []))
      .catch(() => setSkills([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="flex-1 w-full max-w-5xl mx-auto p-6 md:p-8">
      <h2 className="mb-6 text-3xl font-bold text-text">הכישורים שלי</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((skill) => (
          <Link
            key={skill.id}
            href={`/dashboard/skills/${skill.id}/assess`}
            className="flex items-center gap-4 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-primary/50 hover:bg-surface-hover"
          >
            <div className="flex size-14 items-center justify-center rounded-xl bg-primary-muted text-primary">
              <span className="material-symbols-outlined text-3xl">
                {skillIcons[skill.id] || skillIcons.default}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-text">{skill.nameHe}</h3>
              {skill.level != null && (
                <p className="text-sm text-text-secondary">רמה {skill.level}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
