import type { OrderService, PlaceOrderInput } from "../index";
import type { Order, OrderStatus } from "@/services/types";
import { recordOrder } from "./mockCustomerService";

const orders = new Map<string, Order>();

// Timings (ms) for simulated status progression.
const TRANSITIONS: { status: OrderStatus; after: number }[] = [
  { status: "preparing", after: 8000 },
  { status: "ready", after: 15000 },
  { status: "served", after: 10000 },
];

const ACTIVE_STATUSES: OrderStatus[] = [
  "received",
  "preparing",
  "ready",
  "served",
];

let counter = 0;
function genId() {
  counter += 1;
  return `order-${Date.now()}-${counter}`;
}

export const mockOrderService: OrderService & { __reset: () => void } = {
  async placeOrder(input: PlaceOrderInput) {
    const order: Order = {
      id: genId(),
      tableId: input.tableId,
      tableNumber: input.tableNumber,
      customer: input.customer,
      lines: input.lines,
      status: "received",
      placedAt: Date.now(),
      subtotal: input.subtotal,
      gst: input.gst,
      serviceCharge: input.serviceCharge,
      total: input.total,
      specialRequests: [],
    };
    orders.set(order.id, order);
    recordOrder(order);
    return order;
  },

  async getOrder(id) {
    return orders.get(id);
  },

  async getActiveOrder(tableId, customer) {
    for (const order of orders.values()) {
      if (
        order.tableId === tableId &&
        order.customer.mobile === customer.mobile &&
        ACTIVE_STATUSES.includes(order.status)
      ) {
        return order;
      }
    }
    return undefined;
  },

  subscribeToStatus(orderId, cb) {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;
    for (const t of TRANSITIONS) {
      elapsed += t.after;
      const handle = setTimeout(() => {
        const order = orders.get(orderId);
        if (!order) return;
        order.status = t.status;
        orders.set(orderId, order);
        cb(t.status);
      }, elapsed);
      timers.push(handle);
    }
    return () => timers.forEach(clearTimeout);
  },

  async requestBill(orderId) {
    const order = orders.get(orderId);
    if (order) {
      order.status = "billed";
      orders.set(orderId, order);
    }
  },

  async requestAssistance(orderId, type) {
    const order = orders.get(orderId);
    if (order) {
      order.specialRequests = [...(order.specialRequests ?? []), type];
      orders.set(orderId, order);
    }
  },

  __reset() {
    orders.clear();
    counter = 0;
  },
};
