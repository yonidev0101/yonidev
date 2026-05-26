"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { confirm } from "./ConfirmDialog";
import ManualTimeEntryForm from "./ManualTimeEntryForm";
import TaskEditRow from "./TaskEditRow";
import TimeEntryEditRow from "./TimeEntryEditRow";
import { useInlineEdit } from "@/lib/admin/useInlineEdit";
import type {
  Project,
  Client,
  Task,
  ProjectLink,
  TimeEntry,
  Communication,
} from "@/lib/db/schema";
import {
  TASK_STATUS_HE,
  TASK_PRIORITY_HE,
  COMM_KIND_HE,
  fmtDateHe,
  fmtDateTimeHe,
  fmtHours,
} from "@/lib/admin/format";

const TABS: { key: string; label: string }[] = [
  { key: "overview", label: "סקירה" },
  { key: "tasks", label: "משימות" },
  { key: "time", label: "שעות" },
  { key: "links", label: "קישורים" },
  { key: "communications", label: "תקשורת" },
];

type Props = {
  project: Project;
  client: Client | null;
  tab: string;
  tasks: Task[];
  links: ProjectLink[];
  timeEntries: TimeEntry[];
  communications: Communication[];
};

export default function ProjectShell(props: Props) {
  const { project, tab } = props;
  const router = useRouter();

  return (
    <div className="space-y-5">
      <ProjectMeta project={project} client={props.client} />

      <nav className="flex items-center gap-1 border-b border-[#E2E8F0]" dir="rtl">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <Link
              key={t.key}
              href={`/admin/projects/${project.id}?tab=${t.key}`}
              scroll={false}
              className={`px-4 py-2.5 text-[13px] font-semibold border-b-2 -mb-px transition ${
                active
                  ? "border-[#2B7FFF] text-[#2B7FFF]"
                  : "border-transparent text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      {tab === "overview" && <OverviewTab {...props} />}
      {tab === "tasks" && <TasksTab project={project} tasks={props.tasks} onChange={() => router.refresh()} />}
      {tab === "time" && <TimeTab project={project} entries={props.timeEntries} onChange={() => router.refresh()} />}
      {tab === "links" && <LinksTab project={project} links={props.links} onChange={() => router.refresh()} />}
      {tab === "communications" && <CommunicationsTab list={props.communications} />}
    </div>
  );
}

// ── Project meta / settings (name, description, rate, status, next_action, delete) ──

function ProjectMeta({ project, client }: { project: Project; client: Client | null }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: project.name,
    description: project.description ?? "",
    hourlyRateIls: project.hourlyRateIls ?? "",
    status: project.status,
    nextAction: project.nextAction ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/admin/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        description: form.description || null,
        hourlyRateIls: form.hourlyRateIls === "" ? null : Number(form.hourlyRateIls),
        status: form.status,
        nextAction: form.nextAction || null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("הפרויקט עודכן");
      router.refresh();
    } else {
      toast.error("עדכון נכשל");
    }
  }

  async function del() {
    const ok = await confirm({
      title: "למחוק את הפרויקט?",
      description:
        "כל המשימות, השעות והקישורים של הפרויקט יימחקו. רשומות תקשורת יישארו אצל הלקוח אך יאבדו את הקישור לפרויקט. אי אפשר להחזיר אחורה.",
      confirmLabel: "מחק פרויקט",
      destructive: true,
    });
    if (!ok) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/projects/${project.id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      toast.success("הפרויקט נמחק");
      if (client) {
        router.push(`/admin/clients/${client.id}`);
      } else {
        router.push("/admin/clients");
      }
      router.refresh();
    } else {
      toast.error("מחיקה נכשלה");
    }
  }

  const defaultRate = client?.defaultHourlyRateIls;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="שם הפרויקט">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="ipt-meta"
          />
        </Field>
        <Field label="סטטוס">
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as Project["status"] })}
            className="ipt-meta"
          >
            <option value="active">פעיל</option>
            <option value="paused">מושהה</option>
            <option value="done">הושלם</option>
          </select>
        </Field>
      </div>
      <Field label="המהלך הבא">
        <input
          value={form.nextAction}
          onChange={(e) => setForm({ ...form, nextAction: e.target.value })}
          placeholder="מה הצעד הבא? (יופיע בדשבורד)"
          className="ipt-meta"
        />
      </Field>

      {advancedOpen ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label={
                defaultRate
                  ? `תעריף לשעה (ברירת מחדל של הלקוח: ₪${defaultRate})`
                  : "תעריף לשעה (₪)"
              }
            >
              <input
                type="number"
                min="0"
                step="1"
                value={String(form.hourlyRateIls)}
                onChange={(e) => setForm({ ...form, hourlyRateIls: e.target.value })}
                placeholder={defaultRate ? `ברירת מחדל: ${defaultRate}` : ""}
                className="ipt-meta tabular-nums"
              />
            </Field>
          </div>
          <Field label="תיאור / הערות פנימיות">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="ipt-meta resize-y"
            />
          </Field>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setAdvancedOpen(true)}
          className="text-[12px] text-[#94A3B8] hover:text-[#0F172A]"
        >
          הצג עוד הגדרות
        </button>
      )}

      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-full bg-[#2B7FFF] hover:bg-[#1d6fea] disabled:opacity-50 text-white text-[13px] font-semibold px-5 py-2"
        >
          {saving ? "שומר..." : "שמור"}
        </button>
        <button
          onClick={del}
          disabled={deleting}
          className="text-[12px] text-[#94A3B8] hover:text-red-600"
        >
          {deleting ? "מוחק..." : "מחק פרויקט"}
        </button>
      </div>

      <style jsx>{`
        :global(.ipt-meta) {
          width: 100%;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 14px;
          color: #0f172a;
          outline: none;
          transition: border-color 0.15s, background 0.15s;
        }
        :global(.ipt-meta:focus) {
          border-color: #2b7fff;
          background: white;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

// ── Overview tab ──

function OverviewTab({ project, tasks, communications, timeEntries }: Props) {
  const openTasks = tasks.filter((t) => t.status !== "done").slice(0, 5);
  const recentTime = timeEntries.slice(0, 5);
  const recentComms = communications.slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
        <h3 className="text-[13px] font-bold mb-3">משימות פתוחות</h3>
        {openTasks.length === 0 ? (
          <p className="text-[12px] text-[#94A3B8]">אין משימות פתוחות.</p>
        ) : (
          <ul className="space-y-2">
            {openTasks.map((t) => (
              <li key={t.id} className="text-[13px] text-[#0F172A] flex items-baseline justify-between gap-2">
                <span className="truncate">{t.title}</span>
                {t.dueDate && (
                  <span className="text-[11px] text-[#94A3B8] shrink-0">{fmtDateHe(t.dueDate)}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
        <h3 className="text-[13px] font-bold mb-3">שעות אחרונות</h3>
        {recentTime.length === 0 ? (
          <p className="text-[12px] text-[#94A3B8]">אין רשומות שעות.</p>
        ) : (
          <ul className="space-y-2">
            {recentTime.map((e) => (
              <li key={e.id} className="text-[13px] flex items-baseline justify-between gap-2">
                <span className="text-[#64748B] text-[11px]">{fmtDateHe(e.startedAt)}</span>
                <span className="font-semibold tabular-nums text-[#0F172A]">
                  {fmtHours(e.durationSeconds)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
        <h3 className="text-[13px] font-bold mb-3">תקשורת אחרונה</h3>
        {recentComms.length === 0 ? (
          <p className="text-[12px] text-[#94A3B8]">אין רשומות.</p>
        ) : (
          <ul className="space-y-3">
            {recentComms.map((c) => (
              <li key={c.id} className="text-[13px]">
                <span className="text-[10px] text-[#94A3B8] uppercase">{COMM_KIND_HE[c.kind]} · {fmtDateHe(c.happenedAt)}</span>
                <p className="text-[#0F172A] truncate">{c.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {project.description && (
        <div className="lg:col-span-3 bg-white border border-[#E2E8F0] rounded-xl p-5">
          <h3 className="text-[13px] font-bold mb-2">תיאור פרויקט</h3>
          <p className="text-[13px] text-[#475569] whitespace-pre-wrap leading-relaxed">
            {project.description}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Tasks tab (simple Kanban with status dropdown) ──

const TASK_COLS: { key: Task["status"]; label: string }[] = [
  { key: "todo", label: "לעשות" },
  { key: "in_progress", label: "בתהליך" },
  { key: "blocked", label: "תקוע" },
  { key: "done", label: "הושלם" },
];

function TasksTab({
  project,
  tasks,
  onChange,
}: {
  project: Project;
  tasks: Task[];
  onChange: () => void;
}) {
  const { editingId, startEdit, cancel } = useInlineEdit<number>();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    priority: "medium" as Task["priority"],
    dueDate: "",
  });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: project.id,
        title: form.title,
        priority: form.priority,
        dueDate: form.dueDate || null,
      }),
    });
    if (res.ok) {
      setForm({ title: "", priority: "medium", dueDate: "" });
      setOpen(false);
      onChange();
    }
  }

  async function updateStatus(id: number, status: Task["status"]) {
    await fetch(`/api/admin/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    onChange();
  }

  async function del(id: number) {
    const ok = await confirm({
      title: "למחוק את המשימה?",
      confirmLabel: "מחק",
      destructive: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/tasks/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("המשימה נמחקה");
      onChange();
    } else {
      toast.error("מחיקה נכשלה");
    }
  }

  return (
    <div className="space-y-4">
      {open ? (
        <form
          onSubmit={add}
          className="bg-white border border-[#E2E8F0] rounded-xl p-4 grid grid-cols-1 md:grid-cols-12 gap-3"
        >
          <input
            autoFocus
            required
            placeholder="תיאור המשימה"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="md:col-span-6 border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
          />
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value as Task["priority"] })}
            className="md:col-span-2 border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
          >
            <option value="low">עדיפות נמוכה</option>
            <option value="medium">עדיפות רגילה</option>
            <option value="high">עדיפות גבוהה</option>
          </select>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            className="md:col-span-2 border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
          />
          <div className="md:col-span-2 flex gap-2">
            <button className="flex-1 rounded-full bg-[#2B7FFF] hover:bg-[#1d6fea] text-white text-[13px] font-semibold px-3 py-2">
              הוסף
            </button>
            <button type="button" onClick={() => setOpen(false)} className="text-[13px] text-[#64748B] px-2">
              ביטול
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="text-[13px] font-semibold text-[#2B7FFF] hover:underline"
        >
          + משימה חדשה
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {TASK_COLS.map((col) => {
          const list = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className="bg-[#F1F5F9] rounded-xl p-3 min-h-[200px]">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-2 px-1">
                {col.label} · {list.length}
              </h4>
              <ul className="space-y-2">
                {list.map((t) => {
                  if (editingId === t.id) {
                    return (
                      <li key={t.id}>
                        <TaskEditRow task={t} onCancel={cancel} onSaved={() => { cancel(); onChange(); }} />
                      </li>
                    );
                  }
                  return (
                    <li
                      key={t.id}
                      className="bg-white border border-[#E2E8F0] rounded-lg p-3 text-[13px] group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-medium text-[#0F172A] flex-1 min-w-0">{t.title}</div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => startEdit(t.id)}
                            className="text-[11px] text-[#94A3B8] hover:text-[#2B7FFF]"
                            aria-label="ערוך"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => del(t.id)}
                            className="text-[11px] text-[#94A3B8] hover:text-red-600"
                            aria-label="מחק"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2 gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            t.priority === "high"
                              ? "bg-red-50 text-red-600"
                              : t.priority === "medium"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-[#F1F5F9] text-[#94A3B8]"
                          }`}
                        >
                          {TASK_PRIORITY_HE[t.priority]}
                        </span>
                        {t.dueDate && (
                          <span className="text-[10px] text-[#94A3B8]">{fmtDateHe(t.dueDate)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <select
                          value={t.status}
                          onChange={(e) => updateStatus(t.id, e.target.value as Task["status"])}
                          className="flex-1 border border-[#E2E8F0] rounded text-[11px] bg-[#F8FAFC] px-1.5 py-1"
                        >
                          {Object.entries(TASK_STATUS_HE).map(([k, v]) => (
                            <option key={k} value={k}>
                              {v}
                            </option>
                          ))}
                        </select>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Time tab (list + add manual + timer start) ──

function TimeTab({
  project,
  entries,
  onChange,
}: {
  project: Project;
  entries: TimeEntry[];
  onChange: () => void;
}) {
  const { editingId, startEdit, cancel } = useInlineEdit<number>();
  const [note, setNote] = useState("");

  async function startTimer() {
    const res = await fetch("/api/admin/time/timer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: project.id, note: note || null }),
    });
    if (res.ok) {
      setNote("");
      toast.success("הטיימר התחיל", { description: "נסגר אוטומטית אם תתחיל אחד אחר." });
      onChange();
    } else {
      toast.error("נכשל להתחיל טיימר");
    }
  }

  async function del(id: number) {
    const ok = await confirm({
      title: "למחוק את רשומת השעות?",
      confirmLabel: "מחק",
      destructive: true,
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/time/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("הרשומה נמחקה");
      onChange();
    } else {
      toast.error("מחיקה נכשלה");
    }
  }

  const totalSec = entries.reduce((sum, t) => sum + (t.durationSeconds ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-center gap-3 flex-wrap">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="על מה אני עובד עכשיו? (לא חובה)"
          className="flex-1 min-w-[200px] border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
        />
        <button
          onClick={startTimer}
          className="rounded-full bg-[#2B7FFF] hover:bg-[#1d6fea] text-white text-[13px] font-semibold px-5 py-2"
        >
          ▶ התחל טיימר
        </button>
      </div>

      <ManualTimeEntryForm fixedProjectId={project.id} onDone={onChange} />

      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#F1F5F9]">
          <span className="text-[12px] text-[#64748B]">{entries.length} רשומות</span>
          <span className="text-[13px] font-bold text-[#0F172A] tabular-nums">סה&quot;כ {fmtHours(totalSec)}</span>
        </div>
        {entries.length === 0 ? (
          <p className="px-5 py-8 text-center text-[#94A3B8] text-[13px]">אין רשומות שעות עדיין.</p>
        ) : (
          <ul className="divide-y divide-[#F1F5F9]">
            {entries.map((e) => {
              if (editingId === e.id) {
                return (
                  <li key={e.id} className="px-3 py-2">
                    <TimeEntryEditRow
                      entry={e}
                      onCancel={cancel}
                      onSaved={() => { cancel(); onChange(); }}
                    />
                  </li>
                );
              }
              return (
                <li key={e.id} className="px-5 py-3 flex items-center gap-3 group">
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-[#0F172A] truncate">
                      {e.note || <span className="text-[#94A3B8]">— ללא הערה —</span>}
                    </div>
                    <div className="text-[11px] text-[#94A3B8]">{fmtDateTimeHe(e.startedAt)}</div>
                  </div>
                  <span className="text-[13px] font-semibold tabular-nums text-[#0F172A]">
                    {e.endedAt ? fmtHours(e.durationSeconds) : <span className="text-[#2B7FFF]">פעיל</span>}
                  </span>
                  {e.endedAt && (
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(e.id)}
                        className="text-[12px] text-[#94A3B8] hover:text-[#2B7FFF]"
                        aria-label="ערוך"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => del(e.id)}
                        className="text-[12px] text-[#94A3B8] hover:text-red-600"
                        aria-label="מחק"
                      >
                        🗑
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── Links tab ──

function LinksTab({
  project,
  links,
  onChange,
}: {
  project: Project;
  links: ProjectLink[];
  onChange: () => void;
}) {
  const [form, setForm] = useState({
    label: "",
    url: "",
    kind: "other" as ProjectLink["kind"],
  });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: project.id, ...form }),
    });
    if (res.ok) {
      setForm({ label: "", url: "", kind: "other" });
      onChange();
    }
  }

  async function del(id: number) {
    await fetch(`/api/admin/links/${id}`, { method: "DELETE" });
    onChange();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="bg-white border border-[#E2E8F0] rounded-xl p-4 grid grid-cols-1 md:grid-cols-12 gap-3">
        <input
          required
          placeholder="תווית (למשל: Figma)"
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          className="md:col-span-3 border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
        />
        <input
          required
          type="url"
          placeholder="https://…"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          dir="ltr"
          className="md:col-span-6 border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
        />
        <select
          value={form.kind}
          onChange={(e) => setForm({ ...form, kind: e.target.value as ProjectLink["kind"] })}
          className="md:col-span-2 border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
        >
          <option value="other">אחר</option>
          <option value="figma">Figma</option>
          <option value="drive">Drive</option>
          <option value="github">GitHub</option>
          <option value="notion">Notion</option>
        </select>
        <button className="md:col-span-1 rounded-full bg-[#2B7FFF] text-white text-[13px] font-semibold px-3 py-2">
          הוסף
        </button>
      </form>

      {links.length === 0 ? (
        <p className="text-[13px] text-[#94A3B8] text-center py-6">אין קישורים עדיין.</p>
      ) : (
        <ul className="bg-white border border-[#E2E8F0] rounded-xl divide-y divide-[#F1F5F9] overflow-hidden">
          {links.map((l) => (
            <li key={l.id} className="px-5 py-3 flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F1F5F9] text-[#64748B]">
                {l.kind}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-[#0F172A]">{l.label}</div>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[11px] text-[#2B7FFF] hover:underline truncate block"
                  dir="ltr"
                >
                  {l.url}
                </a>
              </div>
              <button
                onClick={() => del(l.id)}
                className="text-[11px] text-[#94A3B8] hover:text-red-600"
              >
                מחק
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Communications tab (read-only here — add from client page) ──

function CommunicationsTab({ list }: { list: Communication[] }) {
  if (list.length === 0) {
    return <p className="text-[13px] text-[#94A3B8] text-center py-8">אין רשומות תקשורת לפרויקט זה.</p>;
  }
  return (
    <ul className="bg-white border border-[#E2E8F0] rounded-xl divide-y divide-[#F1F5F9] overflow-hidden">
      {list.map((c) => (
        <li key={c.id} className="px-5 py-4">
          <div className="flex items-baseline gap-3 mb-1.5">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                c.kind === "decision"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-[#F1F5F9] text-[#64748B]"
              }`}
            >
              {COMM_KIND_HE[c.kind]}
            </span>
            <span className="text-[12px] text-[#94A3B8]">{fmtDateTimeHe(c.happenedAt)}</span>
          </div>
          <p className="text-[14px] text-[#0F172A] font-medium">{c.summary}</p>
          {c.details && (
            <p className="text-[13px] text-[#64748B] mt-1 whitespace-pre-wrap">{c.details}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
