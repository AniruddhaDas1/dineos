import type { CustomerService } from "../index";
import type { Order, Feedback } from "@/services/types";

// In-memory history store keyed by mobile number (mock persistence).
const historyByMobile = new Map<string, Order[]>();
const feedbackStore: Feedback[] = [];

export const mockCustomerService: CustomerService = {
  async getHistory(customer) {
    return historyByMobile.get(customer.mobile) ?? [];
  },
  async submitFeedback(feedback) {
    feedbackStore.push(feedback);
  },
};

// Used by mockOrderService to record placed orders into history.
export function recordOrder(order: Order) {
  const list = historyByMobile.get(order.customer.mobile) ?? [];
  list.push(order);
  historyByMobile.set(order.customer.mobile, list);
}
