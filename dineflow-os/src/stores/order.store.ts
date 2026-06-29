import { create } from "zustand";
import { services } from "@/services";
import { restaurant } from "@/data/restaurant";
import { tables } from "@/data/tables";
import type { Order, OrderStatus, AssistanceType, Customer } from "@/services/types";

interface OrderState {
  activeOrder: Order | null;
  pastOrders: Order[];
  loadActive: (tableId: string, customer: Customer) => Promise<void>;
  placeFromCart: (input: {
    tableId: string;
    customer: Customer;
    lines: Order["lines"];
    subtotal: number;
  }) => Promise<Order>;
  subscribe: (orderId: string) => () => void;
  setStatus: (status: OrderStatus) => void;
  setOrder: (order: Order) => void;
  loadHistory: (customer: Customer) => Promise<void>;
  requestAssistance: (type: AssistanceType) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  activeOrder: null,
  pastOrders: [],

  async loadActive(tableId, customer) {
    const active = await services.order.getActiveOrder(tableId, customer);
    set({ activeOrder: active ?? null });
  },

  async placeFromCart({ tableId, customer, lines, subtotal }) {
    const table = tables.find((t) => t.id === tableId)!;
    const gst = +(subtotal * (restaurant.gstPercent / 100)).toFixed(2);
    const serviceCharge = +(
      subtotal *
      (restaurant.serviceChargePercent / 100)
    ).toFixed(2);
    const total = +(subtotal + gst + serviceCharge).toFixed(2);
    const order = await services.order.placeOrder({
      tableId,
      tableNumber: table.number,
      customer,
      lines,
      subtotal,
      gst,
      serviceCharge,
      total,
    });
    set({ activeOrder: order });
    return order;
  },

  subscribe(orderId) {
    return services.order.subscribeToStatus(orderId, (status) => {
      const cur = get().activeOrder;
      if (cur && cur.id === orderId) {
        set({ activeOrder: { ...cur, status } });
      }
    });
  },

  setStatus(status) {
    const cur = get().activeOrder;
    if (cur) set({ activeOrder: { ...cur, status } });
  },

  setOrder(order) {
    set({ activeOrder: order });
  },

  async loadHistory(customer) {
    const pastOrders = await services.customer.getHistory(customer);
    set({ pastOrders });
  },

  async requestAssistance(type) {
    const cur = get().activeOrder;
    if (!cur) return;
    await services.order.requestAssistance(cur.id, type);
    set({
      activeOrder: {
        ...cur,
        specialRequests: [...(cur.specialRequests ?? []), type],
      },
    });
  },
}));
