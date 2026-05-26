export const runtime = "nodejs";

import { db, timeEntries, projects, clients } from "@/lib/db/client";
import { and, eq, gte, lte, isNull, isNotNull } from "drizzle-orm";
import { json, serverError } from "@/lib/admin/http";

/**
 * Returns billable, closed (ended_at not null) time entries for the given client
 * that haven't been included in any invoice yet, optionally filtered by a date range.
 * Used by /admin/invoices/new to propose invoice lines.
 *
 * Query params: clientId (required), from?, to? (ISO date strings).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const clientIdStr = url.searchParams.get("clientId");
  if (!clientIdStr) {
    return json({ ok: false, error: "clientId required" }, { status: 400 });
  }
  const clientId = Number(clientIdStr);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  try {
    const conds = [
      eq(projects.clientId, clientId),
      isNull(timeEntries.invoicedInvoiceId),
      eq(timeEntries.billable, true),
      isNotNull(timeEntries.endedAt),
    ];
    if (from) conds.push(gte(timeEntries.startedAt, new Date(from)));
    if (to) {
      const toEnd = new Date(to);
      toEnd.setHours(23, 59, 59, 999);
      conds.push(lte(timeEntries.startedAt, toEnd));
    }

    const rows = await db
      .select({
        id: timeEntries.id,
        projectId: timeEntries.projectId,
        projectName: projects.name,
        clientHourlyRate: clients.defaultHourlyRateIls,
        projectHourlyRate: projects.hourlyRateIls,
        startedAt: timeEntries.startedAt,
        endedAt: timeEntries.endedAt,
        durationSeconds: timeEntries.durationSeconds,
        note: timeEntries.note,
      })
      .from(timeEntries)
      .innerJoin(projects, eq(projects.id, timeEntries.projectId))
      .innerJoin(clients, eq(clients.id, projects.clientId))
      .where(and(...conds))
      .orderBy(timeEntries.startedAt);

    return json({ ok: true, entries: rows });
  } catch (e) {
    return serverError(e);
  }
}
