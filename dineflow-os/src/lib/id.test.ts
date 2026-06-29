import { describe, it, expect } from "vitest";
import { cartLineId } from "./id";

describe("cartLineId", () => {
  it("is identical for the same item + same sorted add-ons", () => {
    const a = cartLineId("item-1", ["x", "y"]);
    const b = cartLineId("item-1", ["y", "x"]);
    expect(a).toBe(b);
  });
  it("differs when add-ons differ", () => {
    expect(cartLineId("item-1", ["x"])).not.toBe(cartLineId("item-1", ["y"]));
  });
  it("differs when item differs", () => {
    expect(cartLineId("item-1", [])).not.toBe(cartLineId("item-2", []));
  });
});
