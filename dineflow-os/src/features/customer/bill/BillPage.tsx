import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { services } from "@/services";
import { useOrderStore } from "@/stores/order.store";
import { TopBar } from "../components/TopBar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { printBill } from "@/lib/print";
import { CheckCircle2, CreditCard, Loader2, Printer, ChevronDown } from "lucide-react";
export function BillPage() {
  const { tableId = "", orderId = "" } = useParams();
  const navigate = useNavigate();
  const activeOrder = useOrderStore((s) => s.activeOrder);
  const setOrder = useOrderStore((s) => s.setOrder);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success">("idle");
  const setPaymentId = useState<string | null>(null)[1];
  const [printFormat, setPrintFormat] = useState<"85mm" | "58mm" | "a4">("85mm");
  const [showFormatMenu, setShowFormatMenu] = useState(false);

  const formatLabels = {
    "85mm": "85mm Thermal",
    "58mm": "58mm Thermal",
    "a4": "A4 Page",
  };

  async function pay() {
    if (!activeOrder) return;
    setPaymentStatus("processing");
    try {
      // 1. Create Payment Intent
      const { id } = await services.payment.createPaymentIntent(
        activeOrder.id,
        activeOrder.total
      );
      setPaymentId(id);

      // 2. Simulate payment verification
      const verified = await services.payment.verifyPayment(id);
      if (verified) {
        // 3. Update order status
        await services.order.requestBill(orderId);
        
        // Update local order state to match
        const updated = await services.order.getOrder(orderId);
        if (updated) setOrder(updated);
        
        setPaymentStatus("success");
      }
    } catch (e) {
      console.error("Payment failed", e);
      setPaymentStatus("idle");
    }
  }

  if (!activeOrder) return <TopBar title="Loading…" />;

  return (
    <div className="pb-40">
      <TopBar title="Bill" />
      <div className="p-5 md:mx-auto md:max-w-2xl">
        <p className="font-serif text-xl">Saffron &amp; Smoke</p>
        <p className="text-xs text-muted">
          {activeOrder.tableId === "online" 
            ? (activeOrder.channel === "pickup" ? "Pickup" : "Delivery") 
            : `Table ${activeOrder.tableNumber}`} · Order #{activeOrder.id.slice(-6)}
        </p>

        <div className="mt-4 rounded-xl border border-border bg-surface p-4 text-sm">
          {activeOrder.lines.map((l) => (
            <div key={l.id} className="flex justify-between py-1">
              <span className="text-muted">
                {l.quantity}× {l.name}
              </span>
              <span>{formatCurrency(l.unitPrice * l.quantity)}</span>
            </div>
          ))}
          <Separator className="my-3" />
          <Row label="Subtotal" value={formatCurrency(activeOrder.subtotal)} />
          <Row label="GST" value={formatCurrency(activeOrder.gst)} />
          <Row
            label="Service charge"
            value={formatCurrency(activeOrder.serviceCharge)}
          />
          {activeOrder.deliveryFee && activeOrder.deliveryFee > 0 && (
            <Row label="Delivery Fee" value={formatCurrency(activeOrder.deliveryFee)} />
          )}
          <Separator className="my-3" />
          <div className="flex justify-between font-serif text-lg">
            <span>Total</span>
            <span>{formatCurrency(activeOrder.total)}</span>
          </div>
        </div>

        {paymentStatus === "success" ? (
          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="h-14 w-14 text-success" />
            <p className="font-serif text-xl">Payment successful</p>
            <p className="text-sm text-muted">
              Thank you for dining with us.
            </p>

            {/* Print format selector */}
            <div className="relative mt-3">
              <Button
                variant="outline"
                onClick={() => setShowFormatMenu(!showFormatMenu)}
                className="gap-2"
              >
                <Printer className="h-4 w-4" /> {formatLabels[printFormat]} <ChevronDown className="h-4 w-4" />
              </Button>
              {showFormatMenu && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 z-10 mt-1 w-40 rounded-lg border border-border bg-surface shadow-lg">
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
              className="mt-2 gap-2"
              onClick={() => printBill(activeOrder, printFormat)}
            >
              <Printer className="h-4 w-4" /> Print Bill
            </Button>

            <Button
              className="mt-3"
              onClick={() =>
                navigate(`/order/table/${tableId}/order/${orderId}/feedback`)
              }
            >
              Rate your experience
            </Button>
          </div>
        ) : (
          <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 space-y-2 border-t border-border bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:max-w-xl">
            <Button 
              className="w-full" 
              size="lg" 
              disabled={paymentStatus === "processing"}
              onClick={pay}
            >
              {paymentStatus === "processing" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay {formatCurrency(activeOrder.total)} Online
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(-1)}
            >
              Request bill at counter
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-muted">{label}</span>
      <span>{value}</span>
    </div>
  );
}
