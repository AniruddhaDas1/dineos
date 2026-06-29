import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { services } from "@/services";
import { useOrderStore } from "@/stores/order.store";
import { TopBar } from "../components/TopBar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { CheckCircle2 } from "lucide-react";

export function BillPage() {
  const { tableId = "", orderId = "" } = useParams();
  const navigate = useNavigate();
  const activeOrder = useOrderStore((s) => s.activeOrder);
  const [paid, setPaid] = useState(false);

  async function pay() {
    await services.order.requestBill(orderId);
    setPaid(true);
  }

  if (!activeOrder) return <TopBar title="Loading…" />;

  return (
    <div className="pb-40">
      <TopBar title="Bill" />
      <div className="p-5">
        <p className="font-serif text-xl">Saffron &amp; Smoke</p>
        <p className="text-xs text-muted">
          Table {activeOrder.tableNumber} · Order #
          {activeOrder.id.slice(-6)}
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
          <Separator className="my-3" />
          <div className="flex justify-between font-serif text-lg">
            <span>Total</span>
            <span>{formatCurrency(activeOrder.total)}</span>
          </div>
        </div>

        {paid ? (
          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="h-14 w-14 text-success" />
            <p className="font-serif text-xl">Payment successful</p>
            <p className="text-sm text-muted">
              Thank you for dining with us.
            </p>
            <Button
              className="mt-3"
              onClick={() =>
                navigate(`/table/${tableId}/order/${orderId}/feedback`)
              }
            >
              Rate your experience
            </Button>
          </div>
        ) : (
          <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 space-y-2 border-t border-border bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button className="w-full" size="lg" onClick={pay}>
              Pay {formatCurrency(activeOrder.total)} Online
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
