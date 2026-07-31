"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { confirm } from "./ConfirmDialog";
import { type TagLite } from "./TagChip";
import { TAG_COLOR_ORDER, TAG_COLOR_SWATCH, tagTone } from "@/lib/admin/format";

/**
 * The project's tag vocabulary. Kept collapsed by default — it's a
 * set-it-and-forget-it list, not something to look at on every visit.
 *
 * `slug` is editable because it's the handle agents write in their CLAUDE.md;
 * renaming it silently breaks them, so it's shown, not hidden.
 */
export default function ProjectTagManager({
  projectId,
  tags,
  usage,
}: {
  projectId: number;
  tags: TagLite[];
  /** How many tasks carry each tag — makes "safe to delete?" answerable in place. */
  usage: Record<number, number>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [slug, setSlug] = useState("");
  const [busy, setBusy] = useState(false);

  async function create() {
    const trimmed = label.trim();
    if (!trimmed) return;
    setBusy(true);
    const res = await fetch("/api/admin/personal-tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, label: trimmed, slug: slug.trim() || undefined }),
    });
    setBusy(false);
    if (res.ok) {
      setLabel("");
      setSlug("");
      router.refresh();
    } else {
      toast.error(res.status === 409 ? "המזהה הזה כבר תפוס" : "יצירת תגית נכשלה");
    }
  }

  async function patch(id: number, body: Record<string, unknown>) {
    const res = await fetch(`/api/admin/personal-tags/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) router.refresh();
    else toast.error(res.status === 409 ? "המזהה הזה כבר תפוס" : "עדכון נכשל");
  }

  async function del(tag: TagLite) {
    const count = usage[tag.id] ?? 0;
    const ok = await confirm({
      title: `למחוק את התגית "${tag.label}"?`,
      description: count
        ? `התגית תוסר מ-${count} משימות. המשימות עצמן לא נמחקות.`
        : "התגית לא מוצמדת לאף משימה.",
      confirmLabel: "מחק תגית",
      destructive: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/personal-tags/${tag.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else toast.error("מחיקה נכשלה");
  }

  return (
    <div dir="rtl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="text-[12px] font-semibold text-[#94A3B8] hover:text-[#2B7FFF] transition-colors"
      >
        🏷 תגיות הפרויקט · {tags.length}
      </button>

      {open && (
        <div className="mt-2.5 space-y-2">
          <p className="text-[11px] text-[#94A3B8] leading-relaxed">
            התגיות אומרות על מה העבודה — אזור בפרויקט, לא סוג המשימה. ה
            <strong className="font-semibold">מזהה</strong> באנגלית הוא מה שסוכן שולח ב-API;
            שינוי שלו מחייב עדכון ב-CLAUDE.md של הפרויקט.
          </p>

          <ul className="divide-y divide-[#F1F5F9] border border-[#E2E8F0] rounded-xl overflow-hidden bg-white">
            {tags.map((t) => (
              <TagRow
                key={t.id}
                tag={t}
                count={usage[t.id] ?? 0}
                onPatch={(body) => patch(t.id, body)}
                onDelete={() => del(t)}
              />
            ))}
            {tags.length === 0 && (
              <li className="px-4 py-3 text-[12px] text-[#94A3B8]">עוד אין תגיות.</li>
            )}
          </ul>

          <div className="flex flex-wrap items-center gap-2">
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), create())}
              placeholder="תווית — למשל נדל״ן"
              className="flex-1 min-w-[140px] text-[12px] border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#2B7FFF]"
            />
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), create())}
              placeholder="מזהה (real-estate)"
              dir="ltr"
              className="w-40 text-[12px] border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:border-[#2B7FFF]"
            />
            <button
              type="button"
              onClick={create}
              disabled={busy || !label.trim()}
              className="text-[12px] font-semibold text-white bg-[#2B7FFF] rounded-lg px-3 py-1.5 disabled:opacity-40"
            >
              הוסף
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TagRow({
  tag,
  count,
  onPatch,
  onDelete,
}: {
  tag: TagLite;
  count: number;
  onPatch: (body: Record<string, unknown>) => void;
  onDelete: () => void;
}) {
  const [label, setLabel] = useState(tag.label);
  const [slug, setSlug] = useState(tag.slug);

  return (
    <li className="group flex items-center gap-2 px-3 py-2">
      <span
        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold shrink-0 ${tagTone(tag.color)}`}
      >
        {tag.label}
      </span>

      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onBlur={() => label.trim() && label !== tag.label && onPatch({ label: label.trim() })}
        aria-label="תווית"
        className="flex-1 min-w-0 text-[12px] bg-transparent border border-transparent hover:border-[#E2E8F0] focus:border-[#2B7FFF] rounded px-1.5 py-0.5 focus:outline-none"
      />

      <input
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        onBlur={() => slug.trim() && slug !== tag.slug && onPatch({ slug: slug.trim() })}
        aria-label="מזהה לסוכן"
        dir="ltr"
        className="w-32 text-[11px] font-mono text-[#64748B] bg-transparent border border-transparent hover:border-[#E2E8F0] focus:border-[#2B7FFF] rounded px-1.5 py-0.5 focus:outline-none"
      />

      <div className="flex items-center gap-1 shrink-0">
        {TAG_COLOR_ORDER.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onPatch({ color: c })}
            aria-label={`צבע ${c}`}
            aria-pressed={tag.color === c}
            className={`w-3.5 h-3.5 rounded-full ${TAG_COLOR_SWATCH[c]} ${
              tag.color === c ? "ring-2 ring-offset-1 ring-[#0F172A]" : "opacity-40 hover:opacity-100"
            } transition-opacity`}
          />
        ))}
      </div>

      <span className="shrink-0 text-[11px] tabular-nums text-[#94A3B8] w-8 text-center">
        {count}
      </span>

      <button
        type="button"
        onClick={onDelete}
        aria-label={`מחק את ${tag.label}`}
        className="shrink-0 text-[12px] text-[#CBD5E1] hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </li>
  );
}
