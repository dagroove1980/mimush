"use client";

export default function AdminReportsPage() {
  return (
    <>
      <header className="h-auto min-h-[80px] px-6 py-6 md:px-10 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 bg-surface/80 backdrop-blur-md border-b border-border z-10">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black tracking-tight text-text">דוחות</h2>
          <p className="text-text-secondary text-sm">סקירת התקדמות ונתונים (בהמשך).</p>
        </div>
      </header>
      <div className="flex-1 p-6 md:p-10 flex items-center justify-center">
        <p className="text-text-secondary text-sm">פונקציית דוחות תתווסף בהמשך.</p>
      </div>
    </>
  );
}
