import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePosStore } from "@/stores/pos.store";
import { formatCurrency } from "@/lib/format";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import { ChannelBadge } from "../components/ChannelBadge";
import { cn } from "@/lib/cn";
import type { OrderStatus } from "@/services/types";

const STATUS_FILTERS: ("all" | OrderStatus)[] = [
  "all",
  "received",
  "preparing",
  "ready",
  "served",
  "billed",
];

export function OrdersPage() {
  const orders = usePosStore((s) => s.orders);
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-serif text-3xl">Orders</h1>
      <p className="mt-1 text-sm text-muted">
        {filtered.length} order{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs capitalize transition-colors",
              filter === s
                ? "border-accent text-accent"
                : "border-border text-muted hover:text-foreground"
            )}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="mt-6 space-y-2">
        {filtered.length === 0 && (
          <p className="py-8 text-center text-muted">No orders found.</p>
        )}
        {filtered.map((order) => (
          <button
            key={order.id}
            onClick={() => navigate(`/pos/orders/${order.id}`)}
            className="flex w-full flex-col gap-3 rounded-xl border border-border bg-surface px-5 py-4 text-left transition-colors hover:bg-surface-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-4">
              <span className="text-sm font-mono text-muted">
                #{order.id.slice(-5)}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{order.customer.name}</p>
                  <ChannelBadge channel={order.channel} />
                </div>
                <p className="text-xs text-muted">
                  {order.tableId === "online"
                    ? (order.channel === "pickup"
                        ? "Pickup"
                        : "Delivery")
                    : `Table ${order.tableNumber}`}{" "}
                  · {order.lines.length} item
                  {order.lines.length > 1 ? "s" : ""} ·{" "}
                  {new Date(order.placedAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <OrderStatusBadge status={order.status} />
              <span className="font-serif text-sm">
                {formatCurrency(order.total)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
