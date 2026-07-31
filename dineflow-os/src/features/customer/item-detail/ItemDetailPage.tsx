import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { services } from "@/services";
import { useCartStore } from "@/stores/cart.store";
import { useOrderContext } from "@/lib/orderContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TopBar } from "../components/TopBar";
import { VegMark } from "../components/VegMark";
import { SpiceDots } from "../components/SpiceDots";
import { Rating } from "../components/Rating";
import { BadgeRow } from "../components/BadgeRow";
import { formatCurrency } from "@/lib/format";
import type { AddOn, AddOnGroup, MenuItem } from "@/services/types";

export function ItemDetailPage() {
  const { itemId = "" } = useParams();
  const navigate = useNavigate();
  const { base } = useOrderContext();
  const addFromItem = useCartStore((s) => s.addFromItem);
  const [item, setItem] = useState<MenuItem | null>(null);
  const [groups, setGroups] = useState<AddOnGroup[]>([]);
  const [qty, setQty] = useState(1);
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    services.menu.getItem(itemId).then((it) => {
      if (!it) return;
      setItem(it);
      setGroups(
        (it.addOnGroups ?? []).map((g: AddOnGroup) => JSON.parse(JSON.stringify(g)))
      );
    });
  }, [itemId]);

  const selectedByGroup = useMemo(
    () => groups.map((g) => g.options.filter((o) => o.selected)),
    [groups]
  );

  const errors = useMemo(() => {
    const errs: Record<string, boolean> = {};
    groups.forEach((g, i) => {
      if (g.required && selectedByGroup[i].length < g.min) errs[g.id] = true;
    });
    return errs;
  }, [groups, selectedByGroup]);

  const valid = Object.keys(errors).length === 0;

  if (!item) return <TopBar title="Loading…" />;

  const selectedAddOns: AddOn[] = selectedByGroup.flat();
  const addOnTotal = selectedAddOns.reduce((s, a) => s + a.price, 0);
  const unitPrice = item.price + addOnTotal;

  function toggle(groupId: string, optId: string, max: number) {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const opts = g.options.map((o) => ({ ...o }));
        const target = opts.find((o) => o.id === optId)!;
        const selectedCount = opts.filter((o) => o.selected).length;
        if (target.selected) {
          // For radio groups (max === 1), prevent deselecting the only selected option
          if (max === 1) return g;
          target.selected = false;
        } else {
          if (max === 1) opts.forEach((o) => (o.selected = false));
          else if (selectedCount >= max) return g;
          target.selected = true;
        }
        return { ...g, options: opts };
      })
    );
  }

  function add() {
    if (!valid || !item) return;
    addFromItem(item, qty, selectedAddOns, instructions);
    navigate(`${base}/menu`);
  }

  return (
    <div className="pb-32">
      {/* Hero image */}
      <div className="relative">
        <img
          src={item.image}
          alt={item.name}
          className="h-64 w-full object-cover"
        />
        <div className="absolute inset-0 h-full w-full bg-gradient-to-t from-background to-transparent" />
        <div className="absolute inset-x-0 top-0">
          <TopBar />
        </div>
      </div>

      {/* Item info */}
      <div className="-mt-10 relative z-10 space-y-4 p-5">
        <div className="flex items-center gap-2">
          <VegMark type={item.vegType} />
          <h1 className="font-serif text-2xl">{item.name}</h1>
        </div>
        <p className="text-sm text-muted">{item.description}</p>
        <div className="flex items-center gap-3">
          <Rating value={item.rating} />
          <SpiceDots level={item.spiceLevel ?? 0} />
          {item.calories && (
            <span className="text-xs text-muted">{item.calories} kcal</span>
          )}
        </div>
        <BadgeRow badges={item.badges} />
        {item.ingredients && (
          <p className="text-xs text-muted">
            Ingredients: {item.ingredients.join(", ")}
          </p>
        )}
        <p className="font-serif text-xl">{formatCurrency(item.price)}</p>
      </div>

      {/* Add-on groups */}
      {groups.map((g) => (
        <div key={g.id} className="border-t border-border px-5 py-4">
          <div className="flex items-center justify-between">
            <p className="font-medium">
              {g.name}
              {g.required ? " *" : ""}
            </p>
            <span className="text-xs text-muted">
              {g.required ? `Min ${g.min}` : `Up to ${g.max}`}
            </span>
          </div>
          {errors[g.id] && (
            <p className="mt-1 text-xs text-danger">
              Please select at least {g.min}.
            </p>
          )}
          <div className="mt-2 space-y-2">
            {g.options.map((o) => (
              <label
                key={o.id}
                className="flex cursor-pointer items-center justify-between rounded-lg bg-surface px-3 py-2.5"
              >
                <span className="flex items-center gap-3">
                  <input
                    type={g.max === 1 ? "radio" : "checkbox"}
                    name={g.id}
                    checked={!!o.selected}
                    onChange={() => toggle(g.id, o.id, g.max)}
                    className="h-4 w-4 accent-[hsl(var(--accent))]"
                  />
                  <span>{o.name}</span>
                </span>
                {o.price > 0 && (
                  <span className="text-sm text-muted">
                    +{formatCurrency(o.price)}
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      ))}

      {/* Special instructions */}
      <div className="border-t border-border px-5 py-4">
        <p className="font-medium">Special instructions</p>
        <Textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="e.g. No onions"
          className="mt-2"
        />
      </div>

      {/* Bottom bar: quantity + add */}
      <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-border bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border px-2">
            <button
              className="px-2 py-2 text-lg"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              −
            </button>
            <span className="w-6 text-center">{qty}</span>
            <button
              className="px-2 py-2 text-lg"
              onClick={() => setQty((q) => q + 1)}
            >
              +
            </button>
          </div>
          <Button
            className="flex-1"
            size="lg"
            disabled={!valid}
            onClick={add}
          >
            Add · {formatCurrency(unitPrice * qty)}
          </Button>
        </div>
      </div>
    </div>
  );
}
