import type { CustomerService } from "../index";
import type {
  CartLine,
  Customer,
  CustomerProfile,
  Feedback,
  LoyaltyTier,
  Order,
} from "@/services/types";

// In-memory history store keyed by mobile number (mock persistence).
const historyByMobile = new Map<string, Order[]>();
const feedbackStore: Feedback[] = [];
// Track mobile → customer name for profile lookups.
const customerNames = new Map<string, string>();

function tierFromPoints(points: number): LoyaltyTier {
  if (points >= 1000) return "platinum";
  if (points >= 500) return "gold";
  if (points >= 100) return "silver";
  return "bronze";
}

function nextTierThreshold(tier: LoyaltyTier): number {
  switch (tier) {
    case "bronze":
      return 100;
    case "silver":
      return 500;
    case "gold":
      return 1000;
    default:
      return 1000;
  }
}

function prevTierThreshold(tier: LoyaltyTier): number {
  switch (tier) {
    case "platinum":
      return 1000;
    case "gold":
      return 500;
    case "silver":
      return 100;
    default:
      return 0;
  }
}

function computeProfile(
  mobile: string,
  orders: Order[],
  feedbacks: Feedback[]
): CustomerProfile {
  const totalSpend = orders.reduce((s, o) => s + o.total, 0);
  const points = Math.floor(totalSpend / 100);
  const tier = tierFromPoints(points);
  const lastVisit = orders.length
    ? Math.max(...orders.map((o) => o.placedAt))
    : 0;

  // Favorite items — count by name across all orders
  const itemCounts = new Map<string, number>();
  for (const order of orders) {
    for (const line of order.lines) {
      itemCounts.set(
        line.name,
        (itemCounts.get(line.name) ?? 0) + line.quantity
      );
    }
  }
  const favoriteItems = [...itemCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  // Avg rating from this customer's feedback
  const orderIds = new Set(orders.map((o) => o.id));
  const myFeedback = feedbacks.filter((f) => orderIds.has(f.orderId));
  const avgRating =
    myFeedback.length > 0
      ? myFeedback.reduce((s, f) => s + f.rating, 0) / myFeedback.length
      : 0;

  return {
    name: customerNames.get(mobile) ?? orders[0]?.customer.name ?? "Guest",
    mobile,
    visits: orders.length,
    totalSpend,
    points,
    tier,
    lastVisit,
    favoriteItems,
    avgRating,
  };
}

// --- Seed extra customer profiles for CRM demo ---
function buildSeedOrder(
  id: string,
  tableNumber: number,
  mobile: string,
  name: string,
  lines: CartLine[],
  minutesAgo: number
): Order {
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const gst = +(subtotal * 0.05).toFixed(2);
  const serviceCharge = +(subtotal * 0.1).toFixed(2);
  const total = +(subtotal + gst + serviceCharge).toFixed(2);
  return {
    id,
    tableId: `tbl-${tableNumber}`,
    tableNumber,
    customer: { name, mobile },
    lines,
    status: "billed",
    placedAt: Date.now() - minutesAgo * 60_000,
    subtotal,
    gst,
    serviceCharge,
    total,
  };
}

const seedExtraOrders: { customer: Customer; orders: Order[] }[] = [
  {
    customer: { name: "Meera Nair", mobile: "9000011111" },
    orders: [
      buildSeedOrder("seed-crm-1", 5, "9000011111", "Meera Nair", [
        { id: "cl-x1", itemId: "mi-3", name: "Butter Chicken", basePrice: 560, selectedAddOns: [], quantity: 1, unitPrice: 560 },
        { id: "cl-x2", itemId: "mi-7", name: "Gulab Jamun (2 pc)", basePrice: 220, selectedAddOns: [], quantity: 2, unitPrice: 220 },
      ], 30 * 24 * 60),
      buildSeedOrder("seed-crm-2", 5, "9000011111", "Meera Nair", [
        { id: "cl-x3", itemId: "mi-1", name: "Paneer Tikka", basePrice: 420, selectedAddOns: [], quantity: 1, unitPrice: 420 },
      ], 15 * 24 * 60),
      buildSeedOrder("seed-crm-3", 8, "9000011111", "Meera Nair", [
        { id: "cl-x4", itemId: "mi-6", name: "Hyderabadi Veg Biryani", basePrice: 440, selectedAddOns: [], quantity: 2, unitPrice: 440 },
        { id: "cl-x5", itemId: "mi-8", name: "Masala Chai", basePrice: 120, selectedAddOns: [], quantity: 2, unitPrice: 120 },
      ], 3 * 24 * 60),
    ],
  },
  {
    customer: { name: "Karthik Reddy", mobile: "9000022222" },
    orders: [
      buildSeedOrder("seed-crm-4", 12, "9000022222", "Karthik Reddy", [
        { id: "cl-x6", itemId: "mi-2", name: "Tandoori Chicken", basePrice: 520, selectedAddOns: [], quantity: 1, unitPrice: 520 },
        { id: "cl-x7", itemId: "mi-3", name: "Butter Chicken", basePrice: 560, selectedAddOns: [], quantity: 1, unitPrice: 560 },
        { id: "cl-x8", itemId: "mi-5", name: "Garlic Naan", basePrice: 70, selectedAddOns: [], quantity: 4, unitPrice: 70 },
      ], 60 * 24 * 60),
    ],
  },
];

let seeded = false;
function ensureSeedExtras() {
  if (seeded) return;
  seeded = true;
  for (const entry of seedExtraOrders) {
    const existing = historyByMobile.get(entry.customer.mobile);
    if (existing && existing.length > 0) continue;
    historyByMobile.set(entry.customer.mobile, entry.orders);
    customerNames.set(entry.customer.mobile, entry.customer.name);
  }
  // Seed demo feedback
  if (feedbackStore.length === 0) {
    feedbackStore.push(
      {
        orderId: "seed-crm-3",
        rating: 5,
        review: "Absolutely loved the biryani and chai! Will come back soon.",
        createdAt: Date.now() - 3 * 24 * 60 * 60_000,
      },
      {
        orderId: "seed-crm-1",
        rating: 4,
        review: "Great food, service was a bit slow on a busy night.",
        createdAt: Date.now() - 30 * 24 * 60 * 60_000,
      },
      {
        orderId: "seed-crm-4",
        rating: 2,
        review: "Chicken was dry. Expected better for the price.",
        createdAt: Date.now() - 60 * 24 * 60 * 60_000,
      }
    );
  }
}

// Auto-seed on first import
ensureSeedExtras();

export const mockCustomerService: CustomerService & {
  __reset: () => void;
} = {
  async getHistory(customer: Customer) {
    return historyByMobile.get(customer.mobile) ?? [];
  },

  async submitFeedback(feedback: Feedback) {
    feedbackStore.push(feedback);
  },

  async getFeedbacks() {
    return feedbackStore
      .map((f) => ({
        ...f,
        customerName: customerNames.get(
          // Reverse-lookup: find mobile by matching order in history
          [...historyByMobile.entries()].find(([_, orders]) =>
            orders.some((o) => o.id === f.orderId)
          )?.[0] ?? ""
        ),
      }))
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  async getCustomerProfile(mobile: string) {
    ensureSeedExtras();
    const orders = historyByMobile.get(mobile);
    if (!orders || orders.length === 0) return undefined;
    return computeProfile(mobile, orders, feedbackStore);
  },

  async getAllProfiles() {
    ensureSeedExtras();
    const profiles: CustomerProfile[] = [];
    for (const mobile of historyByMobile.keys()) {
      const orders = historyByMobile.get(mobile)!;
      profiles.push(computeProfile(mobile, orders, feedbackStore));
    }
    return profiles.sort((a, b) => b.totalSpend - a.totalSpend);
  },

  __reset() {
    historyByMobile.clear();
    feedbackStore.length = 0;
    customerNames.clear();
    seeded = false;
  },
};

// Used by mockOrderService to record placed orders into history.
export function recordOrder(order: Order) {
  const list = historyByMobile.get(order.customer.mobile) ?? [];
  list.push(order);
  historyByMobile.set(order.customer.mobile, list);
  customerNames.set(order.customer.mobile, order.customer.name);
}

// Exported for LoyaltyCard progress bar computation.
export { tierFromPoints, nextTierThreshold, prevTierThreshold };
