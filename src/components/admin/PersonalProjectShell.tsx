"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { confirm } from "./ConfirmDialog";
import type {
  PersonalProject,
  PersonalTask,
  PersonalLink,
  PersonalTimeEntry,
} from "@/lib/db/schema";
import { TASK_PRIORITY_HE, fmtDateHe, fmtDateTimeHe, fmtHours } from "@/lib/admin/format";

const TABS: { key: string; label: string }[] = [
  { key: "overview", label: "סקירה" },
  { key: "tasks", label: "משימות" },
  { key: "time", label: "שעות" },
  { key: "links", label: "קישורים" },
];

type Props = {
  project: PersonalProject;
  tab: string;
  tasks: PersonalTask[];
  links: PersonalLink[];
  timeEntries: PersonalTimeEntry[];
};

export default function PersonalProjectShell(props: Props) {
  const { project, tab } = props;
  const router = useRouter();
  const refresh = () => router.refresh();

  return (
    <div className="space-y-5">
      <ProjectMeta project={project} />

      <nav className="flex items-center gap-1 border-b border-[#E2E8F0]" dir="rtl">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <Link
              key={t.key}
              href={`/admin/personal/${project.id}?tab=${t.key}`}
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
      {tab === "tasks" && <TasksTab project={project} tasks={props.tasks} onChange={refresh} />}
      {tab === "time" && <TimeTab project={project} entries={props.timeEntries} onChange={refresh} />}
      {tab === "links" && <LinksTab project={project} links={props.links} onChange={refresh} />}
    </div>
  );
}

// ── Meta (edit name / status / priority / next action / dates / description / delete) ──

function ProjectMeta({ project }: { project: PersonalProject }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: project.name,
    status: project.status,
    priority: project.priority,
    nextAction: project.nextAction ?? "",
    description: project.description ?? "",
    startDate: project.startDate ?? "",
    targetDate: project.targetDate ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/admin/personal-projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        status: form.status,
        priority: form.priority,
        nextAction: form.nextAction || null,
        description: form.description || null,
        startDate: form.startDate || null,
        targetDate: form.targetDate || null,
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
      description: "כל המשימות, השעות והקישורים של הפרויקט יימחקו. אי אפשר להחזיר אחורה.",
      confirmLabel: "מחק פרויקט",
      destructive: true,
    });
    if (!ok) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/personal-projects/${project.id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      toast.success("הפרויקט נמחק");
      router.push("/admin/personal");
      router.refresh();
    } else {
      toast.error("מחיקה נכשלה");
    }
  }

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            onChange={(e) => setForm({ ...form, status: e.target.value as PersonalProject["status"] })}
            className="ipt-meta"
          >
            <option value="idea">רעיון</option>
            <option value="active">פעיל</option>
            <option value="paused">מושהה</option>
            <option value="done">הושלם</option>
            <option value="archived">בארכיון</option>
          </select>
        </Field>
        <Field label="עדיפות">
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value as PersonalProject["priority"] })}
            className="ipt-meta"
          >
            <option value="low">נמוכה</option>
            <option value="medium">רגילה</option>
            <option value="high">גבוהה</option>
          </select>
        </Field>
      </div>

      <Field label="הצעד הבא">
        <input
          value={form.nextAction}
          onChange={(e) => setForm({ ...form, nextAction: e.target.value })}
          placeholder="מה הדבר הבא שצריך לקרות?"
          className="ipt-meta"
        />
      </Field>

      {advancedOpen ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="תאריך התחלה">
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="ipt-meta"
              />
            </Field>
            <Field label="תאריך יעד">
              <input
                type="date"
                value={form.targetDate}
                onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                className="ipt-meta"
              />
            </Field>
          </div>
          <Field label="תיאור / הערות">
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

// ── Overview ──

function OverviewTab({ project, tasks, timeEntries }: Props) {
  const openTasks = tasks.filter((t) => t.status !== "done").slice(0, 6);
  const recentTime = timeEntries.slice(0, 6);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {project.nextAction && (
        <div className="lg:col-span-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#2B7FFF]">הצעד הבא</div>
          <p className="text-[14px] text-[#0F172A] mt-1">{project.nextAction}</p>
        </div>
      )}

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
                  {e.endedAt ? fmtHours(e.durationSeconds) : <span className="text-[#2B7FFF]">פעיל</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
        <h3 className="text-[13px] font-bold mb-3">תאריכים</h3>
        <dl className="space-y-2 text-[13px]">
          <div className="flex justify-between gap-2">
            <dt className="text-[#94A3B8]">התחלה</dt>
            <dd className="text-[#0F172A]">{fmtDateHe(project.startDate)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-[#94A3B8]">יעד</dt>
            <dd className="text-[#0F172A]">{fmtDateHe(project.targetDate)}</dd>
          </div>
        </dl>
      </div>

      {project.description && (
        <div className="lg:col-span-3 bg-white border border-[#E2E8F0] rounded-xl p-5">
          <h3 className="text-[13px] font-bold mb-2">תיאור</h3>
          <p className="text-[13px] text-[#475569] whitespace-pre-wrap leading-relaxed">
            {project.description}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Tasks (kanban with add / status change / delete) ──

const TASK_COLS: { key: PersonalTask["status"]; label: string }[] = [
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
  project: PersonalProject;
  tasks: PersonalTask[];
  onChange: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    priority: "medium" as PersonalTask["priority"],
    dueDate: "",
  });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/personal-tasks", {
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
    } else {
      toast.error("יצירה נכשלה");
    }
  }

  async function setStatus(id: number, status: PersonalTask["status"]) {
    const res = await fetch(`/api/admin/personal-tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) onChange();
    else toast.error("עדכון נכשל");
  }

  async function del(id: number) {
    const ok = await confirm({ title: "למחוק את המשימה?", confirmLabel: "מחק", destructive: true });
    if (!ok) return;
    const res = await fetch(`/api/admin/personal-tasks/${id}`, { method: "DELETE" });
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
            onChange={(e) => setForm({ ...form, priority: e.target.value as PersonalTask["priority"] })}
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
                {list.map((t) => (
                  <li
                    key={t.id}
                    className="bg-white border border-[#E2E8F0] rounded-lg p-3 text-[13px] group hover:border-[#2B7FFF]/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-[#0F172A] flex-1 min-w-0">{t.title}</span>
                      <button
                        onClick={() => del(t.id)}
                        className="text-[11px] text-[#94A3B8] hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        aria-label="מחק"
                      >
                        ✕
                      </button>
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
                    <select
                      value={t.status}
                      onChange={(e) => setStatus(t.id, e.target.value as PersonalTask["status"])}
                      className="mt-2 w-full text-[11px] border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-2 py-1"
                    >
                      {TASK_COLS.map((c) => (
                        <option key={c.key} value={c.key}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Time (live timer + manual + list) ──

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function TimeTab({
  project,
  entries,
  onChange,
}: {
  project: PersonalProject;
  entries: PersonalTimeEntry[];
  onChange: () => void;
}) {
  const [active, setActive] = useState<{ id: number; projectId: number; startedAt: string } | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [note, setNote] = useState("");
  const [manual, setManual] = useState({ date: "", hours: "", note: "" });

  // Load the active personal timer once on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/personal-time/timer", { cache: "no-store" });
        const json = await res.json();
        if (!cancelled) setActive(json.active ?? null);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const startMs = new Date(active.startedAt).getTime();
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [active]);

  const isThisProject = active?.projectId === project.id;

  async function startTimer() {
    const res = await fetch("/api/admin/personal-time/timer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: project.id, note: note || null }),
    });
    if (res.ok) {
      const json = await res.json();
      setActive({ id: json.entry.id, projectId: project.id, startedAt: json.entry.startedAt });
      setNote("");
      toast.success("הטיימר התחיל");
      onChange();
    } else {
      toast.error("נכשל להתחיל טיימר");
    }
  }

  async function stopTimer() {
    const res = await fetch("/api/admin/personal-time/timer", { method: "PATCH" });
    if (res.ok) {
      setActive(null);
      toast.success("הטיימר נעצר");
      onChange();
    } else {
      toast.error("עצירת טיימר נכשלה");
    }
  }

  async function addManual(e: React.FormEvent) {
    e.preventDefault();
    const hours = Number(manual.hours);
    if (!manual.date || !Number.isFinite(hours) || hours <= 0) {
      toast.error("הזן תאריך ומספר שעות");
      return;
    }
    const startedAt = new Date(`${manual.date}T09:00:00`);
    const res = await fetch("/api/admin/personal-time", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: project.id,
        startedAt: startedAt.toISOString(),
        durationSeconds: Math.round(hours * 3600),
        note: manual.note || null,
      }),
    });
    if (res.ok) {
      setManual({ date: "", hours: "", note: "" });
      toast.success("רשומת השעות נוספה");
      onChange();
    } else {
      toast.error("הוספה נכשלה");
    }
  }

  async function del(id: number) {
    const ok = await confirm({ title: "למחוק את רשומת השעות?", confirmLabel: "מחק", destructive: true });
    if (!ok) return;
    const res = await fetch(`/api/admin/personal-time/${id}`, { method: "DELETE" });
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
      {isThisProject ? (
        <div className="rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] p-4 flex items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#2B7FFF] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2B7FFF] animate-pulse" />
              טיימר פעיל
            </span>
            <div
              className="font-mono text-[22px] font-bold text-[#0F172A] tabular-nums mt-1"
              dir="ltr"
            >
              {formatElapsed(elapsed)}
            </div>
          </div>
          <button
            onClick={stopTimer}
            className="rounded-full bg-[#dc2626] hover:bg-[#b91c1c] text-white text-[13px] font-semibold px-5 py-2"
          >
            ⏹ עצור
          </button>
        </div>
      ) : (
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
      )}

      {active && !isThisProject && (
        <p className="text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          יש טיימר פעיל בפרויקט אישי אחר. התחלת טיימר כאן תעצור אותו.
        </p>
      )}

      <form
        onSubmit={addManual}
        className="bg-white border border-[#E2E8F0] rounded-xl p-4 grid grid-cols-1 md:grid-cols-12 gap-3"
      >
        <input
          type="date"
          value={manual.date}
          onChange={(e) => setManual({ ...manual, date: e.target.value })}
          className="md:col-span-3 border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
        />
        <input
          type="number"
          min="0"
          step="0.25"
          placeholder="שעות"
          value={manual.hours}
          onChange={(e) => setManual({ ...manual, hours: e.target.value })}
          className="md:col-span-2 border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px] tabular-nums"
        />
        <input
          placeholder="הערה (לא חובה)"
          value={manual.note}
          onChange={(e) => setManual({ ...manual, note: e.target.value })}
          className="md:col-span-5 border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
        />
        <button className="md:col-span-2 rounded-full bg-[#0F172A] hover:bg-[#1e293b] text-white text-[13px] font-semibold px-3 py-2">
          + רשומה ידנית
        </button>
      </form>

      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#F1F5F9]">
          <span className="text-[12px] text-[#64748B]">{entries.length} רשומות</span>
          <span className="text-[13px] font-bold text-[#0F172A] tabular-nums">
            סה&quot;כ {fmtHours(totalSec)}
          </span>
        </div>
        {entries.length === 0 ? (
          <p className="px-5 py-8 text-center text-[#94A3B8] text-[13px]">אין רשומות שעות עדיין.</p>
        ) : (
          <ul className="divide-y divide-[#F1F5F9]">
            {entries.map((e) => (
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
                  <button
                    onClick={() => del(e.id)}
                    className="text-[12px] text-[#94A3B8] hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="מחק"
                  >
                    🗑
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── Links ──

function LinksTab({
  project,
  links,
  onChange,
}: {
  project: PersonalProject;
  links: PersonalLink[];
  onChange: () => void;
}) {
  const [form, setForm] = useState({
    label: "",
    url: "",
    kind: "other" as PersonalLink["kind"],
  });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/personal-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: project.id, ...form }),
    });
    if (res.ok) {
      setForm({ label: "", url: "", kind: "other" });
      onChange();
    } else {
      toast.error("הוספה נכשלה");
    }
  }

  async function del(id: number) {
    await fetch(`/api/admin/personal-links/${id}`, { method: "DELETE" });
    onChange();
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={add}
        className="bg-white border border-[#E2E8F0] rounded-xl p-4 grid grid-cols-1 md:grid-cols-12 gap-3"
      >
        <input
          required
          placeholder="תווית (למשל: ריפו)"
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
          onChange={(e) => setForm({ ...form, kind: e.target.value as PersonalLink["kind"] })}
          className="md:col-span-2 border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
        >
          <option value="other">אחר</option>
          <option value="github">GitHub</option>
          <option value="figma">Figma</option>
          <option value="drive">Drive</option>
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
              <button onClick={() => del(l.id)} className="text-[11px] text-[#94A3B8] hover:text-red-600">
                מחק
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
