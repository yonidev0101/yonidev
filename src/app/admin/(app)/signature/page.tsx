import { getSignatureTracking } from "@/lib/admin/queries";
import SignatureTracking from "@/components/admin/SignatureTracking";

export const dynamic = "force-dynamic";

export default async function SignaturePage() {
  const { recipients, recentOpens } = await getSignatureTracking();

  return (
    <div dir="rtl" className="space-y-6 max-w-5xl">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight">
          חתימת מייל
        </h1>
        <p className="text-[#64748B] text-sm mt-1">
          העתק את החתימה, או צור עותק ייחודי עם פיקסל מעקב לכל נמען — וראה מי פתח ומתי.
        </p>
      </header>

      <SignatureTracking recipients={recipients} recentOpens={recentOpens} />
    </div>
  );
}
