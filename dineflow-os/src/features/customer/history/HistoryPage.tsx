import { useEffect } from "react";
import { useSessionStore } from "@/stores/session.store";
import { useOrderStore } from "@/stores/order.store";
import { TopBar } from "../components/TopBar";
import { formatCurrency } from "@/lib/format";

export function HistoryPage() {
  const customer = useSessionStore((s) => s.customer)!;
  const pastOrders = useOrderStore((s) => s.pastOrders);
  const loadHistory = useOrderStore((s) => s.loadHistory);

  useEffect(() => {
    loadHistory(customer);
  }, [customer, loadHistory]);

  return (
    <div>
      <TopBar title="Your Orders" />
      <div className="p-4">
        {pastOrders.length === 0 ? (
          <p className="py-20 text-center text-muted">
            No previous orders yet.
          </p>
        ) : (
          <div className="space-y-3">
            {pastOrders.map((o) => (
              <div
                key={o.id}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <div className="flex justify-between">
                  <span className="font-medium">
                    Table {o.tableNumber}
                  </span>
                  <span className="capitalize text-muted">{o.status}</span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {new Date(o.placedAt).toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-muted">
                  {o.lines.map((l) => `${l.quantity}× ${l.name}`).join(", ")}
                </p>
                <p className="mt-2 font-serif text-lg">
                  {formatCurrency(o.total)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
