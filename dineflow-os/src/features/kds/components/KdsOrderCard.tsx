import { useMemo } from "react";
import type { Order, OrderStatus } from "@/services/types";
import { Hand, Droplets, HandHelping, Bike, ShoppingBag } from "lucide-react";
import { KdsItemRow } from "./KdsItemRow";
import { cn } from "@/lib/cn";

const BUTTON_CONFIG: Record<
  OrderStatus,
  { label: string; className: string } | null
> = {
  pending_acceptance: null,
  received: { label: "Start Preparing", className: "bg-accent text-accent-foreground hover:bg-accent/90" },
  preparing: { label: "Mark Ready", className: "bg-success text-background hover:bg-success/90" },
  ready: { label: "Mark Served", className: "bg-surface-2 text-foreground hover:bg-surface-2/80" },
  served: null,
  completed: null,
  billed: null,
};

const ASSISTANCE_ICONS: Record<string, typeof Hand> = {
  waiter: HandHelping,
  water: Droplets,
  tissue: Hand,
};

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "just now";
  const min = Math.floor(diff / 60);
  if (min < 60) return `${min}m ago`;
  return `${Math.floor(min / 60)}h ago`;
}

function urgencyColor(ts: number): string {
  const min = (Date.now() - ts) / 60_000;
  if (min < 5) return "text-foreground";
  if (min < 15) return "text-accent";
  return "text-danger";
}

interface KdsOrderCardProps {
  order: Order;
  onAdvance: (orderId: string) => void;
}

export function KdsOrderCard({ order, onAdvance }: KdsOrderCardProps) {
  const btn = BUTTON_CONFIG[order.status];

  // Recompute time display every 30s
  const time = useMemo(() => timeAgo(order.placedAt), [order.placedAt]);

  return (
    <div className="flex flex-col rounded-xl border border-border bg-surface">
      {/* Header */}
      <div className="flex items-start justify-between px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted">
              #{order.id.slice(-5)}
            </span>
            {order.tableId === "online" ? (
              order.channel === "delivery" ? (
                <span className="flex items-center gap-1 rounded bg-green-500/15 px-1.5 py-0.5 text-xs font-medium text-green-400">
                  <Bike className="h-3 w-3" />
                  Delivery
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded bg-blue-500/15 px-1.5 py-0.5 text-xs font-medium text-blue-400">
                  <ShoppingBag className="h-3 w-3" />
                  Pickup
                </span>
              )
            ) : (
              <span className="rounded bg-accent/15 px-1.5 py-0.5 text-xs font-medium text-accent">
                T{order.tableNumber}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm font-medium">{order.customer.name}</p>
        </div>
        <span className={cn("text-xs font-medium", urgencyColor(order.placedAt))}>
          {time}
        </span>
      </div>

      {/* Assistance badges */}
      {order.specialRequests && order.specialRequests.length > 0 && (
        <div className="flex flex-wrap gap-1 border-t border-border px-4 pt-2">
          {order.specialRequests.map((req) => {
            const Icon = ASSISTANCE_ICONS[req] ?? Hand;
            return (
              <span
                key={req}
                className="flex items-center gap-1 rounded bg-danger/15 px-1.5 py-0.5 text-[10px] font-medium capitalize text-danger"
              >
                <Icon className="h-3 w-3" />
                {req}
              </span>
            );
          })}
        </div>
      )}

      {/* Items */}
      <div className="flex-1 space-y-2 px-4 py-3">
        {order.lines.map((line) => (
          <KdsItemRow key={line.id} line={line} />
        ))}
      </div>

      {/* Advance button */}
      {btn && (
        <div className="border-t border-border px-4 py-3">
          <button
            onClick={() => onAdvance(order.id)}
            className={cn(
              "w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors",
              btn.className
            )}
          >
            {btn.label}
          </button>
        </div>
      )}
    </div>
  );
}
