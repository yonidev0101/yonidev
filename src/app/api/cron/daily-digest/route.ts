export const runtime = "nodejs";

import { getDashboardData } from "@/lib/admin/queries";
import { getTransporter } from "@/lib/email/transporter";
import { buildDailyDigestEmail, type DigestTask } from "@/lib/email/templates/daily-digest";
import { EMAIL_FROM, EMAIL_TO } from "@/lib/contact/channels";
import { actionableDate, relativeDayHe, daysSince } from "@/lib/admin/format";
import { json, serverError } from "@/lib/admin/http";

/**
 * Daily digest of "what's on me today", emailed to Yoni himself.
 * Reachable outside the admin auth tree (middleware only gates /admin + /api/admin),
 * so it self-guards with CRON_SECRET. Vercel Cron auto-injects
 * `Authorization: Bearer <CRON_SECRET>` when that env var is set.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return json({ ok: false, error: "CRON_SECRET not configured" }, { status: 503 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const mailer = getTransporter();
  if (!mailer) {
    return json({ ok: false, error: "Email service not configured" }, { status: 503 });
  }

  try {
    const data = await getDashboardData();
    const today = data.todayStr;

    // Follow-ups whose date has arrived (today or overdue) — nudge time.
    const followUps: DigestTask[] = data.followUpsThisWeek
      .filter((t) => t.followUpAt && t.followUpAt <= today)
      .map((t) => ({
        id: t.id,
        title: t.title,
        clientName: t.clientName,
        projectName: t.projectName,
        meta: relativeDayHe(t.followUpAt) ?? "היום",
        alert: !!t.followUpAt && t.followUpAt < today,
      }));
    const followUpIds = new Set(followUps.map((t) => t.id));

    // Overdue tasks not already surfaced as a follow-up.
    const overdueTasks: DigestTask[] = data.upcomingTasks
      .filter((t) => {
        const d = actionableDate(t);
        return d && d < today && !followUpIds.has(t.id);
      })
      .map((t) => ({
        id: t.id,
        title: t.title,
        clientName: t.clientName,
        projectName: t.projectName,
        meta: relativeDayHe(actionableDate(t)) ?? "באיחור",
        alert: true,
      }));

    const staleTasks: DigestTask[] = data.staleTasks.map((t) => ({
      id: t.id,
      title: t.title,
      clientName: t.clientName,
      projectName: t.projectName,
      meta: `לא זז ${daysSince(t.lastUpdateAt ?? t.createdAt)} ימ׳`,
      alert: false,
    }));

    const outstandingInvoicesCount = data.outstandingInvoices.length;
    const outstandingTotalIls = data.outstandingInvoices.reduce(
      (sum, inv) => sum + Number(inv.totalIls),
      0,
    );

    const hasContent =
      followUps.length + overdueTasks.length + staleTasks.length + outstandingInvoicesCount >
      0;
    if (!hasContent) {
      return json({ ok: true, skipped: true, reason: "nothing actionable" });
    }

    const now = new Date();
    const dateLabel = `${new Intl.DateTimeFormat("he-IL", { weekday: "long" }).format(now)} · ${now.getDate()}.${now.getMonth() + 1}`;

    const email = buildDailyDigestEmail({
      dateLabel,
      followUps,
      overdueTasks,
      staleTasks,
      outstandingInvoicesCount,
      outstandingTotalIls,
    });

    await mailer.sendMail({
      from: EMAIL_FROM,
      to: EMAIL_TO,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });

    return json({
      ok: true,
      sent: true,
      counts: {
        followUps: followUps.length,
        overdue: overdueTasks.length,
        stale: staleTasks.length,
        invoices: outstandingInvoicesCount,
      },
    });
  } catch (e) {
    return serverError(e);
  }
}
