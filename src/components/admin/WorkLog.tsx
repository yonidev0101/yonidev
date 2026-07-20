import Link from "next/link";
import { fmtHours } from "@/lib/admin/format";

export interface LogEntry {
  key: string;
  kind: "personal" | "client";
  href: string;
  projectName: string;
  subtitle: string | null;
  taskTitle: string | null;
  /** Set for personal sessions bound to a task — links into that task's journal. */
  taskHref: string | null;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  note: string | null;
}

// Everything is grouped and labelled in Israel time explicitly — the server runs
// in UTC on Vercel, which would otherwise push late-evening sessions to the next day.
const TZ = "Asia/Jerusalem";

const dayKeyFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const dayLabelFmt = new Intl.DateTimeFormat("he-IL", {
  timeZone: TZ,
  weekday: "long",
  day: "numeric",
  month: "long",
});
const timeFmt = new Intl.DateTimeFormat("he-IL", {
  timeZone: TZ,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function dayKey(iso: string): string {
  return dayKeyFmt.format(new Date(iso));
}

function relativeDayLabel(key: string, todayKey: string): string | null {
  if (key === todayKey) return "היום";
  const yesterday = dayKeyFmt.format(new Date(Date.now() - 86_400_000));
  if (key === yesterday) return "אתמול";
  return null;
}

const RANGE_OPTIONS: { days: number; label: string }[] = [
  { days: 7, label: "7 ימים" },
  { days: 30, label: "30 יום" },
  { days: 90, label: "90 יום" },
  { days: 0, label: "הכל" },
];

const KIND_OPTIONS: { kind: string; label: string }[] = [
  { kind: "all", label: "הכל" },
  { kind: "personal", label: "אישי" },
  { kind: "client", label: "לקוחות" },
];

export default function WorkLog({
  entries,
  days,
  kind,
}: {
  entries: LogEntry[];
  days: number;
  kind: string;
}) {
  const todayKey = dayKeyFmt.format(new Date());

  // Group into days, preserving the newest-first order of `entries`.
  const groups: { key: string; entries: LogEntry[]; totalSec: number }[] = [];
  for (const e of entries) {
    const k = dayKey(e.startedAt);
    let g = groups.find((x) => x.key === k);
    if (!g) {
      g = { key: k, entries: [], totalSec: 0 };
      groups.push(g);
    }
    g.entries.push(e);
    g.totalSec += e.durationSeconds ?? 0;
  }

  const totalSec = groups.reduce((s, g) => s + g.totalSec, 0);
  const maxDaySec = Math.max(1, ...groups.map((g) => g.totalSec));
  const avgPerDay = groups.length ? Math.round(totalSec / groups.length) : 0;

  return (
    <div dir="rtl" className="space-y-6 max-w-4xl">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight">יומן עבודה</h1>
        <p className="text-[#64748B] text-sm mt-1">
          כל מה שעבדת עליו, לפי תאריך ושעה — מתי התחלת, כמה זמן, ועל מה.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="סה״כ בטווח" value={fmtHours(totalSec)} />
        <Stat label="ימי עבודה" value={String(groups.length)} />
        <Stat label="ממוצע ליום פעיל" value={fmtHours(avgPerDay)} />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <FilterGroup>
          {KIND_OPTIONS.map((o) => (
            <FilterLink
              key={o.kind}
              href={`/admin/log?days=${days}&kind=${o.kind}`}
              active={kind === o.kind}
            >
              {o.label}
            </FilterLink>
          ))}
        </FilterGroup>
        <FilterGroup>
          {RANGE_OPTIONS.map((o) => (
            <FilterLink
              key={o.days}
              href={`/admin/log?days=${o.days}&kind=${kind}`}
              active={days === o.days}
            >
              {o.label}
            </FilterLink>
          ))}
        </FilterGroup>
      </div>

      {groups.length === 0 ? (
        <p className="text-center text-[#94A3B8] py-16 text-[13px]">
          אין רשומות בטווח הזה. התחל טיימר מהסרגל הצדדי.
        </p>
      ) : (
        <div className="space-y-4">
          {groups.map((g) => {
            const rel = relativeDayLabel(g.key, todayKey);
            return (
              <section
                key={g.key}
                className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden"
              >
                <div className="flex items-center gap-3 px-5 py-3 border-b border-[#F1F5F9] bg-[#F8FAFC]">
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-[#0F172A]">
                      {rel ? (
                        <>
                          <span className="text-[#2B7FFF]">{rel}</span>
                          <span className="text-[#94A3B8] font-medium">
                            {" · "}
                            {dayLabelFmt.format(new Date(`${g.key}T12:00:00`))}
                          </span>
                        </>
                      ) : (
                        dayLabelFmt.format(new Date(`${g.key}T12:00:00`))
                      )}
                    </div>
                    <div className="h-1 rounded-full bg-[#E2E8F0] mt-1.5 max-w-[220px] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#2B7FFF]"
                        style={{ width: `${Math.round((g.totalSec / maxDaySec) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-left shrink-0">
                    <div className="text-[14px] font-bold tabular-nums text-[#0F172A]">
                      {fmtHours(g.totalSec)}
                    </div>
                    <div className="text-[10px] text-[#94A3B8]">{g.entries.length} מקטעים</div>
                  </div>
                </div>

                <ul className="divide-y divide-[#F1F5F9]">
                  {g.entries.map((e) => (
                    <li key={e.key} className="px-5 py-3 flex items-start gap-3 hover:bg-[#F8FAFC]">
                      <div
                        className="text-[12px] text-[#64748B] tabular-nums w-[92px] shrink-0 pt-0.5"
                        dir="ltr"
                        style={{ textAlign: "right" }}
                      >
                        {timeFmt.format(new Date(e.startedAt))}
                        {e.endedAt ? `–${timeFmt.format(new Date(e.endedAt))}` : ""}
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 mt-0.5 ${
                          e.kind === "personal"
                            ? "bg-[#F5F3FF] text-[#7C3AED]"
                            : "bg-[#EFF6FF] text-[#2B7FFF]"
                        }`}
                      >
                        {e.kind === "personal" ? "אישי" : "לקוח"}
                      </span>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={e.href}
                          className="text-[13px] font-medium text-[#0F172A] hover:text-[#2B7FFF] block truncate"
                        >
                          {e.subtitle && <span className="text-[#94A3B8]">{e.subtitle} · </span>}
                          {e.projectName}
                        </Link>
                        {e.taskTitle &&
                          (e.taskHref ? (
                            <Link
                              href={e.taskHref}
                              className="text-[12px] text-[#475569] hover:text-[#2B7FFF] truncate block"
                            >
                              ↳ {e.taskTitle}
                            </Link>
                          ) : (
                            <div className="text-[12px] text-[#475569] truncate">↳ {e.taskTitle}</div>
                          ))}
                        {e.note && (
                          <div className="text-[12px] text-[#94A3B8] truncate">{e.note}</div>
                        )}
                      </div>

                      <div className="text-[13px] font-semibold tabular-nums text-[#0F172A] w-[70px] text-left shrink-0">
                        {e.endedAt ? (
                          fmtHours(e.durationSeconds)
                        ) : (
                          <span className="text-[#2B7FFF]">פעיל</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl px-4 py-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">{label}</div>
      <div className="text-[18px] font-bold text-[#0F172A] tabular-nums mt-0.5">{value}</div>
    </div>
  );
}

function FilterGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1 bg-[#F1F5F9] rounded-full p-1">{children}</div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`text-[12px] font-semibold px-3 py-1 rounded-full transition ${
        active ? "bg-white text-[#0F172A] shadow-sm" : "text-[#64748B] hover:text-[#0F172A]"
      }`}
    >
      {children}
    </Link>
  );
}
