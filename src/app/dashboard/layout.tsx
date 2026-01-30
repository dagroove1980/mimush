"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role === "admin") {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role === "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-border bg-surface px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary-muted text-primary">
            <span className="material-symbols-outlined" style={{ fontSize: 28 }}>school</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight hidden sm:block">לוח חניך</h1>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/dashboard"
            className="border-b-2 border-primary py-1 text-base font-medium text-text transition-colors hover:text-primary"
          >
            בית
          </Link>
          <Link
            href="/dashboard/profile"
            className="border-b-2 border-transparent py-1 text-base font-medium text-text-secondary transition-colors hover:border-primary hover:text-primary"
          >
            פרופיל
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => logout()}
            className="flex items-center justify-center gap-2 text-sm text-text-secondary transition-colors hover:text-text"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="hidden sm:inline">יציאה</span>
          </button>
          <div className="flex size-10 items-center justify-center rounded-full bg-primary-muted font-bold text-primary">
            {user.displayName?.charAt(0) || user.username?.charAt(0) || "?"}
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
