"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "התחברות נכשלה");
        setLoading(false);
        return;
      }
      const next = search.get("next") || "/admin";
      router.push(next);
      router.refresh();
    } catch {
      setError("בעיית רשת. נסה שוב.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        dir="rtl"
        className="w-full max-w-sm bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_8px_32px_-12px_rgba(15,23,42,0.08)] p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <Image
            src="/logo/y-logo.png"
            alt="YoniDev"
            width={36}
            height={36}
            className="rounded-lg"
          />
          <div>
            <div className="text-[15px] font-bold text-[#0F172A] leading-tight">YoniDev</div>
            <div className="text-[10px] font-semibold tracking-[0.14em] text-[#94A3B8] uppercase">
              אזור ניהול
            </div>
          </div>
        </div>

        <label className="block text-[12px] font-semibold text-[#64748B] tracking-wide mb-2">
          סיסמת אדמין
        </label>
        <input
          type="password"
          autoFocus
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-[15px] text-[#0F172A] outline-none focus:border-[#2B7FFF] focus:bg-white transition"
          placeholder="••••••••"
        />

        {error && (
          <p className="mt-3 text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          className="mt-5 w-full rounded-full bg-[#2B7FFF] hover:bg-[#1d6fea] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[15px] py-3 transition"
        >
          {loading ? "מתחבר..." : "כניסה"}
        </button>
      </form>
    </div>
  );
}
