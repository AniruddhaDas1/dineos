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

  it("includes item ID in the generated ID", () => {
    const id = cartLineId("mi-1", []);
    expect(id).toContain("mi-1");
  });

  it("distinguishes same item with different instructions", () => {
    const a = cartLineId("item-1", [], "no onions");
    const b = cartLineId("item-1", [], "extra spicy");
    expect(a).not.toBe(b);
  });

  it("treats different instruction casing as same line", () => {
    const a = cartLineId("item-1", [], "No Onions");
    const b = cartLineId("item-1", [], "no onions");
    expect(a).toBe(b);
  });

  it("handles empty add-ons", () => {
    const id = cartLineId("item-1", []);
    expect(id).toBeTruthy();
    expect(id).toBe("item-1||");
  });

  it("normalizes instructions to lowercase", () => {
    const id = cartLineId("item-1", [], "EXTRA SPICY");
    expect(id).toContain("extra spicy");
  });
});
