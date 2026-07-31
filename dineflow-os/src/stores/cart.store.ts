import { create } from "zustand";
import type { AddOn, CartLine, MenuItem } from "@/services/types";
import { cartLineId } from "@/lib/id";

interface CartState {
  lines: CartLine[];
  addFromItem: (
    item: MenuItem,
    quantity: number,
    addOns: AddOn[],
    instructions: string
  ) => void;
  updateQty: (lineId: string, delta: number) => void;
  removeLine: (lineId: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
}

export const useCartStore = create<CartState>((set, get) => {
  const recompute = (lines: CartLine[]) => ({
    lines,
    count: lines.reduce((s, l) => s + l.quantity, 0),
    subtotal: lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0),
  });

  return {
    lines: [],
    count: 0,
    subtotal: 0,

    addFromItem(item, quantity, addOns, instructions) {
      const selectedAddOns = addOns.filter((a) => a.selected !== false);
      const id = cartLineId(
        item.id,
        selectedAddOns.map((a) => a.id),
        instructions || undefined
      );
      const unitPrice =
        item.price +
        selectedAddOns.reduce((s, a) => s + a.price, 0);
      const existing = get().lines;
      const match = existing.find((l) => l.id === id);
      let lines: CartLine[];
      if (match) {
        lines = existing.map((l) =>
          l.id === id ? { ...l, quantity: l.quantity + quantity } : l
        );
      } else {
        const line: CartLine = {
          id,
          itemId: item.id,
          name: item.name,
          basePrice: item.price,
          selectedAddOns,
          quantity,
          instructions: instructions || undefined,
          unitPrice,
        };
        lines = [...existing, line];
      }
      set(recompute(lines));
    },

    updateQty(lineId, delta) {
      const lines = get()
        .lines.map((l) =>
          l.id === lineId ? { ...l, quantity: l.quantity + delta } : l
        )
        .filter((l) => l.quantity > 0);
      set(recompute(lines));
    },

    removeLine(lineId) {
      set(recompute(get().lines.filter((l) => l.id !== lineId)));
    },

    clear() {
      set(recompute([]));
    },
  };
});
