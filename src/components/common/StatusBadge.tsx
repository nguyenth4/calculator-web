import type { ItemStatus } from "../../types";

export function StatusBadge({ status }: { status: ItemStatus }) {
  const isActive = status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        isActive ? "bg-ok-muted text-ok" : "bg-surface-3 text-text-secondary"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-ok" : "bg-text-muted"}`} />
      {isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
    </span>
  );
}
