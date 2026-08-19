import { describe, it, expect, beforeEach } from "vitest";
import { mockOrderService } from "./mockOrderService";

const customer = { name: "Ana", mobile: "9999900001" };
const baseInput = {
  tableId: "tbl-12",
  tableNumber: 12,
  customer,
  lines: [],
  subtotal: 100,
  gst: 5,
  serviceCharge: 10,
  total: 115,
};

describe("mockOrderService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockOrderService.__reset();
  });

  it("places an order in received status", async () => {
    const order = await mockOrderService.placeOrder(baseInput);
    expect(order.status).toBe("received");
    expect(order.total).toBe(115);
  });

  it("finds an active order for the same table + customer", async () => {
    const placed = await mockOrderService.placeOrder(baseInput);
    const active = await mockOrderService.getActiveOrder("tbl-12", customer);
    expect(active?.id).toBe(placed.id);
  });

  it("returns undefined active order when none exists", async () => {
    const active = await mockOrderService.getActiveOrder("tbl-12", customer);
    expect(active).toBeUndefined();
  });

  it("does not consider billed orders active", async () => {
    const placed = await mockOrderService.placeOrder(baseInput);
    placed.status = "billed";
    const active = await mockOrderService.getActiveOrder("tbl-12", customer);
    expect(active).toBeUndefined();
  });

  it("calls the status subscriber as status advances", async () => {
    const order = await mockOrderService.placeOrder(baseInput);
    const cb = vi.fn();
    mockOrderService.subscribeToStatus(order.id, cb);
    await vi.runAllTimersAsync();
    expect(cb).toHaveBeenCalled();
    const statuses = cb.mock.calls.map((c) => c[0]);
    expect(statuses).toContain("preparing");
  });

  it("adds items to an existing order and recomputes totals", async () => {
    const order = await mockOrderService.placeOrder({
      ...baseInput,
      lines: [{ id: "line-1", itemId: "mi-1", name: "Paneer Tikka", basePrice: 420, selectedAddOns: [], quantity: 1, unitPrice: 420 }],
    });

    const updated = await mockOrderService.addItemsToOrder(order.id, [
      { id: "line-2", itemId: "mi-5", name: "Garlic Naan", basePrice: 70, selectedAddOns: [], quantity: 2, unitPrice: 70 },
    ]);

    expect(updated).toBeDefined();
    expect(updated?.lines).toHaveLength(2);
    expect(updated?.subtotal).toBe(560);
  });

  it("merges matching lines when adding items", async () => {
    const order = await mockOrderService.placeOrder({
      ...baseInput,
      lines: [{ id: "line-1", itemId: "mi-1", name: "Paneer Tikka", basePrice: 420, selectedAddOns: [], quantity: 1, unitPrice: 420 }],
    });

    const updated = await mockOrderService.addItemsToOrder(order.id, [
      { id: "line-1", itemId: "mi-1", name: "Paneer Tikka", basePrice: 420, selectedAddOns: [], quantity: 1, unitPrice: 420 },
    ]);

    expect(updated?.lines).toHaveLength(1);
    expect(updated?.lines[0].quantity).toBe(2);
  });
});
