import { create } from "zustand";
import { services } from "@/services";
import type { Order, OrderStatus } from "@/services/types";

const STATUS_FLOW: OrderStatus[] = [
  "received",
  "preparing",
  "ready",
  "served",
];

interface KdsState {
  orders: Order[];
  stationName: string;
  setStationName: (name: string) => void;
  refresh: () => Promise<void>;
  advanceStatus: (orderId: string) => Promise<void>;
}

export const useKdsStore = create<KdsState>((set, get) => ({
  orders: [],
  stationName: "Main Kitchen",

  setStationName(name: string) {
    set({ stationName: name });
  },

  async refresh() {
    const orders = await services.order.getActiveOrders();
    set({ orders });
  },

  async advanceStatus(orderId: string) {
    const orders = get().orders;
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const idx = STATUS_FLOW.indexOf(order.status);
    if (idx < 0 || idx >= STATUS_FLOW.length - 1) return;

    const next = STATUS_FLOW[idx + 1];
    await services.order.updateOrderStatus(orderId, next);

    // Optimistic update: remove from local list
    set({ orders: orders.filter((o) => o.id !== orderId) });
  },
}));
