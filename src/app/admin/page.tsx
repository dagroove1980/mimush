"use client";

import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <>
      <header className="h-auto min-h-[80px] px-6 py-6 md:px-10 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 bg-surface/80 backdrop-blur-md border-b border-border z-10">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black tracking-tight text-text">סקירה</h2>
          <p className="text-text-secondary text-sm">ניהול חניכים, לוח שנה ופעילויות.</p>
        </div>
      </header>
      <div className="flex-1 overflow-auto p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          <Link
            href="/admin/students"
            className="bg-surface border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors flex items-center gap-4"
          >
            <div className="size-14 rounded-xl bg-primary-muted flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-3xl">group</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-text">חניכים</h3>
              <p className="text-text-secondary text-sm">ניהול חניכים, סיסמאות והתחברות כחניך.</p>
            </div>
          </Link>
          <Link
            href="/admin/calendar"
            className="bg-surface border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors flex items-center gap-4"
          >
            <div className="size-14 rounded-xl bg-primary-muted flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-3xl">calendar_month</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-text">לוח שנה</h3>
              <p className="text-text-secondary text-sm">הוספת פעילויות לימים הקרובים.</p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
