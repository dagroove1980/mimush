"use client";

import { useAuth } from "@/lib/auth-context";

export default function ProfilePage() {
  const { user } = useAuth();
  return (
    <main className="flex-1 w-full max-w-2xl mx-auto p-6 md:p-8">
      <h2 className="mb-6 text-3xl font-bold text-text">הפרופיל שלי</h2>
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary-muted text-2xl font-bold text-primary">
            {user?.displayName?.charAt(0) || user?.username?.charAt(0) || "?"}
          </div>
          <div>
            <h3 className="text-xl font-bold text-text">{user?.displayName || user?.username}</h3>
            <p className="text-sm text-text-secondary">שם משתמש: {user?.username}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
