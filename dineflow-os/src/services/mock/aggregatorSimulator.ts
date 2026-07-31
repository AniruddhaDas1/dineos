import type { Order } from "@/services/types";
import { mockOrderService } from "./mockOrderService";
import { genId } from "./mockOrderService";

export function injectExternalOrder(order: Order) {
  // In a real app, this would be a webhook handler
  mockOrderService.placeOrder({
    tableId: order.tableId,
    tableNumber: order.tableNumber,
    customer: order.customer,
    lines: order.lines,
    subtotal: order.subtotal,
    gst: order.gst,
    serviceCharge: order.serviceCharge,
    deliveryFee: order.deliveryFee ?? 0,
    total: order.total,
    channel: order.channel,
    deliveryAddress: order.deliveryAddress,
    deliveryInstructions: order.deliveryInstructions,
    scheduledFor: order.scheduledFor,
  });
  // Note: placeOrder already calls recordOrder internally.
}

export async function simulateAggregatorOrder(source: "zomato" | "swiggy") {
  console.log(`[Aggregator] Simulating incoming order from ${source}...`);
  
  const order: Order = {
    id: genId(),
    tableId: "online",
    tableNumber: 0,
    customer: { name: `${source === 'zomato' ? 'Zomato' : 'Swiggy'} User`, mobile: "0000000000" },
    lines: [
      {
        id: "ext-1",
        itemId: "mi-3",
        name: "Butter Chicken",
        basePrice: 560,
        selectedAddOns: [],
        quantity: 1,
        unitPrice: 560,
      },
    ],
    status: "pending_acceptance",
    channel: "delivery",
    source: source,
    placedAt: Date.now(),
    subtotal: 560,
    gst: 28,
    serviceCharge: 0,
    deliveryFee: 40,
    total: 628,
    deliveryAddress: {
      line1: "123 Aggregator St",
      city: "Hyderabad",
      pincode: "500033",
    },
  };

  await injectExternalOrder(order);
  return order;
}
