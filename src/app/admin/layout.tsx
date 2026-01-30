"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== "admin") {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const nav = [
    { href: "/admin", label: "סקירה", icon: "dashboard" },
    { href: "/admin/students", label: "חניכים", icon: "group" },
    { href: "/admin/calendar", label: "לוח שנה", icon: "calendar_month" },
    { href: "/admin/reports", label: "דוחות", icon: "description" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <aside className="hidden h-full w-72 shrink-0 flex-col border-l border-border bg-surface transition-all duration-300 lg:flex">
        <div className="flex h-20 items-center border-b border-border px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-xl text-bg">
              מ
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight text-text">לוח מנהלים</h1>
              <p className="text-xs font-normal text-text-secondary">ניהול ומעקב</p>
            </div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-6">
          {nav.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors group ${
                  isActive
                    ? "border border-primary/30 bg-primary-muted font-bold text-primary shadow-md"
                    : "font-medium text-text-secondary hover:bg-surface-hover hover:text-text"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-2xl ${
                    isActive ? "fill-1" : "transition-colors group-hover:text-primary"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4">
          <button
            type="button"
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-danger transition-colors hover:bg-danger-muted hover:text-danger"
          >
            <span className="material-symbols-outlined text-2xl">logout</span>
            <span className="text-sm font-medium">יציאה</span>
          </button>
        </div>
      </aside>

      <main className="relative flex h-full flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
