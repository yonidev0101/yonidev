"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { confirm } from "./ConfirmDialog";
import { useElapsed } from "@/lib/admin/useLiveTimer";
import { timeTotals } from "@/lib/admin/time";
import TaskQuickAdd from "./TaskQuickAdd";
import TaskTypeTag from "./TaskTypeTag";
import TagChip, { type TagLite } from "./TagChip";
import ProjectTagManager from "./ProjectTagManager";
import { LinkKindTag, LinkKindOptions } from "./LinkKindTag";
import type {
  PersonalProject,
  PersonalTask,
  PersonalLink,
  PersonalTimeEntry,
} from "@/lib/db/schema";
import {
  TASK_PRIORITY_HE,
  TASK_STATUS_HE,
  TASK_STATUS_TONE,
  TASK_PRIORITY_DOT,
  PERSONAL_TASK_STATUS_ORDER,
  PERSONAL_TASK_TYPE_ORDER,
  PERSONAL_TASK_TYPE_HE,
  PERSONAL_TASK_TYPE_ICON,
  personalTaskSection,
  personalActiveRank,
  detectLinkKind,
  fmtDateHe,
  fmtDateTimeHe,
  fmtHours,
  tagTone,
} from "@/lib/admin/format";

/** Task rows carry checklist progress and tags from the query, for the badges. */
type TaskRow = PersonalTask & { stepsTotal: number; stepsDone: number; tags: TagLite[] };

type Props = {
  project: PersonalProject;
  tab: string;
  tasks: TaskRow[];
  links: PersonalLink[];
  timeEntries: PersonalTimeEntry[];
  /** The project's tag catalogue — what the filter row and manager offer. */
  tags: TagLite[];
};

export default function PersonalProjectShell(props: Props) {
  const { project, tab } = props;
  const router = useRouter();
  const refresh = () => router.refresh();
  const activeTab = tab === "time" ? "time" : "tasks";

  // Live meta so each tab announces what's inside before you click it.
  const openTaskCount = props.tasks.filter(
    (t) => t.status !== "done" && t.status !== "canceled",
  ).length;
  const totalTimeSec = props.timeEntries.reduce((s, e) => s + (e.durationSeconds ?? 0), 0);

  const tabs = [
    { key: "tasks", icon: "✓", label: "משימות", meta: `${openTaskCount} פתוחות` },
    { key: "time", icon: "⏱", label: "זמן", meta: fmtHours(totalTimeSec) },
  ];

  return (
    <div className="space-y-5">
      <ProjectMeta project={project} links={props.links} onChange={refresh} />

      <nav className="flex items-center gap-1 border-b border-[#E2E8F0]" dir="rtl">
        {tabs.map((t) => {
          const active = activeTab === t.key;
          return (
            <Link
              key={t.key}
              href={`/admin/personal/${project.id}?tab=${t.key}`}
              scroll={false}
              className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold border-b-2 -mb-px transition ${
                active
                  ? "border-[#2B7FFF] text-[#2B7FFF]"
                  : "border-transparent text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <span aria-hidden>{t.icon}</span>
              {t.label}
              <span
                className={`text-[11px] font-bold tabular-nums rounded-full px-1.5 py-0.5 ${
                  active ? "bg-[#EFF6FF] text-[#2B7FFF]" : "bg-[#F1F5F9] text-[#94A3B8]"
                }`}
              >
                {t.meta}
              </span>
            </Link>
          );
        })}
      </nav>

      {activeTab === "tasks" && (
        <TasksTab
          project={project}
          tasks={props.tasks}
          tags={props.tags}
          onChange={refresh}
        />
      )}
      {activeTab === "time" && (
        <TimeTab
          project={project}
          entries={props.timeEntries}
          tasks={props.tasks}
          onChange={refresh}
        />
      )}
    </div>
  );
}

// ── Meta (edit name / status / priority / next action / dates / description / links / delete) ──

function ProjectMeta({
  project,
  links,
  onChange,
}: {
  project: PersonalProject;
  links: PersonalLink[];
  onChange: () => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(formFrom(project));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function openEdit() {
    // Seed the form from the freshest project data whenever edit opens.
    setForm(formFrom(project));
    setEditing(true);
  }

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
      setEditing(false);
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

  // ── Display mode (default) — a clean read view, edit behind a button. ──
  if (!editing) {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4" dir="rtl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
              הצעד הבא
            </div>
            {project.nextAction ? (
              <p className="text-[15px] font-medium text-[#0F172A]">→ {project.nextAction}</p>
            ) : (
              <p className="text-[13px] text-[#94A3B8]">אין צעד הבא מוגדר</p>
            )}
          </div>
          <button
            onClick={openEdit}
            className="shrink-0 text-[12px] font-semibold text-[#94A3B8] hover:text-[#2B7FFF]"
          >
            ✎ ערוך פרטים
          </button>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-[13px] border-t border-[#F1F5F9] pt-3">
          <MetaItem k="עדיפות" v={TASK_PRIORITY_HE[project.priority]} />
          {project.startDate && <MetaItem k="התחלה" v={fmtDateHe(project.startDate)} />}
          {project.targetDate && <MetaItem k="יעד" v={fmtDateHe(project.targetDate)} />}
        </div>

        {project.description && (
          <p className="text-[13px] text-[#475569] whitespace-pre-wrap leading-relaxed border-t border-[#F1F5F9] pt-3">
            {project.description}
          </p>
        )}

        {links.length > 0 && (
          <div className="flex items-center flex-wrap gap-2 border-t border-[#F1F5F9] pt-3">
            {links.map((l) => (
              <a
                key={l.id}
                href={l.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 text-[12px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-full px-2.5 py-1 text-[#2B7FFF] hover:border-[#2B7FFF]/40"
              >
                {l.label}
                <LinkKindTag kind={l.kind} className="text-[10px] text-[#94A3B8]" />
              </a>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Edit mode ──
  return (
    <div className="bg-white border border-[#2B7FFF]/30 ring-1 ring-[#2B7FFF]/10 rounded-xl p-5 space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-bold text-[#0F172A]">עריכת פרטי הפרויקט</span>
        <button
          onClick={() => setEditing(false)}
          className="text-[13px] text-[#94A3B8] hover:text-[#0F172A]"
          aria-label="סגור"
        >
          ✕
        </button>
      </div>

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

      {/* Links are managed here, in edit mode. */}
      <Field label="קישורים">
        <LinksInline projectId={project.id} links={links} onChange={onChange} />
      </Field>

      <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#F1F5F9]">
        <div className="flex items-center gap-2">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-full bg-[#2B7FFF] hover:bg-[#1d6fea] disabled:opacity-50 text-white text-[13px] font-semibold px-5 py-2"
          >
            {saving ? "שומר..." : "שמור"}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="text-[13px] text-[#64748B] hover:text-[#0F172A] px-2"
          >
            ביטול
          </button>
        </div>
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

function formFrom(project: PersonalProject) {
  return {
    name: project.name,
    status: project.status,
    priority: project.priority,
    nextAction: project.nextAction ?? "",
    description: project.description ?? "",
    startDate: project.startDate ?? "",
    targetDate: project.targetDate ?? "",
  };
}

function MetaItem({ k, v }: { k: string; v: string }) {
  return (
    <span className="text-[#0F172A]">
      <span className="text-[#94A3B8]">{k}: </span>
      {v}
    </span>
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

// ── Links (inline, compact — replaces the old links tab) ──

function LinksInline({
  projectId,
  links,
  onChange,
}: {
  projectId: number;
  links: PersonalLink[];
  onChange: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    label: "",
    url: "",
    kind: "other" as PersonalLink["kind"],
  });
  // Once the user picks a kind by hand, stop overriding it from the URL.
  const [kindTouched, setKindTouched] = useState(false);

  function onUrlChange(url: string) {
    setForm((f) => ({
      ...f,
      url,
      kind: kindTouched ? f.kind : (detectLinkKind(url) ?? f.kind),
    }));
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/personal-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, ...form }),
    });
    if (res.ok) {
      setForm({ label: "", url: "", kind: "other" });
      setKindTouched(false);
      setAdding(false);
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
    <div>
      <div className="flex items-center flex-wrap gap-2">
        {links.map((l) => (
          <span
            key={l.id}
            className="group inline-flex items-center gap-1.5 text-[12px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-full pl-1 pr-2.5 py-1"
          >
            <a
              href={l.url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-[#2B7FFF] hover:underline font-medium"
            >
              {l.label}
            </a>
            <LinkKindTag kind={l.kind} className="text-[10px] text-[#94A3B8]" />
            <button
              onClick={() => del(l.id)}
              className="text-[#CBD5E1] hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="מחק קישור"
            >
              ✕
            </button>
          </span>
        ))}
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="text-[12px] font-semibold text-[#94A3B8] hover:text-[#2B7FFF] border border-dashed border-[#E2E8F0] rounded-full px-3 py-1"
          >
            + קישור
          </button>
        )}
      </div>

      {adding && (
        <form onSubmit={add} className="grid grid-cols-1 md:grid-cols-12 gap-2 mt-2">
          <input
            required
            placeholder="תווית (ריפו, Figma…)"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            className="md:col-span-3 border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[13px]"
          />
          <input
            required
            type="url"
            placeholder="https://…"
            value={form.url}
            onChange={(e) => onUrlChange(e.target.value)}
            dir="ltr"
            className="md:col-span-5 border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[13px]"
          />
          <select
            value={form.kind}
            onChange={(e) => {
              setKindTouched(true);
              setForm({ ...form, kind: e.target.value as PersonalLink["kind"] });
            }}
            className="md:col-span-2 border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[13px]"
          >
            <LinkKindOptions />
          </select>
          <button className="md:col-span-1 rounded-md bg-[#2B7FFF] text-white text-[13px] font-semibold px-3 py-2">
            הוסף
          </button>
          <button
            type="button"
            onClick={() => setAdding(false)}
            className="md:col-span-1 text-[12px] text-[#64748B] hover:text-[#0F172A]"
          >
            ביטול
          </button>
        </form>
      )}
    </div>
  );
}

// ── Tasks (focus strip + one clean grouped list) ──

function TasksTab({
  project,
  tasks,
  tags,
  onChange,
}: {
  project: PersonalProject;
  tasks: TaskRow[];
  tags: TagLite[];
  onChange: () => void;
}) {
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

  // One-click "work on this" — starts a timer on this task, alongside any others.
  async function startTimer(id: number) {
    const res = await fetch("/api/admin/personal-time/timer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: project.id, taskId: id, note: null }),
    });
    if (res.ok) {
      toast.success("הטיימר התחיל — עבור לטאב זמן");
      onChange();
    } else if (res.status === 409) {
      toast.error("כבר רץ טיימר על המשימה הזו");
    } else {
      toast.error("נכשל להתחיל טיימר");
    }
  }

  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  // Tag filters stack: picking two tags shows tasks carrying *both*, which is
  // how you find "the PWA work on the info page" rather than either of them.
  const [tagFilter, setTagFilter] = useState<number[]>([]);

  // Count open tasks per type / tag — drives the filter-chip badges.
  const openTasks = tasks.filter((t) => personalTaskSection(t.status) === "active");
  const typeCounts = new Map<string, number>();
  for (const t of openTasks) typeCounts.set(t.type, (typeCounts.get(t.type) ?? 0) + 1);
  const tagCounts = new Map<number, number>();
  for (const t of openTasks) {
    for (const tag of t.tags) tagCounts.set(tag.id, (tagCounts.get(tag.id) ?? 0) + 1);
  }
  // Usage across *all* tasks, so the manager's delete warning is honest.
  const tagUsage: Record<number, number> = {};
  for (const t of tasks) for (const tag of t.tags) tagUsage[tag.id] = (tagUsage[tag.id] ?? 0) + 1;

  const matchesFilter = (t: TaskRow) => {
    if (typeFilter !== null && t.type !== typeFilter) return false;
    if (tagFilter.length) {
      const own = new Set(t.tags.map((tag) => tag.id));
      if (!tagFilter.every((id) => own.has(id))) return false;
    }
    return true;
  };
  const toggleTag = (id: number) =>
    setTagFilter((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const active = tasks
    .filter((t) => personalTaskSection(t.status) === "active" && matchesFilter(t))
    .sort((a, b) => {
      const r = personalActiveRank(a.status) - personalActiveRank(b.status);
      if (r !== 0) return r;
      const p = priorityWeight(b.priority) - priorityWeight(a.priority);
      if (p !== 0) return p;
      return +new Date(b.createdAt) - +new Date(a.createdAt);
    });
  const done = tasks.filter((t) => t.status === "done" && matchesFilter(t));
  const canceled = tasks.filter((t) => t.status === "canceled" && matchesFilter(t));

  // Focus: what am I on now — the working task, else the top-priority todo.
  const focus =
    active.find((t) => t.status === "in_progress") ??
    active.find((t) => t.status === "todo") ??
    null;

  return (
    <div className="space-y-4">
      {focus && <FocusStrip task={focus} />}

      <TaskQuickAdd
        projects={[]}
        fixedProjectId={project.id}
        fixedDomain="personal"
        enableType
        onCreated={onChange}
      />

      {typeCounts.size > 1 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <FilterChip
            label="הכל"
            count={openTasks.length}
            active={typeFilter === null}
            onClick={() => setTypeFilter(null)}
          />
          {PERSONAL_TASK_TYPE_ORDER.filter((t) => typeCounts.has(t)).map((t) => (
            <FilterChip
              key={t}
              label={`${PERSONAL_TASK_TYPE_ICON[t]} ${PERSONAL_TASK_TYPE_HE[t]}`}
              count={typeCounts.get(t) ?? 0}
              active={typeFilter === t}
              onClick={() => setTypeFilter(typeFilter === t ? null : t)}
            />
          ))}
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#CBD5E1]">
            תגיות
          </span>
          {tags.map((tag) => {
            const on = tagFilter.includes(tag.id);
            const count = tagCounts.get(tag.id) ?? 0;
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                aria-pressed={on}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                  on
                    ? "bg-[#0F172A] text-white border-transparent"
                    : `${tagTone(tag.color)} hover:brightness-95`
                }`}
              >
                {tag.label}
                <span className={`tabular-nums ${on ? "text-white/60" : "opacity-60"}`}>
                  {count}
                </span>
              </button>
            );
          })}
          {tagFilter.length > 0 && (
            <button
              type="button"
              onClick={() => setTagFilter([])}
              className="text-[11px] font-semibold text-[#94A3B8] hover:text-[#2B7FFF] px-1"
            >
              נקה
            </button>
          )}
        </div>
      )}

      <ProjectTagManager projectId={project.id} tags={tags} usage={tagUsage} />

      {active.length === 0 && done.length === 0 && canceled.length === 0 ? (
        <p className="text-[13px] text-[#94A3B8] bg-white border border-[#E2E8F0] rounded-xl py-10 text-center">
          {typeFilter || tagFilter.length
            ? "אין משימות שתואמות את הסינון."
            : "עוד אין משימות. הוסף את הראשונה למעלה."}
        </p>
      ) : (
        <>
          <TaskGroup
            title="פעילות"
            count={active.length}
            tasks={active}
            onStatus={setStatus}
            onDelete={del}
            onStart={startTimer}
            defaultOpen
          />
          {done.length > 0 && (
            <TaskGroup
              title="הושלמו"
              count={done.length}
              tasks={done}
              onStatus={setStatus}
              onDelete={del}
            />
          )}
          {canceled.length > 0 && (
            <TaskGroup
              title="בוטלו"
              count={canceled.length}
              tasks={canceled}
              onStatus={setStatus}
              onDelete={del}
            />
          )}
        </>
      )}
    </div>
  );
}

function priorityWeight(p: string): number {
  return p === "high" ? 3 : p === "medium" ? 2 : 1;
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold border transition ${
        active
          ? "bg-[#0F172A] text-white border-transparent"
          : "bg-white text-[#64748B] border-[#E2E8F0] hover:text-[#0F172A] hover:border-[#CBD5E1]"
      }`}
    >
      {label}
      <span className={`tabular-nums ${active ? "text-white/70" : "text-[#94A3B8]"}`}>
        {count}
      </span>
    </button>
  );
}

function FocusStrip({ task }: { task: TaskRow }) {
  const working = task.status === "in_progress";
  return (
    <Link
      href={`/admin/personal/tasks/${task.id}`}
      className={`block rounded-xl border px-5 py-4 transition hover:brightness-[0.99] ${
        working ? "bg-[#F5F3FF] border-[#DDD6FE]" : "bg-[#EFF6FF] border-[#BFDBFE]"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${
            working ? "text-[#7C3AED]" : "text-[#2B7FFF]"
          }`}
        >
          {working && <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-pulse" />}
          {working ? "על מה אני עכשיו" : "הבא בתור"}
        </span>
        <TaskTypeTag type={task.type} />
        {task.tags.map((tag) => (
          <TagChip key={tag.id} tag={tag} size="xs" />
        ))}
        {task.stepsTotal > 0 && (
          <span className="text-[11px] text-[#64748B] tabular-nums">
            ✔ {task.stepsDone}/{task.stepsTotal}
          </span>
        )}
      </div>
      <div className="text-[15px] font-semibold text-[#0F172A] mt-1">{task.title}</div>
      {task.nextAction && (
        <div className="text-[13px] text-[#475569] mt-0.5">→ {task.nextAction}</div>
      )}
      <span className="inline-block mt-2 text-[12px] font-semibold text-[#2B7FFF]">
        {working ? "המשך לעבוד ←" : "פתח משימה ←"}
      </span>
    </Link>
  );
}

function TaskGroup({
  title,
  count,
  tasks,
  onStatus,
  onDelete,
  onStart,
  defaultOpen = false,
}: {
  title: string;
  count: number;
  tasks: TaskRow[];
  onStatus: (id: number, status: PersonalTask["status"]) => void;
  onDelete: (id: number) => void;
  onStart?: (id: number) => void;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group">
      <summary className="flex items-center gap-2 cursor-pointer list-none select-none py-1.5">
        <svg
          className="w-3 h-3 text-[#94A3B8] transition-transform group-open:rotate-90"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
          {title} · {count}
        </span>
      </summary>
      <ul className="mt-2 bg-white border border-[#E2E8F0] rounded-xl divide-y divide-[#F1F5F9] overflow-hidden">
        {tasks.map((t) => (
          <TaskListRow
            key={t.id}
            task={t}
            onStatus={onStatus}
            onDelete={onDelete}
            onStart={onStart}
          />
        ))}
      </ul>
    </details>
  );
}

function TaskListRow({
  task,
  onStatus,
  onDelete,
  onStart,
}: {
  task: TaskRow;
  onStatus: (id: number, status: PersonalTask["status"]) => void;
  onDelete: (id: number) => void;
  onStart?: (id: number) => void;
}) {
  const closed = task.status === "done" || task.status === "canceled";
  return (
    <li className="group flex items-center gap-3 px-4 py-3 hover:bg-[#F8FAFC] transition-colors">
      <span
        className={`shrink-0 w-1.5 h-1.5 rounded-full ${TASK_PRIORITY_DOT[task.priority]}`}
        aria-hidden
      />
      <TaskTypeTag type={task.type} iconOnly />
      <div className="flex-1 min-w-0">
        <Link
          href={`/admin/personal/tasks/${task.id}`}
          className={`block text-[14px] font-medium truncate hover:text-[#2B7FFF] ${
            closed ? "text-[#94A3B8]" : "text-[#0F172A]"
          } ${task.status === "canceled" ? "line-through" : ""}`}
        >
          {task.title}
        </Link>
        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#94A3B8]">
          {task.tags.map((tag) => (
            <TagChip key={tag.id} tag={tag} size="xs" />
          ))}
          {task.stepsTotal > 0 && (
            <span className="tabular-nums">✔ {task.stepsDone}/{task.stepsTotal}</span>
          )}
          {task.nextAction && !closed && (
            <span className="truncate text-[#64748B]">→ {task.nextAction}</span>
          )}
          {task.dueDate && <span className="tabular-nums">{fmtDateHe(task.dueDate)}</span>}
        </div>
      </div>

      {onStart && !closed && (
        <button
          onClick={() => onStart(task.id)}
          title="התחל טיימר על המשימה"
          aria-label="התחל טיימר על המשימה"
          className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-[#2B7FFF] border border-[#BFDBFE] bg-[#EFF6FF] hover:bg-[#2B7FFF] hover:text-white rounded-full px-2.5 py-1 transition-colors"
        >
          ▶ עבוד
        </button>
      )}

      <span
        className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${TASK_STATUS_TONE[task.status]}`}
      >
        {TASK_STATUS_HE[task.status]}
      </span>

      <select
        value={task.status}
        onChange={(e) => onStatus(task.id, e.target.value as PersonalTask["status"])}
        aria-label="שנה סטטוס"
        className="shrink-0 text-[11px] border border-[#E2E8F0] rounded-md bg-white px-1.5 py-1 text-[#64748B]"
      >
        {PERSONAL_TASK_STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {TASK_STATUS_HE[s]}
          </option>
        ))}
      </select>

      <button
        onClick={() => onDelete(task.id)}
        className="shrink-0 text-[12px] text-[#CBD5E1] hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="מחק"
      >
        ✕
      </button>
    </li>
  );
}

// ── Time (live timer + manual + list) — unchanged behaviour ──

function TimeTab({
  project,
  entries,
  tasks,
  onChange,
}: {
  project: PersonalProject;
  entries: PersonalTimeEntry[];
  tasks: TaskRow[];
  onChange: () => void;
}) {
  const [actives, setActives] = useState<ActiveTimerRow[]>([]);
  const [note, setNote] = useState("");
  const [taskId, setTaskId] = useState("");
  const [manual, setManual] = useState({ taskId: "", date: "", hours: "", note: "" });

  // Task-first: every timer/entry hangs off a task. Live work uses open tasks;
  // manual backfill can also target a just-finished (done) task, never a canceled one.
  const openTasks = tasks.filter((t) => t.status !== "done" && t.status !== "canceled");
  const manualTasks = tasks.filter((t) => t.status !== "canceled");
  const taskTitleById = new Map(tasks.map((t) => [t.id, t.title]));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/personal-time/timer", { cache: "no-store" });
        const json = await res.json();
        if (!cancelled) setActives(Array.isArray(json.active) ? json.active : []);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Several tasks can be timed at once — split what's mine from what's elsewhere.
  const projectActives = actives.filter((a) => a.projectId === project.id);
  const elsewhere = actives.length - projectActives.length;
  const runningTaskIds = new Set(actives.map((a) => a.taskId).filter(Boolean));
  const startableTasks = openTasks.filter((t) => !runningTaskIds.has(t.id));

  async function startTimer() {
    if (!taskId) {
      toast.error("בחר משימה כדי להתחיל");
      return;
    }
    const tid = Number(taskId);
    const res = await fetch("/api/admin/personal-time/timer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: project.id,
        taskId: tid,
        note: note || null,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      setActives((prev) => [
        {
          id: json.entry.id,
          projectId: project.id,
          startedAt: json.entry.startedAt,
          taskId: tid,
          taskTitle: taskTitleById.get(tid) ?? null,
        },
        ...prev,
      ]);
      setNote("");
      setTaskId("");
      toast.success("הטיימר התחיל");
      onChange();
    } else if (res.status === 409) {
      toast.error("כבר רץ טיימר על המשימה הזו");
    } else {
      toast.error("נכשל להתחיל טיימר");
    }
  }

  async function stopTimer(entryId: number) {
    const res = await fetch("/api/admin/personal-time/timer", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: entryId }),
    });
    if (res.ok) {
      setActives((prev) => prev.filter((a) => a.id !== entryId));
      toast.success("הטיימר נעצר");
      onChange();
    } else {
      toast.error("עצירת טיימר נכשלה");
    }
  }

  async function addManual(e: React.FormEvent) {
    e.preventDefault();
    const hours = Number(manual.hours);
    if (!manual.taskId) {
      toast.error("בחר משימה");
      return;
    }
    if (!manual.date || !Number.isFinite(hours) || hours <= 0) {
      toast.error("הזן תאריך ומספר שעות");
      return;
    }
    const startedAt = new Date(`${manual.date}T09:00:00`);
    const durationSeconds = Math.round(hours * 3600);
    const res = await fetch("/api/admin/personal-time", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: project.id,
        taskId: Number(manual.taskId),
        startedAt: startedAt.toISOString(),
        // Backfilled hours are finished work — give them an end, so nothing
        // mistakes them for a timer that's still running.
        endedAt: new Date(startedAt.getTime() + durationSeconds * 1000).toISOString(),
        durationSeconds,
        note: manual.note || null,
      }),
    });
    if (res.ok) {
      setManual({ taskId: "", date: "", hours: "", note: "" });
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

  // Two numbers, on purpose: `wall` is time actually spent (parallel timers
  // counted once), `raw` is the sum across tasks. They differ when work overlapped.
  const { raw: rawSec, wall: wallSec, overlap: overlapSec } = timeTotals(entries);

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <TimeSection
          icon="⏱"
          title="מעקב עכשיו"
          subtitle="בוחרים משימה ומתחילים — אפשר כמה משימות במקביל, כל אחת עם הטיימר שלה."
        />
      {projectActives.length > 0 && (
        <div className="space-y-2">
          {projectActives.map((a) => (
            <RunningTimerCard
              key={a.id}
              startedAt={a.startedAt}
              title={
                a.taskTitle ?? (a.taskId ? taskTitleById.get(a.taskId) : null) ?? "משימה"
              }
              onStop={() => stopTimer(a.id)}
            />
          ))}
        </div>
      )}

      {startableTasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-white px-5 py-6 text-center">
          <p className="text-[13px] text-[#64748B]">
            {openTasks.length === 0
              ? "אין משימות פתוחות לעבוד עליהן."
              : "כל המשימות הפתוחות כבר מתוזמנות."}
          </p>
          <p className="text-[12px] text-[#94A3B8] mt-1">
            כל זמן נרשם על משימה — פתח משימה בטאב <span className="font-semibold">משימות</span> כדי להתחיל.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3">
          <label className="block">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
              על איזו משימה אתה מתחיל?
            </span>
            <select
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
            >
              <option value="">— בחר משימה —</option>
              {startableTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="הערה לסשן — מה בדיוק עכשיו? (לא חובה)"
              className="flex-1 min-w-[200px] border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
            />
            <button
              onClick={startTimer}
              disabled={!taskId}
              className="rounded-full bg-[#2B7FFF] hover:bg-[#1d6fea] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-semibold px-5 py-2"
            >
              ▶ התחל טיימר
            </button>
          </div>
        </div>
      )}

      {elsewhere > 0 && (
        <p className="text-[12px] text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2">
          רצים עוד {elsewhere} טיימרים בפרויקטים אחרים — הם ממשיכים לרוץ.
        </p>
      )}
      </section>

      <section className="space-y-2">
        <TimeSection
          icon="✍️"
          title="רישום ידני"
          subtitle="עבדת בלי טיימר? הוסף שעות לפי תאריך בדיעבד."
        />
      {manualTasks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#CBD5E1] bg-white px-5 py-6 text-center text-[13px] text-[#94A3B8]">
          אין משימות לשייך אליהן זמן. פתח משימה בטאב משימות קודם.
        </p>
      ) : (
      <form
        onSubmit={addManual}
        className="bg-white border border-[#E2E8F0] rounded-xl p-4 grid grid-cols-1 md:grid-cols-12 gap-3"
      >
        <select
          value={manual.taskId}
          onChange={(e) => setManual({ ...manual, taskId: e.target.value })}
          className="md:col-span-12 border border-[#E2E8F0] rounded-md bg-[#F8FAFC] px-3 py-2 text-[14px]"
        >
          <option value="">— בחר משימה —</option>
          {manualTasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
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
      )}
      </section>

      <section className="space-y-2">
        <TimeSection icon="📜" title="היסטוריה" subtitle="כל הזמן שנרשם על הפרויקט הזה." />
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#F1F5F9]">
          <span className="text-[12px] text-[#64748B]">{entries.length} רשומות</span>
          <span className="text-[13px] font-bold text-[#0F172A] tabular-nums text-left">
            {fmtHours(wallSec)} עבודה
            {overlapSec > 0 && (
              <span className="block text-[11px] font-normal text-[#94A3B8]">
                {fmtHours(rawSec)} על פני המשימות · {fmtHours(overlapSec)} במקביל
              </span>
            )}
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
                    {e.taskId && taskTitleById.get(e.taskId) ? (
                      taskTitleById.get(e.taskId)
                    ) : e.note ? (
                      e.note
                    ) : (
                      <span className="text-[#94A3B8]">— ללא הערה —</span>
                    )}
                  </div>
                  {e.taskId && e.note && (
                    <div className="text-[12px] text-[#64748B] truncate">{e.note}</div>
                  )}
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
      </section>
    </div>
  );
}

/** Small labelled header that tells the user what a block of the Time tab is for. */
function TimeSection({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <h3 className="flex items-center gap-1.5 text-[13px] font-bold text-[#0F172A]">
        <span aria-hidden>{icon}</span>
        {title}
      </h3>
      <p className="text-[11px] text-[#94A3B8] mt-0.5">{subtitle}</p>
    </div>
  );
}

interface ActiveTimerRow {
  id: number;
  projectId: number;
  startedAt: string;
  taskId?: number | null;
  taskTitle?: string | null;
}

/** One running timer. Each keeps its own tick, so several can run side by side. */
function RunningTimerCard({
  startedAt,
  title,
  onStop,
}: {
  startedAt: string;
  title: string;
  onStop: () => void;
}) {
  const elapsed = useElapsed(startedAt);
  return (
    <div className="rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] p-4 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#2B7FFF] uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2B7FFF] animate-pulse" />
          עובד על
        </span>
        <div className="text-[14px] font-semibold text-[#0F172A] truncate mt-0.5">{title}</div>
        <div className="font-mono text-[22px] font-bold text-[#0F172A] tabular-nums mt-1" dir="ltr">
          {formatElapsed(elapsed)}
        </div>
      </div>
      <button
        onClick={onStop}
        className="rounded-full bg-[#dc2626] hover:bg-[#b91c1c] text-white text-[13px] font-semibold px-5 py-2 shrink-0"
      >
        ⏹ עצור
      </button>
    </div>
  );
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}
