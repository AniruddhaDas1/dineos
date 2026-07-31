import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Wallet,
  Banknote,
  Smartphone,
  Printer,
} from "lucide-react";
import { services } from "@/services";
import { usePosCartStore } from "@/stores/posCart.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Category, MenuItem } from "@/services/types";

const PAYMENT_METHODS = [
  { value: "cash" as const, label: "Cash", icon: Banknote },
  { value: "card" as const, label: "Card", icon: CreditCard },
  { value: "upi" as const, label: "UPI", icon: Smartphone },
  { value: "wallet" as const, label: "Wallet", icon: Wallet },
];

export function InstantPosPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const cart = usePosCartStore();

  useEffect(() => {
    services.menu.getCategories().then((cats) => {
      setCategories(cats);
      if (!selectedCat && cats.length > 0) setSelectedCat(cats[0].id);
    });
    services.menu.getMenuItems().then(setItems);
  }, []);

  const filtered = items.filter((it) => {
    const catOk = !selectedCat || it.categoryId === selectedCat;
    const searchOk = !search || it.name.toLowerCase().includes(search.toLowerCase());
    const avail = it.available;
    return catOk && searchOk && avail;
  });

  const discountAmount = +(cart.subtotal * (cart.discount / 100)).toFixed(2);
  const gst = +((cart.subtotal - discountAmount) * 0.05).toFixed(2);
  const sc = +((cart.subtotal - discountAmount) * 0.10).toFixed(2);
  const grandTotal = +(cart.subtotal - discountAmount + gst + sc).toFixed(2);

  async function handleCheckout() {
    if (cart.lines.length === 0) return;
    const { orderId, total } = await cart.checkout();
    await services.print.printReceipt(orderId);
    setToast(`Order #${orderId.slice(-5)} completed. Total: ${formatCurrency(total)}`);
    setTimeout(() => setToast(""), 3000);
  }

  return (
    <div className="flex h-[calc(100vh-0px)] bg-background">
      {/* Left: Menu Browser */}
      <div className="flex flex-1 flex-col overflow-hidden border-r border-border">
        <div className="border-b border-border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
            <Input
              className="pl-9"
              placeholder="Search menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCat(null)}
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors",
                !selectedCat ? "bg-accent text-accent-foreground" : "bg-surface-2 text-muted hover:text-foreground"
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  selectedCat === cat.id ? "bg-accent text-accent-foreground" : "bg-surface-2 text-muted hover:text-foreground"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  const addOns = (item.addOnGroups ?? []).flatMap((g) => g.options);
                  cart.addItem(item, addOns.filter((a) => a.selected));
                }}
                className="flex flex-col rounded-xl border border-border bg-surface p-3 text-left transition-colors hover:border-accent/40"
              >
                {item.image && (
                  <img src={item.image} alt={item.name} className="mb-2 h-24 w-full rounded-lg object-cover" />
                )}
                <p className="text-sm font-medium">{item.name}</p>
                {item.description && (
                  <p className="mt-0.5 text-xs text-muted line-clamp-1">{item.description}</p>
                )}
                <p className="mt-2 font-serif text-sm text-accent">{formatCurrency(item.price)}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Cart Panel */}
      <div className="flex w-96 flex-col bg-surface">
        <div className="border-b border-border p-4">
          <h2 className="font-serif text-lg">Current Sale</h2>
          <p className="text-xs text-muted">{cart.count} item{cart.count !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {cart.lines.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted">Cart is empty. Tap items to add.</p>
          ) : (
            <div className="space-y-2">
              {cart.lines.map((line) => (
                <div key={line.id} className="flex items-center justify-between rounded-lg border border-border bg-surface-2 p-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{line.name}</p>
                    {line.selectedAddOns.length > 0 && (
                      <p className="text-xs text-muted truncate">+ {line.selectedAddOns.map((a) => a.name).join(", ")}</p>
                    )}
                    <p className="text-xs text-accent">{formatCurrency(line.unitPrice)} × {line.quantity}</p>
                  </div>
                  <div className="ml-2 flex items-center gap-1">
                    <button onClick={() => cart.updateQty(line.id, -1)} className="rounded p-1 text-muted hover:text-foreground">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-5 text-center text-sm">{line.quantity}</span>
                    <button onClick={() => cart.updateQty(line.id, 1)} className="rounded p-1 text-muted hover:text-foreground">
                      <Plus className="h-4 w-4" />
                    </button>
                    <button onClick={() => cart.removeLine(line.id)} className="rounded p-1 text-muted hover:text-danger">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-border p-4 space-y-3">
          {/* Discount */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">Discount (%)</span>
            <Input
              type="number"
              min={0}
              max={100}
              value={cart.discount}
              onChange={(e) => cart.setDiscount(parseInt(e.target.value) || 0)}
              className="w-20 h-8 text-right"
            />
          </div>
          <Separator />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span><span>{formatCurrency(cart.subtotal)}</span>
            </div>
            {cart.discount > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount</span><span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted">
              <span>GST (5%)</span><span>{formatCurrency(gst)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Service (10%)</span><span>{formatCurrency(sc)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-serif">
              <span>Total</span><span className="text-accent">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
          {/* Payment Methods */}
          <div className="grid grid-cols-4 gap-1.5">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.value}
                onClick={() => cart.setPaymentMethod(m.value)}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg border p-2 text-xs transition-colors",
                  cart.paymentMethod === m.value ? "border-accent bg-accent/10 text-accent" : "border-border text-muted hover:text-foreground"
                )}
              >
                <m.icon className="h-5 w-5" />
                {m.label}
              </button>
            ))}
          </div>
          <Button className="w-full gap-2" size="lg" onClick={handleCheckout} disabled={cart.lines.length === 0}>
            <Printer className="h-4 w-4" />
            Place Order & Print Receipt
          </Button>
        </div>
      </div>
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-success px-6 py-3 text-sm font-medium text-white shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
