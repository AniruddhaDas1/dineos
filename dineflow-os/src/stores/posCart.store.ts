import { create } from "zustand";
import { services } from "@/services";
import type { CartLine, MenuItem, AddOn } from "@/services/types";

interface PosCartState {
  lines: CartLine[];
  discount: number;
  paymentMethod: "cash" | "card" | "upi" | "wallet";
  subtotal: number;
  count: number;
  addItem: (item: MenuItem, selectedAddOns: AddOn[]) => void;
  updateQty: (lineId: string, delta: number) => void;
  removeLine: (lineId: string) => void;
  setDiscount: (pct: number) => void;
  setPaymentMethod: (m: "cash" | "card" | "upi" | "wallet") => void;
  checkout: () => Promise<{ orderId: string; total: number }>;
  clear: () => void;
}

function lineId(itemId: string, addOnIds: string[]): string {
  return [itemId, ...addOnIds.sort()].join("|");
}

export const usePosCartStore = create<PosCartState>((set, get) => ({
  lines: [],
  discount: 0,
  paymentMethod: "cash",
  subtotal: 0,
  count: 0,

  addItem(item, selectedAddOns) {
    const addOnPrice = selectedAddOns.reduce((s, a) => s + a.price, 0);
    const unitPrice = item.price + addOnPrice;
    const id = lineId(item.id, selectedAddOns.map((a) => a.id));
    const existing = get().lines.find((l) => l.id === id);
    let lines: CartLine[];
    if (existing) {
      lines = get().lines.map((l) =>
        l.id === id ? { ...l, quantity: l.quantity + 1 } : l
      );
    } else {
      lines = [
        ...get().lines,
        {
          id,
          itemId: item.id,
          name: item.name,
          basePrice: item.price,
          selectedAddOns,
          quantity: 1,
          unitPrice,
        },
      ];
    }
    const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
    set({ lines, subtotal, count: lines.reduce((s, l) => s + l.quantity, 0) });
  },

  updateQty(lineId, delta) {
    const lines = get().lines
      .map((l) => {
        if (l.id !== lineId) return l;
        const qty = l.quantity + delta;
        return qty <= 0 ? null : { ...l, quantity: qty };
      })
      .filter(Boolean) as CartLine[];
    const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
    set({ lines, subtotal, count: lines.reduce((s, l) => s + l.quantity, 0) });
  },

  removeLine(lineId) {
    const lines = get().lines.filter((l) => l.id !== lineId);
    const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
    set({ lines, subtotal, count: lines.reduce((s, l) => s + l.quantity, 0) });
  },

  setDiscount(pct) {
    set({ discount: Math.max(0, Math.min(100, pct)) });
  },

  setPaymentMethod(m) {
    set({ paymentMethod: m });
  },

  async checkout() {
    const { lines, subtotal, discount, paymentMethod } = get();
    const afterDiscount = +(subtotal * ((100 - discount) / 100)).toFixed(2);
    const gst = +(afterDiscount * 0.05).toFixed(2);
    const serviceCharge = +(afterDiscount * 0.10).toFixed(2);
    const total = +(afterDiscount + gst + serviceCharge).toFixed(2);
    const order = await services.order.placeOrder({
      tableId: "counter",
      tableNumber: 0,
      customer: { name: "Walk-in", mobile: "0000000000", isGuest: true },
      lines,
      subtotal: afterDiscount,
      gst,
      serviceCharge,
      total,
      channel: "dine-in",
    });
    set({ lines: [], discount: 0, paymentMethod, subtotal: 0, count: 0 });
    console.log(`[Instant POS] Order ${order.id} placed. Method: ${paymentMethod}, Total: ₹${total}`);
    return { orderId: order.id, total };
  },

  clear() {
    set({ lines: [], discount: 0, subtotal: 0, count: 0 });
  },
}));
