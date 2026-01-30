"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [role, setRole] = useState<"student" | "admin">("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(username, password);
      if (res.success && res.user) {
        router.push(res.user.role === "admin" ? "/admin" : "/dashboard");
        return;
      }
      setError(res.error || "שגיאה בהתחברות");
    } catch (err) {
      setError("לא ניתן להתחבר. בדוק את כתובת ה-API ב-.env.local");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-bg">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-bg/95 px-6 py-4 backdrop-blur-sm lg:px-10">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center text-primary">
            <svg className="h-full w-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor" />
            </svg>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-text">
            מרכז מימוש
          </h2>
        </div>
        <Link
          href="/login"
          className="flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-primary"
        >
          <span className="material-symbols-outlined text-[20px]">help</span>
          <span className="hidden sm:block">צריך עזרה?</span>
        </Link>
      </header>

      <main className="relative flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
          <div className="absolute -left-[10%] -top-[10%] h-[50%] w-[50%] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute right-[10%] top-[20%] h-[30%] w-[30%] rounded-full bg-primary/5 blur-[100px]" />
        </div>

        <div className="relative z-10 w-full max-w-[480px] overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
          <div className="grid grid-cols-2 border-b border-border">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`relative flex flex-col items-center justify-center py-4 transition-colors ${
                role === "student" ? "bg-surface-hover" : "hover:bg-surface-hover/50"
              }`}
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px] text-primary">school</span>
                <span className="text-sm font-bold tracking-wide text-text">חניך</span>
              </div>
              {role === "student" && (
                <div className="absolute bottom-0 h-0.5 w-full rounded-t-full bg-primary" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`relative flex flex-col items-center justify-center py-4 transition-colors ${
                role === "admin" ? "bg-surface-hover" : "hover:bg-surface-hover/50"
              }`}
            >
              <div className="mb-1 flex items-center gap-2">
                <span
                  className={`material-symbols-outlined text-[22px] transition-colors ${
                    role === "admin" ? "text-primary" : "text-text-secondary"
                  }`}
                >
                  admin_panel_settings
                </span>
                <span
                  className={`text-sm font-bold tracking-wide transition-colors ${
                    role === "admin" ? "text-text" : "text-text-secondary"
                  }`}
                >
                  מנהל
                </span>
              </div>
              {role === "admin" && (
                <div className="absolute bottom-0 h-0.5 w-full rounded-t-full bg-primary" />
              )}
            </button>
          </div>

          <div className="p-8 sm:p-10">
            <div className="mb-8 text-center">
              <h1 className="mb-3 text-2xl font-bold text-text sm:text-3xl">
                ברוך שובך
              </h1>
              <p className="text-base leading-relaxed text-text-secondary">
                התחבר כדי לראות את המשימות ולעקוב אחר הכישורים שלך.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {error && (
                <div className="rounded-lg border border-danger/30 bg-danger-muted p-3 text-sm text-danger">
                  {error}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-secondary" htmlFor="username">
                  שם משתמש
                </label>
                <div className="relative group">
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-primary">
                    <span className="material-symbols-outlined text-[24px]">person</span>
                  </div>
                  <input
                    className="h-14 w-full rounded-xl border border-border bg-bg pl-4 pr-12 text-lg text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    id="username"
                    name="username"
                    placeholder="הכנס שם משתמש"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-secondary" htmlFor="password">
                  סיסמה
                </label>
                <div className="relative group">
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-primary">
                    <span className="material-symbols-outlined text-[24px]">lock</span>
                  </div>
                  <input
                    className="h-14 w-full rounded-xl border border-border bg-bg pl-12 pr-12 text-lg text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    aria-label="הצג סיסמה"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-[24px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary font-bold text-lg text-bg shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover active:scale-[0.98] disabled:opacity-70"
              >
                <span>{loading ? "מתחבר..." : "התחבר"}</span>
                <span className="material-symbols-outlined">login</span>
              </button>
            </form>
          </div>

          <div className="border-t border-border bg-surface-hover/50 py-4 px-8 text-center">
            <p className="text-sm text-text-secondary">
              יש בעיה?{" "}
              <Link className="font-bold text-text underline-offset-4 hover:underline hover:decoration-primary" href="/login">
                צור קשר
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
