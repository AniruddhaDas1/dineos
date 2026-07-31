import { useEffect, useState } from "react";
import { Check, X, MapPin, ShoppingBag } from "lucide-react";
import { services } from "@/services";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { simulateAggregatorOrder } from "@/services/mock/aggregatorSimulator";
import type { Order } from "@/services/types";

export function OnlineOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [toast, setToast] = useState("");

  async function refresh() {
    const all = await services.order.getAllOrders();
    setOrders(all.filter((o) => o.source === "zomato" || o.source === "swiggy"));
  }

  useEffect(() => { refresh(); }, []);

  const pendingOrders = orders.filter((o) => o.status === "pending_acceptance");
  const activeOrders = orders.filter((o) => o.status !== "pending_acceptance" && o.status !== "billed");

  async function handleAccept(orderId: string) {
    await services.order.updateOrderStatus(orderId, "received");
    setToast(`Order #${orderId.slice(-5)} accepted → kitchen queue`);
    setTimeout(() => setToast(""), 3000);
    refresh();
  }

  async function handleReject(orderId: string) {
    await services.order.updateOrderStatus(orderId, "billed");
    setToast(`Order #${orderId.slice(-5)} rejected`);
    setTimeout(() => setToast(""), 3000);
    refresh();
  }

  async function handleSimulate(source: "zomato" | "swiggy") {
    await simulateAggregatorOrder(source);
    refresh();
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Online Orders</h1>
          <p className="mt-1 text-sm text-muted">Accept or reject incoming delivery platform orders.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleSimulate("zomato")}>
            <ShoppingBag className="mr-1 h-4 w-4 text-red-500" /> Sim Zomato
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleSimulate("swiggy")}>
            <ShoppingBag className="mr-1 h-4 w-4 text-orange-500" /> Sim Swiggy
          </Button>
        </div>
      </div>

      {/* Pending Acceptance */}
      <div className="mt-6">
        <h2 className="mb-3 font-serif text-xl">
          Pending Acceptance
          {pendingOrders.length > 0 && (
            <span className="ml-2 rounded-full bg-danger/15 px-2 py-0.5 text-xs font-bold text-danger">{pendingOrders.length}</span>
          )}
        </h2>
        {pendingOrders.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">No pending orders. Simulate one to test.</p>
        ) : (
          <div className="space-y-3">
            {pendingOrders.map((order) => (
              <OrderCard key={order.id} order={order}>
                <div className="flex items-center gap-2">
                  <Button size="sm" className="gap-1" onClick={() => handleAccept(order.id)}>
                    <Check className="h-3 w-3" /> Accept
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1 text-danger border-danger/30" onClick={() => handleReject(order.id)}>
                    <X className="h-3 w-3" /> Reject
                  </Button>
                </div>
              </OrderCard>
            ))}
          </div>
        )}
      </div>

      {/* Active Online Orders */}
      {activeOrders.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 font-serif text-xl">Active Online Orders</h2>
          <div className="space-y-3">
            {activeOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-success px-6 py-3 text-sm font-medium text-white shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, children }: { order: Order; children?: React.ReactNode }) {
  const sourceColor = order.source === "zomato" ? "text-red-500" : order.source === "swiggy" ? "text-orange-500" : "text-muted";
  return (
    <div className="flex items-start justify-between rounded-xl border border-border bg-surface p-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={sourceColor + " text-xs font-bold uppercase"}>{order.source}</span>
          <span className="text-xs text-muted">#{order.id.slice(-5)}</span>
        </div>
        <p className="mt-1 font-medium">{order.customer.name}</p>
        <p className="text-xs text-muted">{order.lines.map((l) => `${l.quantity}× ${l.name}`).join(", ")}</p>
        {order.deliveryAddress && (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted">
            <MapPin className="h-3 w-3" /> {order.deliveryAddress.line1}, {order.deliveryAddress.city}
          </p>
        )}
        <p className="mt-1 font-serif text-sm text-accent">{formatCurrency(order.total)}</p>
      </div>
      {children && <div className="ml-4">{children}</div>}
    </div>
  );
}
