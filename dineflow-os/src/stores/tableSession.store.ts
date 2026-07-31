import { create } from "zustand";
import { persist } from "zustand/middleware";
import { services } from "@/services";
import type { TableSession, CartLine, MenuItem, AddOn } from "@/services/types";

interface TableSessionState {
  sessions: Record<string, TableSession>;
  openSession: (tableId: string, waiterId: string, waiterName: string) => TableSession;
  addItem: (tableId: string, item: MenuItem, selectedAddOns: AddOn[]) => void;
  updateQty: (tableId: string, lineId: string, delta: number) => void;
  removeLine: (tableId: string, lineId: string) => void;
  lockSession: (tableId: string) => void;
  checkout: (tableId: string) => Promise<string>;
  releaseTable: (tableId: string) => void;
  getSession: (tableId: string) => TableSession | undefined;
  getMySessions: (waiterId: string) => TableSession[];
}

function lineId(itemId: string, addOnIds: string[]): string {
  return [itemId, ...addOnIds.sort()].join("|");
}

export const useTableSessionStore = create<TableSessionState>()(
  persist(
    (set, get) => ({
      sessions: {},

      openSession(tableId, waiterId, waiterName) {
        const existing = get().sessions[tableId];
        if (existing && existing.locked) return existing;
        const session: TableSession = {
          id: `ses-${tableId}-${Date.now()}`,
          tableId,
          waiterId,
          waiterName,
          cartLines: existing?.cartLines ?? [],
          locked: false,
          startedAt: Date.now(),
        };
        set((s) => ({ sessions: { ...s.sessions, [tableId]: session } }));
        return session;
      },

      addItem(tableId, item, selectedAddOns) {
        const session = get().sessions[tableId];
        if (!session) return;
        const addOnPrice = selectedAddOns.reduce((s, a) => s + a.price, 0);
        const unitPrice = item.price + addOnPrice;
        const id = lineId(item.id, selectedAddOns.map((a) => a.id));
        const existing = session.cartLines.find((l) => l.id === id);
        let lines: CartLine[];
        if (existing) {
          lines = session.cartLines.map((l) =>
            l.id === id ? { ...l, quantity: l.quantity + 1 } : l
          );
        } else {
          lines = [
            ...session.cartLines,
            { id, itemId: item.id, name: item.name, basePrice: item.price, selectedAddOns, quantity: 1, unitPrice },
          ];
        }
        set((s) => ({
          sessions: { ...s.sessions, [tableId]: { ...session, cartLines: lines } },
        }));
      },

      updateQty(tableId, lineId, delta) {
        const session = get().sessions[tableId];
        if (!session) return;
        const lines = session.cartLines
          .map((l) => {
            if (l.id !== lineId) return l;
            const qty = l.quantity + delta;
            return qty <= 0 ? null : { ...l, quantity: qty };
          })
          .filter(Boolean) as CartLine[];
        set((s) => ({
          sessions: { ...s.sessions, [tableId]: { ...session, cartLines: lines } },
        }));
      },

      removeLine(tableId, lineId) {
        const session = get().sessions[tableId];
        if (!session) return;
        const lines = session.cartLines.filter((l) => l.id !== lineId);
        set((s) => ({
          sessions: { ...s.sessions, [tableId]: { ...session, cartLines: lines } },
        }));
      },

      lockSession(tableId) {
        const session = get().sessions[tableId];
        if (!session) return;
        set((s) => ({
          sessions: { ...s.sessions, [tableId]: { ...session, locked: true } },
        }));
      },

      async checkout(tableId) {
        const session = get().sessions[tableId];
        if (!session || session.cartLines.length === 0) throw new Error("No items");
        const subtotal = session.cartLines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
        const gst = +(subtotal * 0.05).toFixed(2);
        const sc = +(subtotal * 0.10).toFixed(2);
        const total = +(subtotal + gst + sc).toFixed(2);
        const order = await services.order.placeOrder({
          tableId,
          tableNumber: 0,
          customer: { name: "Table Guest", mobile: "0000000000", isGuest: true },
          lines: session.cartLines,
          subtotal,
          gst,
          serviceCharge: sc,
          total,
          channel: "dine-in",
        });
        set((s) => {
          const { [tableId]: _, ...rest } = s.sessions;
          return { sessions: rest };
        });
        return order.id;
      },

      releaseTable(tableId) {
        set((s) => {
          const { [tableId]: _, ...rest } = s.sessions;
          return { sessions: rest };
        });
      },

      getSession(tableId) {
        return get().sessions[tableId];
      },

      getMySessions(waiterId) {
        return Object.values(get().sessions).filter((s) => s.waiterId === waiterId);
      },
    }),
    { name: "dineflow-table-sessions" }
  )
);
