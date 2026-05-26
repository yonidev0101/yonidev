"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { COMM_KIND_HE, fmtDateTimeHe } from "@/lib/admin/format";
import { useInlineEdit } from "@/lib/admin/useInlineEdit";
import CommunicationEditRow from "./CommunicationEditRow";
import { confirm } from "./ConfirmDialog";
import type { Communication, Project } from "@/lib/db/schema";

export default function CommunicationsList({
  communications,
  projects,
}: {
  communications: Communication[];
  projects: Project[];
}) {
  const router = useRouter();
  const { editingId, startEdit, cancel } = useInlineEdit<number>();

  async function del(id: number) {
    const ok = await confirm({
      title: "למחוק את הרשומה?",
      confirmLabel: "מחק",
      destructive: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/communications/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("נמחק");
      router.refresh();
    } else {
      toast.error("מחיקה נכשלה");
    }
  }

  if (communications.length === 0) {
    return <p className="text-[13px] text-[#94A3B8] py-4">אין רשומות עדיין.</p>;
  }

  return (
    <ul className="bg-white border border-[#E2E8F0] rounded-xl divide-y divide-[#F1F5F9] mt-4 overflow-hidden">
      {communications.map((c) => {
        if (editingId === c.id) {
          return (
            <li key={c.id} className="px-3 py-2">
              <CommunicationEditRow
                communication={{
                  id: c.id,
                  kind: c.kind,
                  happenedAt: c.happenedAt instanceof Date ? c.happenedAt.toISOString() : c.happenedAt,
                  summary: c.summary,
                  details: c.details,
                  projectId: c.projectId,
                }}
                projects={projects}
                onCancel={cancel}
                onSaved={cancel}
              />
            </li>
          );
        }
        return (
          <li key={c.id} className="px-5 py-4 group">
            <div className="flex items-baseline gap-3 mb-1.5">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  c.kind === "decision"
                    ? "bg-emerald-50 text-emerald-700"
                    : c.kind === "meeting"
                      ? "bg-purple-50 text-purple-700"
                      : "bg-[#F1F5F9] text-[#64748B]"
                }`}
              >
                {COMM_KIND_HE[c.kind]}
              </span>
              <span className="text-[12px] text-[#94A3B8]">{fmtDateTimeHe(c.happenedAt)}</span>
              <div className="ms-auto flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(c.id)}
                  className="text-[12px] text-[#94A3B8] hover:text-[#2B7FFF]"
                  aria-label="ערוך"
                >
                  ✎
                </button>
                <button
                  onClick={() => del(c.id)}
                  className="text-[12px] text-[#94A3B8] hover:text-red-600"
                  aria-label="מחק"
                >
                  🗑
                </button>
              </div>
            </div>
            <p className="text-[14px] text-[#0F172A] font-medium">{c.summary}</p>
            {c.details && (
              <p className="text-[13px] text-[#64748B] mt-1 whitespace-pre-wrap">{c.details}</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
