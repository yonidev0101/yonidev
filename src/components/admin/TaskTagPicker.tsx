"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import TagChip, { type TagLite } from "./TagChip";
import { tagTone } from "@/lib/admin/format";

/**
 * Tags on one task: click a tag in the project's catalogue to toggle it, or
 * type a new one. Saves the whole set on every toggle (PUT), so the row can
 * never drift out of sync with what's on screen.
 */
export default function TaskTagPicker({
  taskId,
  projectId,
  tags,
  projectTags,
}: {
  taskId: number;
  projectId: number;
  tags: TagLite[];
  projectTags: TagLite[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const selected = new Set(tags.map((t) => t.id));

  async function save(tagIds: number[]) {
    setSaving(true);
    const res = await fetch(`/api/admin/personal-tasks/${taskId}/tags`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagIds }),
    });
    setSaving(false);
    if (res.ok) router.refresh();
    else toast.error("עדכון התגיות נכשל");
  }

  function toggle(tagId: number) {
    const next = selected.has(tagId)
      ? [...selected].filter((id) => id !== tagId)
      : [...selected, tagId];
    save(next);
  }

  async function createAndAttach() {
    const label = newLabel.trim();
    if (!label) return;
    setSaving(true);
    const res = await fetch("/api/admin/personal-tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, label }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error(res.status === 409 ? "תגית כזו כבר קיימת" : "יצירת תגית נכשלה");
      return;
    }
    const { tag } = (await res.json()) as { tag: TagLite };
    setNewLabel("");
    await save([...selected, tag.id]);
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5" dir="rtl">
      {tags.map((t) => (
        <TagChip key={t.id} tag={t} onRemove={() => toggle(t.id)} />
      ))}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1 rounded-full border border-dashed border-[#CBD5E1] px-2 py-0.5 text-[11px] font-semibold text-[#94A3B8] hover:text-[#2B7FFF] hover:border-[#2B7FFF] transition-colors"
      >
        {tags.length ? "＋ תגית" : "＋ הוסף תגית"}
      </button>

      {open && (
        <div className="w-full mt-1.5 rounded-xl border border-[#E2E8F0] bg-white p-3 space-y-2.5">
          {projectTags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {projectTags.map((t) => {
                const on = selected.has(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    disabled={saving}
                    onClick={() => toggle(t.id)}
                    aria-pressed={on}
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold transition disabled:opacity-50 ${
                      on ? tagTone(t.color) : "bg-white text-[#94A3B8] border-[#E2E8F0] hover:border-[#CBD5E1]"
                    }`}
                  >
                    {on && <span aria-hidden>✓</span>}
                    {t.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-[12px] text-[#94A3B8]">
              עוד אין תגיות בפרויקט הזה. צור את הראשונה כאן.
            </p>
          )}

          <div className="flex items-center gap-2 border-t border-[#F1F5F9] pt-2.5">
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  createAndAttach();
                }
              }}
              placeholder="תגית חדשה — למשל נדל״ן"
              className="flex-1 text-[12px] border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#2B7FFF]"
            />
            <button
              type="button"
              onClick={createAndAttach}
              disabled={saving || !newLabel.trim()}
              className="text-[12px] font-semibold text-white bg-[#2B7FFF] rounded-lg px-3 py-1.5 disabled:opacity-40"
            >
              צור
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
