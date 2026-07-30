import { LINK_KIND_HE, LINK_KIND_ICON, LINK_KIND_ORDER } from "@/lib/admin/format";

/**
 * Small kind badge for a project link: brand icon + Hebrew label. Custom
 * ("other") links carry their identity in the link's own label, so we show just
 * the 🔗 icon rather than a meaningless "מותאם אישית" word next to it.
 */
export function LinkKindTag({ kind, className = "" }: { kind: string; className?: string }) {
  const icon = LINK_KIND_ICON[kind as keyof typeof LINK_KIND_ICON] ?? "🔗";
  const label = kind === "other" ? "" : LINK_KIND_HE[kind as keyof typeof LINK_KIND_HE] ?? "";
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span aria-hidden>{icon}</span>
      {label && <span>{label}</span>}
    </span>
  );
}

/** The <option> list for a link-kind <select>, shared by both project shells. */
export function LinkKindOptions() {
  return (
    <>
      {LINK_KIND_ORDER.map((k) => (
        <option key={k} value={k}>
          {LINK_KIND_ICON[k]} {LINK_KIND_HE[k]}
        </option>
      ))}
    </>
  );
}
