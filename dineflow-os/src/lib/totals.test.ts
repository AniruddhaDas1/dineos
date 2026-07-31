import { describe, it, expect } from "vitest";
import { computeTotals } from "./totals";

describe("computeTotals", () => {
  const base = { gstPercent: 5, serviceChargePercent: 10 };

  it("computes totals without discount or delivery", () => {
    const result = computeTotals({ subtotal: 1000, ...base });
    expect(result.discount).toBe(0);
    expect(result.afterDiscount).toBe(1000);
    expect(result.gst).toBe(50);
    expect(result.serviceCharge).toBe(100);
    expect(result.deliveryFee).toBe(0);
    expect(result.total).toBe(1150);
  });

  it("applies discount correctly", () => {
    const result = computeTotals({ subtotal: 1000, discount: 100, ...base });
    expect(result.discount).toBe(100);
    expect(result.afterDiscount).toBe(900);
    expect(result.gst).toBe(45);
    expect(result.serviceCharge).toBe(90);
    expect(result.total).toBe(1035);
  });

  it("adds delivery fee", () => {
    const result = computeTotals({ subtotal: 500, deliveryFee: 40, ...base });
    expect(result.deliveryFee).toBe(40);
    expect(result.total).toBe(615);
  });

  it("clamps discount to zero if exceeds subtotal", () => {
    const result = computeTotals({ subtotal: 100, discount: 200, ...base });
    expect(result.afterDiscount).toBe(0);
    expect(result.total).toBe(0);
  });

  it("handles zero subtotal", () => {
    const result = computeTotals({ subtotal: 0, ...base });
    expect(result.total).toBe(0);
  });
});
