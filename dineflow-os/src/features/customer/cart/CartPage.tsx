import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCartStore } from "@/stores/cart.store";
import { useSessionStore } from "@/stores/session.store";
import { useOrderStore } from "@/stores/order.store";
import { restaurant } from "@/data/restaurant";
import { TopBar } from "../components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";

const DEMO_COUPON = { code: "WELCOME10", percent: 10 };

export function CartPage() {
  const { tableId = "" } = useParams();
  const navigate = useNavigate();
  const lines = useCartStore((s) => s.lines);
  const subtotal = useCartStore((s) => s.subtotal);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeLine = useCartStore((s) => s.removeLine);
  const clear = useCartStore((s) => s.clear);
  const customer = useSessionStore((s) => s.customer)!;
  const placeFromCart = useOrderStore((s) => s.placeFromCart);
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState(0);

  function applyCoupon() {
    if (coupon.trim().toUpperCase() === DEMO_COUPON.code) {
      setApplied(+(subtotal * (DEMO_COUPON.percent / 100)).toFixed(2));
    } else {
      setApplied(0);
    }
  }

  const afterDiscount = Math.max(0, subtotal - applied);
  const gst = +(afterDiscount * (restaurant.gstPercent / 100)).toFixed(2);
  const serviceCharge = +(
    afterDiscount *
    (restaurant.serviceChargePercent / 100)
  ).toFixed(2);
  const total = +(afterDiscount + gst + serviceCharge).toFixed(2);

  async function place() {
    if (!lines.length) return;
    const order = await placeFromCart({
      tableId,
      customer,
      lines,
      subtotal: afterDiscount,
    });
    clear();
    navigate(`/table/${tableId}/order/${order.id}`);
  }

  return (
    <div className="pb-40">
      <TopBar
        title="Your Cart"
        right={
          lines.length ? (
            <button
              onClick={clear}
              className="text-xs text-muted"
            >
              Clear
            </button>
          ) : undefined
        }
      />
      <div className="p-4">
        {lines.length === 0 ? (
          <p className="py-20 text-center text-muted">Your cart is empty.</p>
        ) : (
          <div className="space-y-3">
            {lines.map((l) => (
              <div
                key={l.id}
                className="flex gap-3 rounded-xl border border-border bg-surface p-3"
              >
                <div className="flex-1">
                  <p className="font-medium">{l.name}</p>
                  {l.selectedAddOns.length > 0 && (
                    <p className="text-xs text-muted">
                      {l.selectedAddOns.map((a) => a.name).join(", ")}
                    </p>
                  )}
                  {l.instructions && (
                    <p className="text-xs italic text-muted">
                      "{l.instructions}"
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-md border border-border px-1.5">
                      <button
                        onClick={() => updateQty(l.id, -1)}
                        className="px-1.5 py-1"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm">
                        {l.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(l.id, 1)}
                        className="px-1.5 py-1"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeLine(l.id)}
                      className="text-xs text-danger"
                    >
                      Remove
                    </button>
                    <span className="ml-auto text-sm">
                      {formatCurrency(l.unitPrice * l.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <Separator className="my-2" />
            <div className="flex gap-2">
              <Input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Coupon (try WELCOME10)"
              />
              <Button variant="outline" onClick={applyCoupon}>
                Apply
              </Button>
            </div>

            <div className="space-y-1.5 rounded-xl bg-surface p-4 text-sm">
              <Row label="Subtotal" value={formatCurrency(subtotal)} />
              {applied > 0 && (
                <Row
                  label="Discount"
                  value={`− ${formatCurrency(applied)}`}
                  accent
                />
              )}
              <Row
                label={`GST (${restaurant.gstPercent}%)`}
                value={formatCurrency(gst)}
              />
              <Row
                label={`Service (${restaurant.serviceChargePercent}%)`}
                value={formatCurrency(serviceCharge)}
              />
              <Separator className="my-2" />
              <div className="flex justify-between font-serif text-lg">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {lines.length > 0 && (
        <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-border bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button className="w-full" size="lg" onClick={place}>
            Place Order · {formatCurrency(total)}
          </Button>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className={accent ? "text-accent" : ""}>{value}</span>
    </div>
  );
}
