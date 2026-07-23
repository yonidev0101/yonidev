import {
  PERSONAL_TASK_TYPE_HE,
  PERSONAL_TASK_TYPE_ICON,
  PERSONAL_TASK_TYPE_TONE,
} from "@/lib/admin/format";

/**
 * The one place a personal task's "type" renders as a chip. Used on task rows,
 * the focus strip, and the task detail header so a type always looks the same.
 */
export default function TaskTypeTag({
  type,
  size = "sm",
  iconOnly = false,
}: {
  type: string;
  size?: "sm" | "md";
  iconOnly?: boolean;
}) {
  const label = PERSONAL_TASK_TYPE_HE[type] ?? type;
  const icon = PERSONAL_TASK_TYPE_ICON[type] ?? "•";
  const tone = PERSONAL_TASK_TYPE_TONE[type] ?? "bg-[#F1F5F9] text-[#64748B]";
  const pad = size === "md" ? "px-2.5 py-1 text-[12px]" : "px-2 py-0.5 text-[11px]";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold shrink-0 ${pad} ${tone}`}
      title={label}
    >
      <span aria-hidden>{icon}</span>
      {!iconOnly && <span>{label}</span>}
    </span>
  );
}
