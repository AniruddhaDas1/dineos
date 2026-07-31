import { useEffect, useMemo } from "react";
import { useKdsStore } from "@/stores/kds.store";
import { KdsOrderCard } from "./components/KdsOrderCard";
import { services } from "@/services";
import { cn } from "@/lib/cn";
import type { Order, OrderStatus } from "@/services/types";

interface Column {
  status: OrderStatus;
  label: string;
  dotClass: string;
}

const COLUMNS: Column[] = [
  { status: "received", label: "New Orders", dotClass: "bg-accent" },
  { status: "preparing", label: "Preparing", dotClass: "bg-blue-400" },
  { status: "ready", label: "Ready to Serve", dotClass: "bg-success" },
];

export function KdsBoard() {
  const orders = useKdsStore((s) => s.orders);
  const refresh = useKdsStore((s) => s.refresh);
  const advanceStatus = useKdsStore((s) => s.advanceStatus);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, [refresh]);

  const handleAdvance = async (orderId: string) => {
    await advanceStatus(orderId);
    
    // Notification trigger: Notify customer if the order just became "Ready"
    const updated = await services.order.getOrder(orderId);
    if (updated?.status === "ready") {
      services.notification.sendOrderUpdate(
        updated.customer.mobile,
        "ready"
      );
    }
  };

  const grouped = useMemo(() => {
    const map = new Map<OrderStatus, Order[]>();
    for (const col of COLUMNS) {
      map.set(col.status, []);
    }
    for (const order of orders) {
      const col = COLUMNS.find((c) => c.status === order.status);
      if (col) {
        const list = map.get(col.status)!;
        list.push(order);
        map.set(col.status, list);
      }
    }
    return map;
  }, [orders]);

  return (
    <div className="grid h-full grid-cols-1 gap-4 p-4 md:grid-cols-3 lg:gap-6 lg:p-6">
      {COLUMNS.map((col) => {
        const items = grouped.get(col.status) ?? [];
        return (
          <div key={col.status} className="flex flex-col overflow-hidden">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn("h-3 w-3 rounded-full", col.dotClass)} />
                <h2 className="text-sm font-semibold uppercase tracking-wider">
                  {col.label}
                </h2>
              </div>
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted">
                {items.length}
              </span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {items.length === 0 && (
                <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted">
                  No orders
                </div>
              )}
              {items.map((order) => (
                <KdsOrderCard
                  key={order.id}
                  order={order}
                  onAdvance={handleAdvance}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
