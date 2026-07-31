import type { OrderService, PlaceOrderInput } from "../index";
import type { Order, OrderStatus } from "@/services/types";
import { recordOrder } from "./mockCustomerService";
import { processRecipeDeduction } from "./mockInventoryService";

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
export function genId() {
  counter += 1;
  return `order-${Date.now()}-${counter}`;
}

function seedOrders() {
  if (orders.size > 0) return;

  const now = Date.now();
  const seed: Order[] = [
    {
      id: "seed-1",
      tableId: "tbl-1",
      tableNumber: 1,
      customer: { name: "Arjun Mehta", mobile: "9876543210" },
      lines: [
        {
          id: "cl-1",
          itemId: "mi-3",
          name: "Butter Chicken",
          basePrice: 560,
          selectedAddOns: [{ id: "naan", name: "Butter Naan", price: 60 }],
          quantity: 2,
          unitPrice: 620,
        },
        {
          id: "cl-2",
          itemId: "mi-5",
          name: "Garlic Naan",
          basePrice: 70,
          selectedAddOns: [],
          quantity: 2,
          unitPrice: 70,
        },
      ],
      status: "preparing",
      placedAt: now - 5 * 60_000,
      subtotal: 1380,
      gst: 69,
      serviceCharge: 138,
      total: 1587,
      specialRequests: ["water"],
    },
    {
      id: "seed-2",
      tableId: "tbl-2",
      tableNumber: 2,
      customer: { name: "Priya Sharma", mobile: "9123456789" },
      lines: [
        {
          id: "cl-3",
          itemId: "mi-1",
          name: "Paneer Tikka",
          basePrice: 420,
          selectedAddOns: [],
          quantity: 1,
          unitPrice: 420,
        },
        {
          id: "cl-4",
          itemId: "mi-4",
          name: "Dal Makhani",
          basePrice: 380,
          selectedAddOns: [],
          quantity: 1,
          unitPrice: 380,
        },
      ],
      status: "ready",
      placedAt: now - 12 * 60_000,
      subtotal: 800,
      gst: 40,
      serviceCharge: 80,
      total: 920,
    },
    {
      id: "seed-3",
      tableId: "tbl-3",
      tableNumber: 3,
      customer: { name: "Rohan Kapoor", mobile: "9988776655" },
      lines: [
        {
          id: "cl-5",
          itemId: "mi-6",
          name: "Hyderabadi Veg Biryani",
          basePrice: 440,
          selectedAddOns: [{ id: "raita", name: "Extra Raita", price: 40 }],
          quantity: 1,
          unitPrice: 480,
        },
        {
          id: "cl-6",
          itemId: "mi-7",
          name: "Gulab Jamun (2 pc)",
          basePrice: 220,
          selectedAddOns: [],
          quantity: 2,
          unitPrice: 220,
        },
      ],
      status: "served",
      placedAt: now - 25 * 60_000,
      subtotal: 920,
      gst: 46,
      serviceCharge: 92,
      total: 1058,
    },
    {
      id: "seed-4",
      tableId: "tbl-4",
      tableNumber: 4,
      customer: { name: "Anita Desai", mobile: "9876501234" },
      lines: [
        {
          id: "cl-7",
          itemId: "mi-2",
          name: "Tandoori Chicken",
          basePrice: 520,
          selectedAddOns: [],
          quantity: 1,
          unitPrice: 520,
        },
      ],
      status: "billed",
      placedAt: now - 90 * 60_000,
      subtotal: 520,
      gst: 26,
      serviceCharge: 52,
      total: 598,
    },
  ];

  for (const order of seed) {
    orders.set(order.id, order);
    recordOrder(order);
  }
}

// Auto-seed on first import
seedOrders();

export const mockOrderService: OrderService & { __reset: () => void } = {
  async placeOrder(input: PlaceOrderInput) {
    const order: Order = {
      id: genId(),
      tableId: input.tableId,
      tableNumber: input.tableNumber,
      customer: input.customer,
      lines: input.lines,
      status: input.initialStatus ?? "received",
      channel: input.channel ?? "dine-in",
      placedAt: Date.now(),
      subtotal: input.subtotal,
      gst: input.gst,
      serviceCharge: input.serviceCharge,
      deliveryFee: input.deliveryFee,
      total: input.total,
      deliveryAddress: input.deliveryAddress,
      deliveryInstructions: input.deliveryInstructions,
      scheduledFor: input.scheduledFor,
      specialRequests: [],
    };
    
    // Deduct inventory stock based on order lines
    processRecipeDeduction(order.lines);
    
    orders.set(order.id, order);
    recordOrder(order);
    return order;
  },

  async getOrder(id) {
    return orders.get(id);
  },

  async getAllOrders() {
    return [...orders.values()].sort((a, b) => b.placedAt - a.placedAt);
  },

  async getActiveOrders() {
    return [...orders.values()]
      .filter((o) => ACTIVE_STATUSES.includes(o.status))
      .sort((a, b) => b.placedAt - a.placedAt);
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

  async updateOrderStatus(orderId, status) {
    const order = orders.get(orderId);
    if (order) {
      orders.set(orderId, { ...order, status });
    }
  },

  async cancelOrder(orderId) {
    const order = orders.get(orderId);
    if (order) {
      orders.set(orderId, { ...order, status: "billed" });
    }
  },

  subscribeToStatus(orderId, cb) {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;
    for (const t of TRANSITIONS) {
      elapsed += t.after;
      const handle = setTimeout(() => {
        const order = orders.get(orderId);
        if (!order) return;
        const updated = { ...order, status: t.status };
        orders.set(orderId, updated);
        cb(t.status);
      }, elapsed);
      timers.push(handle);
    }
    return () => timers.forEach(clearTimeout);
  },

  async requestBill(orderId) {
    const order = orders.get(orderId);
    if (order) {
      orders.set(orderId, { ...order, status: "billed" });
    }
  },

  async requestAssistance(orderId, type) {
    const order = orders.get(orderId);
    if (order) {
      orders.set(orderId, {
        ...order,
        specialRequests: [...(order.specialRequests ?? []), type],
      });
    }
  },

  __reset() {
    orders.clear();
    counter = 0;
  },
};
