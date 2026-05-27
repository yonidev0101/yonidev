import { fmtDateHe, fmtHours } from "@/lib/admin/format";

export interface WeeklyHoursPoint {
  weekStart: string; // ISO date YYYY-MM-DD (Monday)
  totalSec: number;
}

/**
 * Small SVG bar chart of weekly hours over the last N weeks.
 * Server-rendered; no JS. Tooltips via native <title>.
 */
export default function ClientHoursChart({
  data,
  height = 48,
}: {
  data: WeeklyHoursPoint[];
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.totalSec));
  const barCount = data.length;
  const barGap = 4;
  const totalAcrossWindow = data.reduce((s, d) => s + d.totalSec, 0);

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
      <div className="flex items-baseline justify-between mb-3 gap-3">
        <h3 className="text-[13px] font-bold text-[#0F172A]">
          שעות לפי שבוע · {barCount} שבועות אחרונים
        </h3>
        <span className="text-[12px] text-[#64748B] tabular-nums">
          סהכ {fmtHours(totalAcrossWindow)}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${barCount * 100} ${height + 20}`}
        className="w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="גרף שעות לפי שבוע"
      >
        {data.map((d, i) => {
          const barW = 100 - barGap;
          const x = i * 100 + barGap / 2;
          const h = d.totalSec > 0 ? Math.max(2, (d.totalSec / max) * height) : 0;
          const y = height - h;
          const weekEnd = addDaysISO(d.weekStart, 6);
          const label = `${fmtDateHe(d.weekStart)}–${fmtDateHe(weekEnd)} · ${fmtHours(d.totalSec)}`;
          return (
            <g key={d.weekStart}>
              <rect
                x={x}
                y={0}
                width={barW}
                height={height}
                fill="#F1F5F9"
                rx={2}
              />
              {h > 0 && (
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={h}
                  fill="#2B7FFF"
                  rx={2}
                />
              )}
              <title>{label}</title>
            </g>
          );
        })}
      </svg>

      <div className="flex items-center justify-between mt-1.5 text-[10px] text-[#94A3B8] tabular-nums">
        <span>{fmtDateHe(data[0]?.weekStart ?? "")}</span>
        <span>היום</span>
      </div>
    </div>
  );
}

function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
