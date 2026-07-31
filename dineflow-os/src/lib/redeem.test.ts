import { describe, it, expect } from "vitest";
import { computeRedemption } from "./redeem";

describe("computeRedemption", () => {
  it("returns zero when no points", () => {
    const result = computeRedemption({ pointsBalance: 0, subtotal: 500 });
    expect(result).toEqual({ pointsUsed: 0, discount: 0 });
  });

  it("returns zero when no subtotal", () => {
    const result = computeRedemption({ pointsBalance: 100, subtotal: 0 });
    expect(result).toEqual({ pointsUsed: 0, discount: 0 });
  });

  it("converts 10 points to ₹10", () => {
    const result = computeRedemption({ pointsBalance: 10, subtotal: 1000 });
    expect(result).toEqual({ pointsUsed: 10, discount: 10 });
  });

  it("caps at 50% of subtotal", () => {
    // subtotal=400, max redemption = 200 points = ₹200
    const result = computeRedemption({ pointsBalance: 500, subtotal: 400 });
    expect(result).toEqual({ pointsUsed: 200, discount: 200 });
  });

  it("uses fewer points when balance is insufficient", () => {
    // subtotal=1000, max=500 points, but only have 50
    const result = computeRedemption({ pointsBalance: 50, subtotal: 1000 });
    expect(result).toEqual({ pointsUsed: 50, discount: 50 });
  });
});
