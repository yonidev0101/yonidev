"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import MobileTopBar from "./MobileTopBar";

/**
 * Wraps the admin app shell. Manages the open/close state of the mobile drawer.
 * The drawer closes when the user taps any nav link (handled in Sidebar) or
 * taps the backdrop / close button.
 */
export default function MobileChrome({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Lock body scroll while drawer is open so the page underneath doesn't move.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <div className="flex min-h-screen flex-col md:flex-row" dir="rtl">
      <MobileTopBar onMenuOpen={() => setMobileOpen(true)} />

      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      {/* Backdrop — only rendered while drawer is open on mobile */}
      {mobileOpen && (
        <button
          aria-label="סגור תפריט"
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-[#0F172A]/40 backdrop-blur-sm"
        />
      )}

      <main className="flex-1 min-w-0 p-4 md:p-10">{children}</main>
    </div>
  );
}
