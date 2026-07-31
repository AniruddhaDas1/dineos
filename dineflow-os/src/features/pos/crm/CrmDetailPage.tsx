import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { services } from "@/services";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";
import { segmentCustomer, SEGMENT_CONFIG } from "@/lib/segments";
import { LoyaltyCard } from "@/features/customer/components/LoyaltyCard";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import type { CustomerProfile, Order } from "@/services/types";

export function CrmDetailPage() {
  const { mobile = "" } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      services.customer.getCustomerProfile(mobile),
      services.customer.getHistory({ name: "", mobile }),
    ]).then(([p, o]) => {
      setProfile(p ?? null);
      setOrders(o);
      setLoading(false);
    });
  }, [mobile]);

  const avgOrderValue =
    orders.length > 0
      ? orders.reduce((s, o) => s + o.total, 0) / orders.length
      : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-muted">
        Loading profile…
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate("/pos/crm")}
          className="mb-4 flex items-center gap-2 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <p className="py-12 text-center text-muted">Customer not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <button
        onClick={() => navigate("/pos/crm")}
        className="mb-6 flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to CRM
      </button>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 text-xl font-medium text-accent">
          {profile.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl">{profile.name}</h1>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                SEGMENT_CONFIG[segmentCustomer(profile)].className
              )}
            >
              {SEGMENT_CONFIG[segmentCustomer(profile)].label}
            </span>
          </div>
          <p className="text-sm text-muted">{profile.mobile}</p>
        </div>
      </div>

      {/* Loyalty card */}
      <div className="mt-6">
        <LoyaltyCard tier={profile.tier} points={profile.points} />
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatBox label="Visits" value={String(profile.visits)} />
        <StatBox label="Total Spend" value={formatCurrency(profile.totalSpend)} />
        <StatBox label="Avg Order" value={formatCurrency(avgOrderValue)} />
        <StatBox
          label="Avg Rating"
          value={profile.avgRating > 0 ? profile.avgRating.toFixed(1) : "—"}
        />
      </div>

      {/* Favorite items */}
      {profile.favoriteItems.length > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-surface p-5">
          <p className="mb-3 text-xs uppercase tracking-widest text-muted">
            Favorite Items
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.favoriteItems.map((item) => (
              <span
                key={item}
                className="rounded-full bg-surface-2 px-3 py-1 text-sm"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Order history */}
      <div className="mt-8">
        <h2 className="mb-4 font-serif text-xl">Order History</h2>
        <div className="space-y-2">
          {orders.map((order) => (
            <button
              key={order.id}
              onClick={() => navigate(`/pos/orders/${order.id}`)}
              className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-5 py-4 text-left transition-colors hover:bg-surface-2"
            >
              <div>
                <p className="text-sm font-mono text-muted">
                  #{order.id.slice(-5)}
                </p>
                <p className="text-xs text-muted">
                  Table {order.tableNumber} ·{" "}
                  {new Date(order.placedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
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
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 font-serif text-xl">{value}</p>
    </div>
  );
}
