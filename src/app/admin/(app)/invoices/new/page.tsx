import { db, clients } from "@/lib/db/client";
import { desc, inArray } from "drizzle-orm";
import InvoiceComposer from "@/components/admin/InvoiceComposer";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;
  const allClients = await db
    .select()
    .from(clients)
    .where(inArray(clients.status, ["active", "negotiating", "paused"]))
    .orderBy(desc(clients.createdAt));

  return (
    <div dir="rtl" className="space-y-6 max-w-5xl">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight">
          חשבונית חדשה
        </h1>
        <p className="text-[#64748B] text-sm mt-1">
          בחר לקוח וטווח תאריכים — המערכת תרכז את השעות שטרם חויבו.
        </p>
      </header>
      <InvoiceComposer
        clients={allClients}
        initialClientId={clientId ? Number(clientId) : null}
      />
    </div>
  );
}
