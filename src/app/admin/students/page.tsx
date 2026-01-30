"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  getStudents,
  addStudent,
  updateStudentPassword,
} from "@/lib/sheets-api";
import type { User } from "@/lib/types";

const statusLabels: Record<string, string> = {
  active: "פעיל",
  on_leave: "בחופשה",
  needs_review: "דורש בדיקה",
  inactive: "לא פעיל",
};

const statusColors: Record<string, string> = {
  active: "bg-primary-muted text-primary border-primary/30",
  on_leave: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  needs_review: "bg-danger-muted text-danger border-danger/30",
  inactive: "bg-surface-hover text-text-secondary border-border",
};

export default function AdminStudentsPage() {
  const router = useRouter();
  const { user: adminUser, loginAsStudent } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState<{ id: string; name: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [addForm, setAddForm] = useState({ username: "", password: "", displayName: "" });
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    getStudents()
      .then((r) => setStudents(r.students || []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter((s) => {
    const matchSearch =
      !search ||
      s.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      s.username?.toLowerCase().includes(search.toLowerCase()) ||
      (s as { studentId?: string }).studentId?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" || (s.status || "active") === statusFilter;
    return matchSearch && matchStatus;
  });

  async function handleAddStudent(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    setAddLoading(true);
    try {
      const res = await addStudent(addForm);
      if (res.success) {
        setShowAddModal(false);
        setAddForm({ username: "", password: "", displayName: "" });
        const r = await getStudents();
        setStudents(r.students || []);
      } else {
        setAddError(res.error || "שגיאה בהוספה");
      }
    } catch (err) {
      setAddError((err as Error).message || "שגיאה");
    } finally {
      setAddLoading(false);
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordModal || !newPassword.trim()) return;
    setPwError("");
    setPwLoading(true);
    try {
      const res = await updateStudentPassword(passwordModal.id, newPassword.trim());
      if (res.success) {
        setPasswordModal(null);
        setNewPassword("");
      } else {
        setPwError(res.error || "שגיאה בעדכון");
      }
    } catch (err) {
      setPwError((err as Error).message || "שגיאה");
    } finally {
      setPwLoading(false);
    }
  }

  function handleLoginAsStudent(s: User) {
    if (s.role !== "student") return;
    loginAsStudent(s);
    router.push("/dashboard");
  }

  const avatarColors = [
    "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "bg-pink-500/20 text-pink-400 border-pink-500/30",
    "bg-teal-500/20 text-teal-400 border-teal-500/30",
    "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  ];

  return (
    <>
      <header className="h-auto min-h-[80px] px-6 py-6 md:px-10 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 bg-surface/80 backdrop-blur-md border-b border-border z-10">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black tracking-tight text-text">ספר חניכים</h2>
          <p className="text-text-secondary text-sm">ניהול חשבונות, מעקב והתחברות כחניך.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-bg h-11 px-5 rounded-lg font-bold text-sm transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          <span>הוסף חניך חדש</span>
        </button>
      </header>

      <div className="px-6 md:px-10 pb-6 shrink-0">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-lg">
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted material-symbols-outlined">
              search
            </span>
            <input
              type="text"
              placeholder="חיפוש לפי שם, מזהה או אימייל..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 bg-surface border border-border text-text rounded-lg pr-12 pl-4 placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
          <div className="w-full md:w-48 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none material-symbols-outlined">
              expand_more
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-12 bg-surface border border-border text-text rounded-lg px-4 appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer [&_option]:bg-surface [&_option]:text-text"
            >
              <option value="all">כל הסטטוסים</option>
              <option value="active">פעיל</option>
              <option value="on_leave">בחופשה</option>
              <option value="needs_review">דורש בדיקה</option>
              <option value="inactive">לא פעיל</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 md:px-10 pb-6 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto rounded-xl border border-border bg-surface shadow-xl min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <table className="w-full min-w-[900px]">
              <thead className="sticky top-0 bg-surface-hover z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider w-[35%]">
                    שם ופרטים
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider w-[20%]">
                    סטטוס
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider w-[45%]">
                    פעולות
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((s, i) => (
                  <tr key={s.id} className="hover:bg-surface-hover/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4 justify-end">
                        <div>
                          <div className="text-sm font-semibold text-text">
                            {s.displayName || s.username}
                          </div>
                          <div className="text-xs text-text-secondary">מזהה: #{s.id}</div>
                        </div>
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border ${
                            avatarColors[i % avatarColors.length]
                          }`}
                        >
                          {(s.displayName || s.username || "?").slice(0, 2).toUpperCase()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                          statusColors[s.status || "active"] || statusColors.active
                        }`}
                      >
                        {s.status === "active" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                        {statusLabels[s.status || "active"] || s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left">
                      <div className="flex items-center justify-start gap-3 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => setPasswordModal({ id: s.id, name: s.displayName || s.username || "" })}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text hover:bg-surface-hover rounded-md transition-colors"
                          title="ערוך סיסמה"
                        >
                          <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                          <span className="hidden xl:inline">סיסמה</span>
                        </button>
                        <div className="h-6 w-px bg-border mx-1" />
                        {s.role === "student" && (
                          <button
                            type="button"
                            onClick={() => handleLoginAsStudent(s)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-muted hover:bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95"
                          >
                            <span className="material-symbols-outlined text-[18px]">login</span>
                            התחבר כחניך
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="pt-4 flex items-center justify-between border-t border-border mt-4">
          <p className="text-xs text-text-secondary">
            מציג <span className="text-text font-medium">1-{filtered.length}</span> מתוך{" "}
            <span className="text-text font-medium">{students.length}</span> חניכים
          </p>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-text mb-4">הוסף חניך חדש</h3>
            <form onSubmit={handleAddStudent} className="flex flex-col gap-4">
              {addError && (
                <div className="p-3 rounded-lg bg-danger-muted border border-danger/30 text-danger text-sm">
                  {addError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">שם מלא</label>
                <input
                  type="text"
                  value={addForm.displayName}
                  onChange={(e) => setAddForm((p) => ({ ...p, displayName: e.target.value }))}
                  placeholder="שם החניך"
                  className="w-full h-12 bg-bg border border-border rounded-lg px-4 text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">שם משתמש</label>
                <input
                  type="text"
                  value={addForm.username}
                  onChange={(e) => setAddForm((p) => ({ ...p, username: e.target.value }))}
                  placeholder="username"
                  className="w-full h-12 bg-bg border border-border rounded-lg px-4 text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">סיסמה</label>
                <input
                  type="password"
                  value={addForm.password}
                  onChange={(e) => setAddForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full h-12 bg-bg border border-border rounded-lg px-4 text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
                  required
                />
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
                  {addLoading ? "שומר..." : "הוסף"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {passwordModal && (
        <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-text mb-2">עדכון סיסמה</h3>
            <p className="text-text-secondary text-sm mb-4">{passwordModal.name}</p>
            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
              {pwError && (
                <div className="p-3 rounded-lg bg-danger-muted border border-danger/30 text-danger text-sm">
                  {pwError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">סיסמה חדשה</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 bg-bg border border-border rounded-lg px-4 text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPasswordModal(null);
                    setNewPassword("");
                    setPwError("");
                  }}
                  className="flex-1 py-3 rounded-lg border border-border text-text-secondary hover:text-text hover:bg-surface-hover transition-colors"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="flex-1 py-3 rounded-lg bg-primary text-bg font-bold hover:bg-primary-hover transition-colors disabled:opacity-70"
                >
                  {pwLoading ? "שומר..." : "עדכן סיסמה"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
