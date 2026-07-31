import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Printer, Check, CreditCard, ChevronDown } from "lucide-react";
import { services } from "@/services";
import { usePosStore } from "@/stores/pos.store";
import { formatCurrency } from "@/lib/format";
import { usePermission } from "@/lib/permissions";
import { printBill } from "@/lib/print";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import { ChannelBadge } from "../components/ChannelBadge";
import type { Order, OrderStatus } from "@/services/types";


const STATUS_FLOW: OrderStatus[] = [
  "received",
  "preparing",
  "ready",
  "served",
  "billed",
];

export function OrderDetailPage() {
  const { orderId = "" } = useParams();
  const navigate = useNavigate();
  const refresh = usePosStore((s) => s.refresh);
  const [order, setOrder] = useState<Order | null>(null);
  const [showBill, setShowBill] = useState(false);
  const [paid, setPaid] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const canAdvance = usePermission("orders:advance");
  const canBill = usePermission("orders:bill");
  const canPrint = usePermission("orders:print");

  useEffect(() => {
    services.order.getOrder(orderId).then((o) => {
      if (o) setOrder(o);
    });
  }, [orderId]);

  if (!order) {
    return (
      <div className="flex items-center justify-center p-12 text-muted">
        Loading order…
      </div>
    );
  }

  const currentIndex = STATUS_FLOW.indexOf(order.status);

  async function advanceStatus() {
    if (currentIndex >= STATUS_FLOW.length - 1) return;
    const next = STATUS_FLOW[currentIndex + 1];
    await services.order.updateOrderStatus(orderId, next);
    const updated = await services.order.getOrder(orderId);
    if (updated) setOrder(updated);
    refresh();
  }

  async function markPaid() {
    if (!order) return;
    
    if (order.paymentId) {
      setVerifying(true);
      try {
        const verified = await services.payment.verifyPayment(order.paymentId);
        if (!verified) {
          alert("Payment verification failed.");
          return;
        }
      } catch (e) {
        alert("Error verifying payment.");
        setVerifying(false);
        return;
      } finally {
        setVerifying(false);
      }
    }

    await services.order.updateOrderStatus(orderId, "billed");
    setPaid(true);
    refresh();
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <button
        onClick={() => navigate("/pos/orders")}
        className="mb-6 flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl">Order #{order.id.slice(-5)}</h1>
            <ChannelBadge channel={order.channel} />
          </div>
          <p className="mt-1 text-sm text-muted">
            {order.tableId === "online"
              ? (order.channel === "pickup" ? "Pickup" : "Delivery")
              : `Table ${order.tableNumber}`}{" "}
            · {order.customer.name} ({order.customer.mobile})
            <br />
            Placed{" "}
            {new Date(order.placedAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Status stepper */}
      <div className="mt-8 rounded-xl border border-border bg-surface p-6">
        <p className="mb-4 text-xs uppercase tracking-widest text-muted">
          Order Status
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FLOW.map((status, i) => (
            <div key={status} className="flex items-center gap-2">
              <button
                onClick={async () => {
                  if (i > currentIndex) return;
                  // Allow jumping back to any prior status
                  await services.order.updateOrderStatus(orderId, status);
                  const updated = await services.order.getOrder(orderId);
                  if (updated) setOrder(updated);
                  refresh();
                }}
                className={`rounded-full px-4 py-2 text-xs font-medium capitalize transition-colors ${
                  i === currentIndex
                    ? "bg-accent text-accent-foreground"
                    : i < currentIndex
                      ? "bg-success/15 text-success"
                      : "bg-surface-2 text-muted cursor-default"
                }`}
              >
                {status}
              </button>
              {i < STATUS_FLOW.length - 1 && (
                <div
                  className={`h-px w-4 ${
                    i < currentIndex ? "bg-success" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        {currentIndex < STATUS_FLOW.length - 1 && canAdvance && (
          <Button className="mt-4" onClick={advanceStatus}>
            Advance to {STATUS_FLOW[currentIndex + 1]}
          </Button>
        )}
      </div>

      {/* Order items */}
      <div className="mt-6 rounded-xl border border-border bg-surface p-6">
        <p className="mb-4 text-xs uppercase tracking-widest text-muted">
          Items
        </p>
        <div className="space-y-3">
          {order.lines.map((line) => (
            <div
              key={line.id}
              className="flex items-start justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  <span className="text-muted">{line.quantity}× </span>
                  {line.name}
                </p>
                {line.selectedAddOns.length > 0 && (
                  <p className="text-xs text-muted">
                    + {line.selectedAddOns.map((a) => a.name).join(", ")}
                  </p>
                )}
                {line.instructions && (
                  <p className="text-xs italic text-accent">
                    "{line.instructions}"
                  </p>
                )}
              </div>
              <span className="whitespace-nowrap text-sm">
                {formatCurrency(line.unitPrice * line.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Special requests */}
      {order.specialRequests && order.specialRequests.length > 0 && (
        <div className="mt-4 rounded-xl border border-accent/30 bg-accent/5 p-4">
          <p className="text-xs uppercase tracking-widest text-accent">
            Assistance Requests
          </p>
          <p className="mt-1 capitalize text-sm text-accent">
            {order.specialRequests.join(", ")}
          </p>
        </div>
      )}

      {/* Delivery address (online orders) */}
      {order.tableId === "online" && order.deliveryAddress && (
        <div className="mt-4 rounded-xl border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-widest text-muted">
            {order.channel === "delivery" ? "Delivery Address" : "Pickup"}
          </p>
          {order.channel === "delivery" && (
            <p className="mt-1 text-sm">
              {order.deliveryAddress.line1}
              {order.deliveryAddress.line2 &&
                `, ${order.deliveryAddress.line2}`}
              <br />
              {order.deliveryAddress.city} — {order.deliveryAddress.pincode}
              {order.deliveryAddress.landmark &&
                ` (Landmark: ${order.deliveryAddress.landmark})`}
            </p>
          )}
        </div>
      )}

      {/* Bill toggle */}
      {canPrint && (
      <div className="mt-6">
        <Button
          variant="outline"
          onClick={async () => {
            setShowBill(!showBill);
            if (!showBill) {
              await services.print.printReceipt(order.id);
            }
          }}
        >
          {showBill ? "Hide Bill" : "Print Bill"}
        </Button>
      </div>
      )}

      {/* Bill view */}
      {showBill && (
        <BillView order={order} paid={paid} verifying={verifying} canBill={canBill} onMarkPaid={markPaid} />
      )}
    </div>
  );
}

function BillView({
  order,
  paid,
  verifying,
  canBill,
  onMarkPaid,
}: {
  order: Order;
  paid: boolean;
  verifying: boolean;
  canBill: boolean;
  onMarkPaid: () => void;
}) {
  const [printFormat, setPrintFormat] = useState<"85mm" | "58mm" | "a4">("85mm");
  const [showFormatMenu, setShowFormatMenu] = useState(false);

  const formatLabels = {
    "85mm": "85mm Thermal",
    "58mm": "58mm Thermal",
    "a4": "A4 Page",
  };

  return (
    <div className="mt-4 rounded-xl border border-border bg-surface p-6 print:border-none print:bg-white print:text-black">
      {/* Bill header */}
      <div className="text-center">
        <p className="font-serif text-2xl print:text-black">Saffron &amp; Smoke</p>
        <p className="text-xs text-muted print:text-gray-600">
          Modern Indian Fine Dining
        </p>
        <p className="mt-2 text-xs text-muted">
          Bill #{order.id.slice(-5)} ·{" "}
          {order.tableId === "online"
            ? (order.channel === "pickup" ? "Pickup" : "Delivery")
            : `Table ${order.tableNumber}`}
        </p>
      </div>

      <Separator className="my-4 print:bg-gray-300" />

      {/* Items */}
      <div className="space-y-2">
        {order.lines.map((line) => (
          <div key={line.id} className="flex justify-between text-sm">
            <span className="print:text-black">
              {line.quantity}× {line.name}
            </span>
            <span className="print:text-black">
              {formatCurrency(line.unitPrice * line.quantity)}
            </span>
          </div>
        ))}
      </div>

      <Separator className="my-4 print:bg-gray-300" />

      {/* Totals */}
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between text-muted">
          <span>Subtotal</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted">
          <span>GST (5%)</span>
          <span>{formatCurrency(order.gst)}</span>
        </div>
        <div className="flex justify-between text-muted">
          <span>Service Charge (10%)</span>
          <span>{formatCurrency(order.serviceCharge)}</span>
        </div>
        {order.deliveryFee != null && order.deliveryFee > 0 && (
          <div className="flex justify-between text-muted">
            <span>Delivery Fee</span>
            <span>{formatCurrency(order.deliveryFee)}</span>
          </div>
        )}
        <Separator className="my-2 print:bg-gray-300" />
        <div className="flex justify-between font-serif text-lg print:text-black">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>

      <Separator className="my-4 print:bg-gray-300" />

      {/* Actions */}
      <div className="flex flex-wrap gap-3 print:hidden">
        {/* Print format dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setShowFormatMenu(!showFormatMenu)}
            className="gap-2"
          >
            <Printer className="h-4 w-4" /> {formatLabels[printFormat]} <ChevronDown className="h-4 w-4" />
          </Button>
          {showFormatMenu && (
            <div className="absolute top-full left-0 z-10 mt-1 w-40 rounded-lg border border-border bg-surface shadow-lg">
              {(["85mm", "58mm", "a4"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => {
                    setPrintFormat(fmt);
                    setShowFormatMenu(false);
                  }}
                  className={`block w-full px-4 py-2 text-left text-sm hover:bg-surface-2 ${
                    printFormat === fmt ? "text-accent" : "text-foreground"
                  }`}
                >
                  {formatLabels[fmt]}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          variant="outline"
          onClick={() => printBill(order, printFormat)}
          className="gap-2"
        >
          <Printer className="h-4 w-4" /> Print
        </Button>

        {canBill && !paid && (
          <Button onClick={onMarkPaid} disabled={verifying}>
            {verifying ? (
              <>
                <span className="mr-2 animate-spin">◌</span> Verifying...
              </>
            ) : (
              <>
                {order.paymentId && <CreditCard className="mr-2 h-4 w-4" />}
                Mark as Paid
              </>
            )}
          </Button>
        )}
        {canBill && paid && (
          <Button variant="secondary" className="gap-2" disabled>
            <Check className="h-4 w-4" /> Paid
          </Button>
        )}
      </div>
    </div>
  );
}
