import type { OrderStatus } from "@/services/types";
import { cn } from "@/lib/cn";

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending_acceptance: "bg-amber-500/15 text-amber-400",
  received: "bg-accent/15 text-accent",
  preparing: "bg-blue-500/15 text-blue-400",
  ready: "bg-success/15 text-success",
  served: "bg-foreground/15 text-foreground",
  completed: "bg-success/15 text-success",
  billed: "bg-muted/15 text-muted",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        STATUS_STYLES[status] ?? "bg-surface-2 text-muted"
      )}
    >
      {status}
    </span>
  );
}
