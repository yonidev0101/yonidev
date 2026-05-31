"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import LiveTimer from "./LiveTimer";

const ITEMS: { href: string; label: string; icon: React.ReactNode }[] = [
  { href: "/admin",           label: "דשבורד",         icon: <DashIcon /> },
  { href: "/admin/clients",   label: "לקוחות",         icon: <UsersIcon /> },
  { href: "/admin/personal",  label: "פרויקטים אישיים", icon: <RocketIcon /> },
  { href: "/admin/tasks",     label: "משימות",         icon: <CheckIcon /> },
  { href: "/admin/time",      label: "שעות",     icon: <ClockIcon /> },
  { href: "/admin/invoices",  label: "חשבוניות", icon: <ReceiptIcon /> },
];

export default function Sidebar({
  mobileOpen = false,
  onMobileClose,
}: {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  // Desktop: sticky in-flow sidebar (md:flex). Mobile: fixed drawer that slides in
  // from the right (RTL), controlled by `mobileOpen`. Both share the same content.
  return (
    <aside
      className={`
        flex flex-col w-60 shrink-0 bg-white border-l border-[#E2E8F0]
        md:sticky md:top-0 md:h-screen md:translate-x-0
        fixed inset-y-0 right-0 z-50 h-screen transition-transform duration-200
        ${mobileOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
      `}
      dir="rtl"
    >
      <div className="flex items-center justify-between px-5 py-5 border-b border-[#F1F5F9]">
        <Link
          href="/admin"
          onClick={onMobileClose}
          className="flex items-center gap-3"
        >
          <Image src="/logo/y-logo.png" alt="" width={32} height={32} className="rounded-md" />
          <div>
            <div className="text-[14px] font-bold text-[#0F172A] leading-tight">YoniDev</div>
            <div className="text-[10px] font-semibold tracking-[0.14em] text-[#94A3B8] uppercase">
              ניהול
            </div>
          </div>
        </Link>
        <button
          onClick={onMobileClose}
          aria-label="סגור"
          className="md:hidden text-[#94A3B8] hover:text-[#0F172A] text-xl leading-none"
        >
          ✕
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {ITEMS.map((it) => {
          const active = pathname === it.href || (it.href !== "/admin" && pathname?.startsWith(it.href));
          return (
            <Link
              key={it.href}
              href={it.href}
              onClick={onMobileClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition ${
                active
                  ? "bg-[#EFF6FF] text-[#2B7FFF]"
                  : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
              }`}
            >
              <span className={active ? "text-[#2B7FFF]" : "text-[#94A3B8]"}>{it.icon}</span>
              {it.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-[#F1F5F9]">
        <LiveTimer />
      </div>

      <button
        onClick={logout}
        className="text-[12px] text-[#94A3B8] hover:text-[#0F172A] py-3 border-t border-[#F1F5F9] transition"
      >
        יציאה
      </button>
    </aside>
  );
}

// ── inline icons (lucide-react in this repo doesn't export all needed names) ──
function DashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function RocketIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function ReceiptIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 1 2V2z" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="8" y1="16" x2="13" y2="16" />
    </svg>
  );
}
