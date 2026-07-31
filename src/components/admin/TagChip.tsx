import { tagTone } from "@/lib/admin/format";

/** Minimal shape every tag surface needs — avoids importing the DB row type into client bundles. */
export type TagLite = { id: number; slug: string; label: string; color: string };

/**
 * The one place a project tag renders. Tags say which *area* of the project a
 * task touches ("PWA", "עיצוב"), next to TaskTypeTag which says what it is.
 */
export default function TagChip({
  tag,
  size = "sm",
  onRemove,
}: {
  tag: TagLite;
  size?: "xs" | "sm";
  onRemove?: () => void;
}) {
  const pad = size === "xs" ? "px-1.5 py-0 text-[10px]" : "px-2 py-0.5 text-[11px]";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-semibold shrink-0 ${pad} ${tagTone(tag.color)}`}
      title={tag.slug}
    >
      {tag.label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="opacity-50 hover:opacity-100 transition-opacity"
          aria-label={`הסר את התגית ${tag.label}`}
        >
          ✕
        </button>
      )}
    </span>
  );
}
