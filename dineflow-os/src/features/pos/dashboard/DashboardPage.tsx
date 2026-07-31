import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  IndianRupee,
  Users,
  UtensilsCrossed,
  ShoppingBag,
  Bike,
} from "lucide-react";
import { usePosStore } from "@/stores/pos.store";
import { legacyTables } from "@/data/tables";
import { formatCurrency } from "@/lib/format";
import { usePermission } from "@/lib/permissions";
import { StatCard } from "../components/StatCard";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { simulateAggregatorOrder } from "@/services/mock/aggregatorSimulator";
import { DemandChart } from "@/features/ai/forecasting/DemandChart";
import { PeakHoursIndicator } from "@/features/ai/forecasting/PeakHoursIndicator";
import { InventoryAlert } from "@/features/ai/forecasting/InventoryAlert";

export function DashboardPage() {
  const orders = usePosStore((s) => s.orders);
  const refresh = usePosStore((s) => s.refresh);
  const navigate = useNavigate();
  const canSimulate = usePermission("aggregator:simulate");

  useEffect(() => {
    refresh();
  }, [refresh]);

  const activeOrders = orders.filter((o) =>
    ["received", "preparing", "ready", "served"].includes(o.status)
  );

  const billedOrders = orders.filter((o) => o.status === "billed");

  const revenue = billedOrders.reduce((s, o) => s + o.total, 0);

  const occupiedTables = new Set(
    activeOrders.map((o) => o.tableId)
  ).size;

  const avgItems =
    orders.length > 0
      ? (
          orders.reduce((s, o) => s + o.lines.reduce((ls, l) => ls + l.quantity, 0), 0) /
          orders.length
        ).toFixed(1)
      : 0;

  const recentOrders = orders.slice(0, 5);

  async function handleSimulate(source: "zomato" | "swiggy") {
    await simulateAggregatorOrder(source);
    refresh();
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-serif text-3xl">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">
        Real-time floor overview
      </p>

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ClipboardList}
          label="Active Orders"
          value={activeOrders.length}
          sub={`of ${orders.length} total`}
        />
        <StatCard
          icon={IndianRupee}
          label="Revenue"
          value={formatCurrency(revenue)}
          sub="from billed orders"
        />
        <StatCard
          icon={Users}
          label="Tables Occupied"
          value={`${occupiedTables}/${legacyTables.length}`}
        />
        <StatCard
          icon={UtensilsCrossed}
          label="Avg Items / Order"
          value={avgItems}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 font-serif text-xl">Recent Orders</h2>
          <div className="space-y-2">
            {recentOrders.length === 0 && (
              <p className="py-8 text-center text-muted">No orders yet.</p>
            )}
            {recentOrders.map((order) => (
              <button
                key={order.id}
                onClick={() => navigate(`/pos/orders/${order.id}`)}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-5 py-4 text-left transition-colors hover:bg-surface-2"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono text-muted">
                    #{order.id.slice(-5)}
                  </span>
                  <div>
                    <p className="font-medium">{order.customer.name}</p>
                    <p className="text-xs text-muted">
                      {order.tableId === "online"
                        ? (order.channel === "pickup" ? "Pickup" : "Delivery")
                        : `Table ${order.tableNumber}`} · {order.lines.length} item
                      {order.lines.length > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <OrderStatusBadge status={order.status} />
                  <span className="font-serif text-sm">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Aggregator Simulation Panel */}
        {canSimulate && (
        <div className="space-y-4">
          <h2 className="font-serif text-xl">Aggregator Simulation</h2>
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="mb-4 text-xs text-muted">
              Simulate incoming orders from external delivery platforms to test KDS and POS flows.
            </p>
            <div className="grid gap-3">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => handleSimulate("zomato")}
              >
                <ShoppingBag className="h-4 w-4 text-red-500" />
                Simulate Zomato Order
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => handleSimulate("swiggy")}
              >
                <Bike className="h-4 w-4 text-orange-500" />
                Simulate Swiggy Order
              </Button>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* AI Demand Forecast */}
      <div className="mt-6">
        <DemandChart />
      </div>

      {/* AI Peak Hours + Inventory Alerts */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <PeakHoursIndicator />
        <InventoryAlert />
      </div>
    </div>
  );
}
