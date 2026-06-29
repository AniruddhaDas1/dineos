import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "./cart.store";
import type { AddOn, MenuItem } from "@/services/types";
import { cartLineId } from "@/lib/id";

const item: MenuItem = {
  id: "mi-1",
  categoryId: "c",
  name: "Paneer",
  description: "",
  price: 200,
  image: "",
  vegType: "veg",
  available: true,
};
const extra: AddOn = { id: "x", name: "X", price: 30 };

describe("cart store", () => {
  beforeEach(() => useCartStore.getState().clear());

  it("adds a line with computed unit price and id", () => {
    useCartStore.getState().addFromItem(item, 1, [extra], "");
    const { lines } = useCartStore.getState();
    expect(lines).toHaveLength(1);
    expect(lines[0].unitPrice).toBe(230);
    expect(lines[0].id).toBe(cartLineId("mi-1", ["x"]));
  });

  it("merges quantity for identical customization", () => {
    useCartStore.getState().addFromItem(item, 1, [extra], "");
    useCartStore.getState().addFromItem(item, 2, [extra], "");
    const { lines, count } = useCartStore.getState();
    expect(lines).toHaveLength(1);
    expect(lines[0].quantity).toBe(3);
    expect(count).toBe(3);
  });

  it("keeps separate lines for different customization", () => {
    useCartStore.getState().addFromItem(item, 1, [extra], "");
    useCartStore.getState().addFromItem(item, 1, [], "");
    expect(useCartStore.getState().lines).toHaveLength(2);
  });

  it("computes subtotal correctly", () => {
    useCartStore.getState().addFromItem(item, 2, [extra], ""); // 230*2
    expect(useCartStore.getState().subtotal).toBe(460);
  });

  it("removes a line", () => {
    useCartStore.getState().addFromItem(item, 1, [extra], "");
    const id = useCartStore.getState().lines[0].id;
    useCartStore.getState().removeLine(id);
    expect(useCartStore.getState().lines).toHaveLength(0);
  });
});
