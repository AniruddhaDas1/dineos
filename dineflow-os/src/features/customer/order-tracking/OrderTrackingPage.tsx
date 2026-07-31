import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { services } from "@/services";
import { useOrderStore } from "@/stores/order.store";
import { TopBar } from "../components/TopBar";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { Check } from "lucide-react";

const STEPS = [
  { key: "received", label: "Order received" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready to serve" },
  { key: "served", label: "Served" },
] as const;

export function OrderTrackingPage() {
  const { tableId = "", orderId = "" } = useParams();
  const navigate = useNavigate();
  const activeOrder = useOrderStore((s) => s.activeOrder);
  const setOrder = useOrderStore((s) => s.setOrder);
  const subscribe = useOrderStore((s) => s.subscribe);

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | undefined;
    services.order.getOrder(orderId).then((o) => {
      if (cancelled) return;
      if (o) setOrder(o);
      unsub = subscribe(orderId);
    });
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [orderId, setOrder, subscribe]);

  if (!activeOrder) return <TopBar title="Loading…" />;

  const currentIndex = STEPS.findIndex((s) => s.key === activeOrder.status);

  return (
    <div className="pb-40">
      <TopBar title={`Table ${activeOrder.tableNumber}`} />
      <div className="p-5">
        <p className="text-xs uppercase tracking-widest text-muted">
          Order status
        </p>
        <p className="font-serif text-2xl capitalize">{activeOrder.status}</p>

        {/* Status timeline */}
        <div className="mt-6 space-y-1">
          {STEPS.map((s, i) => {
            const done = i < currentIndex;
            const active = i === currentIndex;
            return (
              <div key={s.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                      done
                        ? "border-success bg-success text-background"
                        : active
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border"
                    }`}
                  >
                    {done ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="text-xs">{i + 1}</span>
                    )}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`my-1 h-8 w-px ${
                        done ? "bg-success" : "bg-border"
                      }`}
                    />
                  )}
                </div>
                <div className="pt-1">
                  <p
                    className={
                      active || done ? "font-medium" : "text-muted"
                    }
                  >
                    {s.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div className="mt-8 rounded-xl border border-border bg-surface p-4">
          <p className="mb-2 font-medium">Your order</p>
          {activeOrder.lines.map((l) => (
            <div
              key={l.id}
              className="flex justify-between text-sm"
            >
              <span className="text-muted">
                {l.quantity}× {l.name}
              </span>
              <span>{formatCurrency(l.unitPrice * l.quantity)}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between font-serif">
            <span>Total</span>
            <span>{formatCurrency(activeOrder.total)}</span>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/order/table/${tableId}/menu`)}
          >
            Add more items
          </Button>
          <Button
            onClick={() =>
              navigate(`/order/table/${tableId}/order/${orderId}/bill`)
            }
          >
            Request Bill
          </Button>
        </div>
      </div>
    </div>
  );
}
