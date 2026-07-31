import { useEffect, useState } from "react";
import { X, Plus, Minus, Trash2, Lock, Save } from "lucide-react";
import { services } from "@/services";
import { useTableSessionStore } from "@/stores/tableSession.store";
import { usePosAuthStore } from "@/stores/posAuth.store";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import type { MenuItem, Category } from "@/services/types";

interface TableSessionDrawerProps {
  tableId: string;
  tableLabel: string;
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function TableSessionDrawer({ tableId, tableLabel, open, onClose, onCheckout }: TableSessionDrawerProps) {
  const staff = usePosAuthStore((s) => s.staff);
  const session = useTableSessionStore((s) => s.sessions[tableId]);
  const openSession = useTableSessionStore((s) => s.openSession);
  const addItem = useTableSessionStore((s) => s.addItem);
  const updateQty = useTableSessionStore((s) => s.updateQty);
  const removeLine = useTableSessionStore((s) => s.removeLine);
  const lockSession = useTableSessionStore((s) => s.lockSession);
  const checkout = useTableSessionStore((s) => s.checkout);

  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  useEffect(() => {
    services.menu.getCategories().then((cats) => {
      setCategories(cats);
      if (!selectedCat && cats.length > 0) setSelectedCat(cats[0].id);
    });
    services.menu.getMenuItems().then(setItems);
  }, []);

  function handleOpen() {
    if (!staff) return;
    openSession(tableId, staff.id, staff.name);
  }

  async function handleCheckout() {
    try {
      const orderId = await checkout(tableId);
      console.log(`[Table] Checkout done. Order: ${orderId}`);
      onCheckout();
    } catch (e) {
      console.error("Checkout failed", e);
    }
  }

  const filtered = items.filter((it) => {
    const catOk = !selectedCat || it.categoryId === selectedCat;
    return catOk && it.available;
  });

  const subtotal = session ? session.cartLines.reduce((s, l) => s + l.unitPrice * l.quantity, 0) : 0;
  const gst = +(subtotal * 0.05).toFixed(2);
  const sc = +(subtotal * 0.10).toFixed(2);
  const total = +(subtotal + gst + sc).toFixed(2);

  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 flex w-[420px] flex-col border-l border-border bg-surface shadow-xl">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h2 className="font-serif text-lg">Table {tableLabel}</h2>
          {session && <p className="text-xs text-muted">Waiter: {session.waiterName}</p>}
        </div>
        <button onClick={onClose} className="rounded p-1 text-muted hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>

      {!session ? (
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <p className="mb-4 text-muted">No active session for this table.</p>
          <Button onClick={handleOpen}>Open Table</Button>
        </div>
      ) : (
        <>
          {/* Menu browser */}
          <div className="border-b border-border p-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedCat === cat.id ? "bg-accent text-accent-foreground" : "bg-surface-2 text-muted hover:text-foreground"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
          <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto p-3">
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  const addOns = (item.addOnGroups ?? []).flatMap((g) => g.options);
                  addItem(tableId, item, addOns.filter((a) => a.selected));
                }}
                className="rounded-lg border border-border bg-surface-2 p-2 text-left text-xs hover:border-accent/40"
              >
                <span className="font-medium">{item.name}</span>
                <br />
                <span className="text-accent">{formatCurrency(item.price)}</span>
              </button>
            ))}
          </div>

          {/* Cart */}
          <div className="flex-1 overflow-y-auto p-3">
            {session.cartLines.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted">Cart empty. Tap items to add.</p>
            ) : (
              <div className="space-y-1.5">
                {session.cartLines.map((line) => (
                  <div key={line.id} className="flex items-center justify-between rounded border border-border bg-surface-2 px-2 py-1">
                    <div className="min-w-0 flex-1 text-xs">
                      <span className="font-medium">{line.name}</span>
                      <span className="ml-1 text-muted">× {line.quantity}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => updateQty(tableId, line.id, -1)} className="p-0.5 text-muted hover:text-foreground">
                        <Minus className="h-3 w-3" />
                      </button>
                      <button onClick={() => updateQty(tableId, line.id, 1)} className="p-0.5 text-muted hover:text-foreground">
                        <Plus className="h-3 w-3" />
                      </button>
                      <button onClick={() => removeLine(tableId, line.id)} className="p-0.5 text-muted hover:text-danger">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-border p-3 space-y-2">
            <div className="flex justify-between text-xs text-muted">
              <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-base font-serif text-accent">
              <span>Total</span><span>{formatCurrency(total)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => lockSession(tableId)} className="gap-1">
                <Lock className="h-3 w-3" /> Hold
              </Button>
              <Button size="sm" onClick={handleCheckout} className="gap-1" disabled={session.cartLines.length === 0}>
                <Save className="h-3 w-3" /> Checkout
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
