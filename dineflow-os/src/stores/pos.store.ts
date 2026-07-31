import { create } from "zustand";
import { services } from "@/services";
import type { Order } from "@/services/types";

interface PosState {
  orders: Order[];
  loading: boolean;
  refresh: () => Promise<void>;
}

export const usePosStore = create<PosState>((set) => ({
  orders: [],
  loading: false,

  async refresh() {
    set({ loading: true });
    const orders = await services.order.getAllOrders();
    set({ orders, loading: false });
  },
}));
