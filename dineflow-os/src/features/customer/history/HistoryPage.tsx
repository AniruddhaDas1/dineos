import { useEffect, useState } from "react";
import { useSessionStore } from "@/stores/session.store";
import { useOrderStore } from "@/stores/order.store";
import { services } from "@/services";
import { TopBar } from "../components/TopBar";
import { LoyaltyCard } from "../components/LoyaltyCard";
import { formatCurrency } from "@/lib/format";
import type { CustomerProfile } from "@/services/types";

export function HistoryPage() {
  const customer = useSessionStore((s) => s.customer)!;
  const pastOrders = useOrderStore((s) => s.pastOrders);
  const loadHistory = useOrderStore((s) => s.loadHistory);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);

  useEffect(() => {
    loadHistory(customer);
    services.customer.getCustomerProfile(customer.mobile).then((p) =>
      setProfile(p ?? null)
    );
  }, [customer, loadHistory]);

  const memberSince = pastOrders.length
    ? Math.min(...pastOrders.map((o) => o.placedAt))
    : null;

  return (
    <div>
      <TopBar title="Your Orders" />
      <div className="p-4">
        {/* Loyalty + stats */}
        {profile ? (
          <div className="mb-4 space-y-4">
            <LoyaltyCard tier={profile.tier} points={profile.points} />

            <div className="grid grid-cols-2 gap-3">
              <Stat label="Visits" value={String(profile.visits)} />
              <Stat label="Total Spend" value={formatCurrency(profile.totalSpend)} />
              {profile.avgRating > 0 && (
                <Stat
                  label="Avg Rating"
                  value={`★ ${profile.avgRating.toFixed(1)}`}
                />
              )}
              {memberSince && (
                <Stat
                  label="Member Since"
                  value={new Date(memberSince).toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  })}
                />
              )}
            </div>

            {profile.favoriteItems.length > 0 && (
              <div className="rounded-xl border border-border bg-surface p-4">
                <p className="mb-2 text-xs uppercase tracking-widest text-muted">
                  Your Favorites
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.favoriteItems.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-surface-2 px-3 py-1 text-xs"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="py-20 text-center text-muted">
            No previous orders yet.
          </p>
        )}

        {/* Order list */}
        {pastOrders.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-muted">
              Order History
            </p>
            {pastOrders.map((o) => (
              <div
                key={o.id}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <div className="flex justify-between">
                  <span className="font-medium">Table {o.tableNumber}</span>
                  <span className="capitalize text-muted">{o.status}</span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {new Date(o.placedAt).toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-muted">
                  {o.lines.map((l) => `${l.quantity}× ${l.name}`).join(", ")}
                </p>
                <p className="mt-2 font-serif text-lg">
                  {formatCurrency(o.total)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <p className="text-xs uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 font-serif text-lg">{value}</p>
    </div>
  );
}
