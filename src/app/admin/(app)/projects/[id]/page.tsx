import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectWithRelations } from "@/lib/admin/queries";
import {
  PROJECT_STATUS_HE,
  fmtIls,
  fmtHours,
} from "@/lib/admin/format";
import ProjectShell from "@/components/admin/ProjectShell";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id: idStr } = await params;
  const { tab } = await searchParams;
  const id = Number(idStr);
  if (!Number.isFinite(id)) notFound();

  const data = await getProjectWithRelations(id);
  if (!data) notFound();

  const totalSec = data.timeEntries.reduce((sum, t) => sum + (t.durationSeconds ?? 0), 0);
  const rate = Number(data.project.hourlyRateIls ?? data.client?.defaultHourlyRateIls ?? 0);
  const totalIls = (totalSec / 3600) * rate;

  return (
    <div dir="rtl" className="space-y-6 max-w-5xl">
      <header>
        {data.client && (
          <Link
            href={`/admin/clients/${data.client.id}`}
            className="text-[12px] text-[#94A3B8] hover:text-[#2B7FFF]"
          >
            ← {data.client.name}
          </Link>
        )}
        <div className="flex items-baseline gap-3 mt-2 flex-wrap">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight">
            {data.project.name}
          </h1>
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#2B7FFF]">
            {PROJECT_STATUS_HE[data.project.status]}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="סה״כ שעות" value={fmtHours(totalSec)} />
        <Stat label="תעריף" value={rate ? `${fmtIls(rate)}/שעה` : "—"} />
        <Stat label="שווי מצטבר" value={fmtIls(totalIls)} accent />
        <Stat label="משימות פתוחות" value={data.tasks.filter((t) => t.status !== "done").length.toString()} />
      </div>

      <ProjectShell project={data.project} client={data.client} tab={tab ?? "overview"}
        tasks={data.tasks} links={data.links} timeEntries={data.timeEntries}
        communications={data.communications} />
    </div>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
      <div className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">{label}</div>
      <div
        className={`mt-1 text-xl font-bold tabular-nums ${accent ? "text-[#2B7FFF]" : "text-[#0F172A]"}`}
      >
        {value}
      </div>
    </div>
  );
}
