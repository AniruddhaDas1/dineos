import { describe, it, expect } from "vitest";
import { formatCurrency } from "./format";

describe("formatCurrency", () => {
  it("formats a whole rupee amount with the rupee symbol", () => {
    expect(formatCurrency(240)).toBe("₹240");
  });
  it("formats decimal amounts to two digits", () => {
    expect(formatCurrency(240.5)).toBe("₹240.50");
  });
  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("₹0");
  });
});
