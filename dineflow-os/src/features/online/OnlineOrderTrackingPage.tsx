import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { services } from "@/services";
import { useOrderStore } from "@/stores/order.store";
import { useOnlineStore } from "@/stores/online.store";
import { DELIVERY_ETA_MINUTES, PICKUP_ETA_MINUTES } from "@/data/delivery";
import { TopBar } from "@/features/customer/components/TopBar";
import { formatCurrency } from "@/lib/format";
import {
  Bike,
  ShoppingBag,
  CheckCircle2,
  Clock,
  ChefHat,
  Package,
} from "lucide-react";
import type { Order } from "@/services/types";

const STATUS_STEPS: {
  status: Order["status"];
  label: string;
  icon: React.ReactNode;
}[] = [
  { status: "received", label: "Order Received", icon: <Clock className="h-5 w-5" /> },
  { status: "preparing", label: "Preparing", icon: <ChefHat className="h-5 w-5" /> },
  { status: "ready", label: "Ready", icon: <Package className="h-5 w-5" /> },
  { status: "served", label: "On the Way", icon: <Bike className="h-5 w-5" /> },
];

export function OnlineOrderTrackingPage() {
  const { orderId = "" } = useParams<{ orderId: string }>();
  const activeOrder = useOrderStore((s) => s.activeOrder);
  const setOrder = useOrderStore((s) => s.setOrder);
  const subscribe = useOrderStore((s) => s.subscribe);
  const orderType = useOnlineStore((s) => s.orderType);
  const [loading, setLoading] = useState(!activeOrder || activeOrder.id !== orderId);

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | undefined;

    // If activeOrder already matches, subscribe directly.
    if (activeOrder?.id === orderId) {
      setLoading(false);
      unsub = subscribe(orderId);
      return () => unsub?.();
    }

    // Otherwise fetch by ID (page refresh, direct link, etc.)
    setLoading(true);
    services.order.getOrder(orderId).then((o) => {
      if (cancelled) return;
      if (o) {
        setOrder(o);
        unsub = subscribe(orderId);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
      unsub?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (loading || !activeOrder) {
    return (
      <div>
        <TopBar title="Order Tracking" />
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-muted">Loading order…</p>
        </div>
      </div>
    );
  }

  const currentIndex = STATUS_STEPS.findIndex(
    (s) => s.status === activeOrder.status
  );
  const eta =
    orderType === "delivery" ? DELIVERY_ETA_MINUTES : PICKUP_ETA_MINUTES;
  const channel = activeOrder.channel ?? orderType ?? "delivery";

  return (
    <div className="pb-8">
      <TopBar title="Order Tracking" />

      {/* Channel header */}
      <div className="flex items-center gap-2 bg-surface px-4 py-3">
        {channel === "delivery" ? (
          <Bike className="h-4 w-4 text-accent" />
        ) : (
          <ShoppingBag className="h-4 w-4 text-accent" />
        )}
        <span className="text-sm font-medium">
          {channel === "delivery" ? "Delivery" : "Pickup"} · {activeOrder.id}
        </span>
      </div>

      <div className="p-4">
        {/* Progress steps */}
        <div className="space-y-4 py-4">
          {STATUS_STEPS.map((step, i) => {
            const reached = currentIndex >= 0 ? i <= currentIndex : false;
            const active = step.status === activeOrder.status;
            return (
              <div key={step.status} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      active
                        ? "border-accent bg-accent/20 text-accent"
                        : reached
                        ? "border-accent/50 bg-accent/10 text-accent"
                        : "border-border bg-surface text-muted"
                    }`}
                  >
                    {reached && !active ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div
                      className={`mt-1 h-6 w-0.5 ${
                        i < currentIndex ? "bg-accent/40" : "bg-border"
                      }`}
                    />
                  )}
                </div>
                <div className="pt-2">
                  <p
                    className={`text-sm font-medium ${
                      reached ? "text-foreground" : "text-muted"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ETA */}
        {activeOrder.status !== "billed" && activeOrder.status !== "completed" && (
          <div className="rounded-xl bg-surface p-4">
            <p className="text-xs text-muted">Estimated time</p>
            <p className="font-serif text-2xl">~{eta} min</p>
          </div>
        )}

        {/* Delivery address (delivery only) */}
        {channel === "delivery" && activeOrder.deliveryAddress && (
          <div className="mt-3 rounded-xl bg-surface p-4">
            <p className="text-xs text-muted">Delivering to</p>
            <p className="mt-1 text-sm">
              {activeOrder.deliveryAddress.line1}
              {activeOrder.deliveryAddress.line2 &&
                `, ${activeOrder.deliveryAddress.line2}`}
            </p>
            <p className="text-sm text-muted">
              {activeOrder.deliveryAddress.city} —{" "}
              {activeOrder.deliveryAddress.pincode}
            </p>
          </div>
        )}

        {/* Instructions */}
        {activeOrder.deliveryInstructions && (
          <div className="mt-3 rounded-xl bg-surface p-4">
            <p className="text-xs text-muted">Instructions</p>
            <p className="mt-1 text-sm">{activeOrder.deliveryInstructions}</p>
          </div>
        )}

        {/* Order summary */}
        <div className="mt-4 rounded-xl border border-border bg-surface p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">
            Order Summary
          </p>
          {activeOrder.lines.map((l) => (
            <div key={l.id} className="flex justify-between text-sm">
              <span>
                {l.name} × {l.quantity}
              </span>
              <span>{formatCurrency(l.unitPrice * l.quantity)}</span>
            </div>
          ))}
          <div className="mt-3 border-t border-border pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span>{formatCurrency(activeOrder.subtotal)}</span>
            </div>
            {activeOrder.deliveryFee != null &&
              activeOrder.deliveryFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Delivery</span>
                  <span>{formatCurrency(activeOrder.deliveryFee)}</span>
                </div>
              )}
            <div className="mt-2 flex justify-between font-serif text-lg">
              <span>Total</span>
              <span>{formatCurrency(activeOrder.total)}</span>
            </div>
          </div>
        </div>

        {/* Order complete / billed */}
        {(activeOrder.status === "billed" ||
          activeOrder.status === "completed") && (
          <div className="mt-4 text-center">
            <p className="font-serif text-lg text-accent">
              {channel === "delivery" ? "Delivered!" : "Picked up!"}
            </p>
            <p className="text-sm text-muted">
              Thank you for ordering from Saffron &amp; Smoke.
            </p>
            <Link
              to="/order/online"
              className="mt-4 inline-block text-sm text-accent underline"
            >
              Order again
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
