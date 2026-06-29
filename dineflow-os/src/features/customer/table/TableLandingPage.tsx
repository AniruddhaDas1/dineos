import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { services } from "@/services";
import { tables } from "@/data/tables";
import { useSessionStore } from "@/stores/session.store";
import { useOrderStore } from "@/stores/order.store";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Restaurant, Table } from "@/services/types";

export function TableLandingPage() {
  const { tableId = "" } = useParams();
  const navigate = useNavigate();
  const customer = useSessionStore((s) => s.customer);
  const activeOrder = useOrderStore((s) => s.activeOrder);
  const loadActive = useOrderStore((s) => s.loadActive);
  const [table, setTable] = useState<Table | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    services.menu.getRestaurant().then(setRestaurant);
    setTable(tables.find((t) => t.id === tableId) ?? null);
    if (customer) loadActive(tableId, customer);
  }, [tableId, customer, loadActive]);

  if (!customer) {
    navigate("/");
    return null;
  }

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
      <div className="relative z-10 p-6 pt-40">
        {restaurant ? (
          <>
            <p className="font-serif text-3xl">{restaurant.name}</p>
            <p className="text-sm text-muted">{restaurant.tagline}</p>
          </>
        ) : (
          <Skeleton className="h-9 w-56" />
        )}

        <div className="mt-8 rounded-xl border border-border bg-surface p-5">
          <p className="text-xs uppercase tracking-widest text-muted">
            Seated at
          </p>
          <p className="font-serif text-2xl">Table {table?.number ?? "—"}</p>
          <p className="text-sm text-muted">
            {table?.seats ?? "—"} seats
          </p>
        </div>

        {activeOrder && (
          <button
            onClick={() => navigate(`/table/${tableId}/order/${activeOrder.id}`)}
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
            onClick={() => navigate(`/table/${tableId}/menu`)}
          >
            {activeOrder ? "Add more items" : "View Menu"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate(`/table/${tableId}/history`)}
          >
            Order history
          </Button>
        </div>
      </div>
    </div>
  );
}
