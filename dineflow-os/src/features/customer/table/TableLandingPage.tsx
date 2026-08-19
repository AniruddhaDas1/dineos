import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { services } from "@/services";
import { useSessionStore } from "@/stores/session.store";
import { useOrderStore } from "@/stores/order.store";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LoyaltyCard } from "../components/LoyaltyCard";
import type { CustomerProfile, Restaurant, Table } from "@/services/types";

export function TableLandingPage() {
  const { tableId = "" } = useParams();
  const navigate = useNavigate();
  const customer = useSessionStore((s) => s.customer);
  const activeOrder = useOrderStore((s) => s.activeOrder);
  const loadActive = useOrderStore((s) => s.loadActive);
  const [table, setTable] = useState<Table | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);

  useEffect(() => {
    services.menu.getRestaurant().then(setRestaurant);
    services.table.getTables().then((allTables) => {
      setTable(allTables.find((t) => t.id === tableId) ?? null);
    });
    if (customer) {
      loadActive(tableId, customer);
      services.customer
        .getCustomerProfile(customer.mobile)
        .then((p) => setProfile(p ?? null));
    }
  }, [tableId, customer, loadActive]);

  if (!customer) {
    return <Navigate to="/order" replace />;
  }

  const isReturning = profile && profile.visits > 0;

  return (
    <div className="relative min-h-screen">
      {restaurant && (
        <img
          src={restaurant.heroUrl}
          alt=""
          className="absolute inset-0 h-72 w-full object-cover opacity-60"
        />
      )}
      <div className="absolute top-0 h-72 w-full bg-gradient-to-b from-transparent to-background" />
      <div className="relative z-10 p-6 pt-40 md:mx-auto md:max-w-2xl">
        {restaurant ? (
          <>
            <p className="font-serif text-3xl">{restaurant.name}</p>
            <p className="text-sm text-muted">{restaurant.tagline}</p>
          </>
        ) : (
          <Skeleton className="h-9 w-56" />
        )}

        {/* Welcome back for returning customers */}
        {isReturning && (
          <div className="mt-4">
            <p className="text-sm text-accent">
              Welcome back, {customer.name.split(" ")[0]}! 🎉
            </p>
            <p className="text-xs text-muted">
              {profile!.visits} visit{profile!.visits > 1 ? "s" : ""} ·{" "}
              {profile!.points} points · {profile!.tier} member
            </p>
          </div>
        )}

        <div className="mt-8 rounded-xl border border-border bg-surface p-5">
          <p className="text-xs uppercase tracking-widest text-muted">
            Seated at
          </p>
          <p className="font-serif text-2xl">Table {table?.label ?? "—"}</p>
          <p className="text-sm text-muted">{table?.capacity ?? "—"} seats</p>
        </div>

        {/* Compact loyalty card for returning customers */}
        {isReturning && (
          <div className="mt-4">
            <LoyaltyCard
              tier={profile!.tier}
              points={profile!.points}
              compact
            />
          </div>
        )}

        {activeOrder && (
          <button
            onClick={() =>
              navigate(`/order/table/${tableId}/order/${activeOrder.id}`)
            }
            className="mt-4 flex w-full items-center justify-between rounded-xl border border-accent/40 bg-accent/10 p-4 text-left"
          >
            <div>
              <p className="text-sm font-medium text-accent">
                You have an active order
              </p>
              <p className="text-xs text-muted">
                Status: {activeOrder.status}
              </p>
            </div>
            <span className="text-accent">Track →</span>
          </button>
        )}

        <div className="mt-6 grid gap-3">
          <Button
            size="lg"
            onClick={() => navigate(`/order/table/${tableId}/menu`)}
          >
            {activeOrder ? "Add more items" : "View Menu"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate(`/order/table/${tableId}/history`)}
          >
            Order history &amp; rewards
          </Button>
        </div>
      </div>
    </div>
  );
}
