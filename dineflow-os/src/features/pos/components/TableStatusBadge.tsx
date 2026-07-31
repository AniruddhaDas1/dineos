import { cn } from "@/lib/cn";

export type TableStatus = "available" | "occupied" | "billed";

const STYLES: Record<TableStatus, string> = {
  available: "bg-success/15 text-success",
  occupied: "bg-accent/15 text-accent",
  billed: "bg-muted/15 text-muted",
};

export function TableStatusBadge({ status }: { status: TableStatus }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        STYLES[status]
      )}
    >
      {status}
    </span>
  );
}
