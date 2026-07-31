import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/stores/cart.store";
import { useSessionStore } from "@/stores/session.store";
import { useOrderStore } from "@/stores/order.store";
import { useOnlineStore } from "@/stores/online.store";
import { useCouponStore } from "@/stores/coupon.store";
import { restaurant } from "@/data/restaurant";
import { getDeliveryFee } from "@/data/delivery";
import { services } from "@/services";
import { TopBar } from "@/features/customer/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/format";
import { computeTotals } from "@/lib/totals";
import { computeRedemption } from "@/lib/redeem";

export function OnlineCartPage() {
  const navigate = useNavigate();
  const lines = useCartStore((s) => s.lines);
  const subtotal = useCartStore((s) => s.subtotal);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeLine = useCartStore((s) => s.removeLine);
  const clear = useCartStore((s) => s.clear);
  const customer = useSessionStore((s) => s.customer)!;
  const placeOnline = useOrderStore((s) => s.placeOnline);

  const address = useOnlineStore((s) => s.address);
  const orderType = useOnlineStore((s) => s.orderType);

  const coupon = useCouponStore((s) => s.coupon);
  const applyCoupon = useCouponStore((s) => s.apply);
  const couponDiscount = useCouponStore((s) => s.discount);
  const clearCoupon = useCouponStore((s) => s.clear);

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [instructions, setInstructions] = useState("");
  const [placing, setPlacing] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState(false);
  const [pointsBalance, setPointsBalance] = useState(0);

  useEffect(() => {
    services.customer
      .getCustomerProfile(customer.mobile)
      .then((p) => setPointsBalance(p?.points ?? 0));
  }, [customer.mobile]);

  const redemption = useMemo(
    () =>
      redeemPoints
        ? computeRedemption({ pointsBalance, subtotal })
        : { pointsUsed: 0, discount: 0 },
    [redeemPoints, pointsBalance, subtotal]
  );

  const totalDiscount = couponDiscount + redemption.discount;
  const deliveryFee = orderType === "delivery" ? getDeliveryFee(subtotal) : 0;

  const totals = useMemo(
    () =>
      computeTotals({
        subtotal,
        gstPercent: restaurant.gstPercent,
        serviceChargePercent: restaurant.serviceChargePercent,
        discount: totalDiscount,
        deliveryFee,
      }),
    [subtotal, totalDiscount, deliveryFee]
  );

  function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    const ok = applyCoupon(couponInput, subtotal);
    setCouponError(ok ? "" : "Invalid or expired coupon.");
  }

  function handleClearCoupon() {
    clearCoupon();
    setCouponInput("");
    setCouponError("");
  }

  async function place() {
    if (!lines.length || !orderType) return;
    setPlacing(true);
    try {
      const order = await placeOnline({
        channel: orderType,
        customer,
        lines,
        subtotal,
        discount: totalDiscount,
        deliveryFee,
        deliveryAddress: orderType === "delivery" ? address : null,
        deliveryInstructions: instructions || undefined,
      });
      clear();
      clearCoupon();
      navigate(`/order/online/tracking/${order.id}`);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="pb-40">
      <TopBar
        title="Your Cart"
        right={
          lines.length ? (
            <button onClick={clear} className="text-xs text-muted">
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
                      &ldquo;{l.instructions}&rdquo;
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

            {/* Delivery instructions */}
            <div>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder={
                  orderType === "delivery"
                    ? "Delivery instructions (e.g. ring bell, leave at door)"
                    : "Special instructions for pickup"
                }
                rows={2}
              />
            </div>

            {/* Points redemption */}
            {pointsBalance > 0 && (
              <label className="flex cursor-pointer items-center justify-between rounded-xl bg-surface p-3">
                <div>
                  <p className="text-sm font-medium">
                    Redeem {pointsBalance} points
                  </p>
                  <p className="text-xs text-muted">
                    Worth {formatCurrency(pointsBalance)} · max 50% of order
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={redeemPoints}
                  onChange={(e) => setRedeemPoints(e.target.checked)}
                  className="h-5 w-5 accent-[hsl(var(--accent))]"
                />
              </label>
            )}

            {/* Coupon */}
            {coupon ? (
              <div className="flex items-center justify-between rounded-xl bg-accent/10 p-3">
                <div>
                  <p className="text-sm font-medium text-accent">
                    {coupon.code} applied
                  </p>
                  <p className="text-xs text-muted">
                    {coupon.type === "percent"
                      ? `${coupon.value}% off`
                      : `${formatCurrency(coupon.value)} off`}
                  </p>
                </div>
                <button
                  onClick={handleClearCoupon}
                  className="text-xs text-danger"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Coupon code"
                />
                <Button variant="outline" onClick={handleApplyCoupon}>
                  Apply
                </Button>
              </div>
            )}
            {couponError && (
              <p className="text-xs text-danger">{couponError}</p>
            )}

            {/* Totals */}
            <div className="space-y-1.5 rounded-xl bg-surface p-4 text-sm">
              <Row label="Subtotal" value={formatCurrency(subtotal)} />
              {totals.discount > 0 && (
                <Row
                  label="Discount"
                  value={`− ${formatCurrency(totals.discount)}`}
                  accent
                />
              )}
              <Row
                label={`GST (${restaurant.gstPercent}%)`}
                value={formatCurrency(totals.gst)}
              />
              <Row
                label={`Service (${restaurant.serviceChargePercent}%)`}
                value={formatCurrency(totals.serviceCharge)}
              />
              {deliveryFee > 0 ? (
                <Row label="Delivery Fee" value={formatCurrency(deliveryFee)} />
              ) : orderType === "delivery" ? (
                <Row label="Delivery Fee" value="FREE" accent />
              ) : null}
              <Separator className="my-2" />
              <div className="flex justify-between font-serif text-lg">
                <span>Total</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
              {deliveryFee > 0 && (
                <p className="text-xs text-muted">
                  Free delivery on orders above {formatCurrency(1000)}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {lines.length > 0 && (
        <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-border bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button
            className="w-full"
            size="lg"
            disabled={placing}
            onClick={place}
          >
            {placing
              ? "Placing…"
              : `Place ${orderType === "pickup" ? "Pickup" : "Delivery"} Order · ${formatCurrency(totals.total)}`}
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
