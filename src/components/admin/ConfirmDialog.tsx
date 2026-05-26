"use client";

import { useEffect, useState } from "react";

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

type Resolver = (ok: boolean) => void;

let externalOpen: ((opts: ConfirmOptions) => Promise<boolean>) | null = null;

/**
 * Imperative API used by callers:
 *   const ok = await confirm({ title: "למחוק?", destructive: true });
 *   if (!ok) return;
 */
export async function confirm(opts: ConfirmOptions): Promise<boolean> {
  if (!externalOpen) return window.confirm(opts.title);
  return externalOpen(opts);
}

/**
 * Mount once near the root of the admin tree. Renders the modal and wires the
 * imperative `confirm()` API above.
 */
export default function ConfirmDialogHost() {
  const [state, setState] = useState<{
    opts: ConfirmOptions;
    resolve: Resolver;
  } | null>(null);

  useEffect(() => {
    externalOpen = (opts) =>
      new Promise<boolean>((resolve) => setState({ opts, resolve }));
    return () => {
      externalOpen = null;
    };
  }, []);

  useEffect(() => {
    if (!state) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close(false);
      if (e.key === "Enter") close(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function close(ok: boolean) {
    if (!state) return;
    state.resolve(ok);
    setState(null);
  }

  if (!state) return null;
  const { opts } = state;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      dir="rtl"
    >
      <button
        aria-label="סגור"
        onClick={() => close(false)}
        className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-sm bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_20px_60px_-20px_rgba(15,23,42,0.35)] p-6">
        <h3 className="text-[16px] font-bold text-[#0F172A] leading-snug">
          {opts.title}
        </h3>
        {opts.description && (
          <p className="text-[13px] text-[#64748B] mt-2 leading-relaxed">
            {opts.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-5">
          <button
            onClick={() => close(true)}
            autoFocus
            className={`flex-1 rounded-full text-white text-[13px] font-semibold px-4 py-2.5 transition ${
              opts.destructive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#2B7FFF] hover:bg-[#1d6fea]"
            }`}
          >
            {opts.confirmLabel ?? "אישור"}
          </button>
          <button
            onClick={() => close(false)}
            className="rounded-full text-[#64748B] hover:text-[#0F172A] text-[13px] font-semibold px-4 py-2.5"
          >
            {opts.cancelLabel ?? "ביטול"}
          </button>
        </div>
      </div>
    </div>
  );
}
