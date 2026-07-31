import { describe, it, expect } from "vitest";
import { mockNLUService } from "./mockNLUService";
import { menuItems } from "@/data/menu";

describe("mockNLUService", () => {
  describe("parseIntent", () => {
    it("classifies 'order' intent", async () => {
      const result = await mockNLUService.parseIntent("I want to order Butter Chicken");

      expect(result.intent).toBe("order");
      expect(result.confidence).toBeGreaterThan(0.3);
      expect(result.raw).toBe("I want to order Butter Chicken");
    });

    it("classifies 'modify' intent", async () => {
      const result = await mockNLUService.parseIntent("Make it extra spicy");

      expect(result.intent).toBe("modify");
    });

    it("classifies 'cancel' intent", async () => {
      const result = await mockNLUService.parseIntent("Remove the Naan");

      expect(result.intent).toBe("cancel");
    });

    it("classifies 'query' intent", async () => {
      const result = await mockNLUService.parseIntent("What's vegetarian?");

      expect(result.intent).toBe("query");
    });

    it("classifies 'reorder' intent", async () => {
      const result = await mockNLUService.parseIntent("Can I get my usual again?");

      expect(result.intent).toBe("reorder");
    });

    it("classifies unknown input as 'unknown'", async () => {
      const result = await mockNLUService.parseIntent("qzxkjvwf");

      expect(result.intent).toBe("unknown");
      expect(result.confidence).toBeLessThanOrEqual(0.3);
    });

    it("higher keyword match = higher confidence", async () => {
      const singleMatch = await mockNLUService.parseIntent("order");
      const multiMatch = await mockNLUService.parseIntent("I want to order");

      expect(multiMatch.confidence).toBeGreaterThanOrEqual(singleMatch.confidence);
    });
  });

  describe("extractEntities", () => {
    it("extracts dish entity from input", async () => {
      const entities = await mockNLUService.extractEntities(
        "Add 2 Butter Chicken",
        menuItems
      );

      const dish = entities.find((e) => e.type === "dish");
      expect(dish).toBeDefined();
      expect(dish?.value).toContain("Butter Chicken");
    });

    it("extracts quantity entity", async () => {
      const entities = await mockNLUService.extractEntities(
        "Add 2 Butter Chicken",
        menuItems
      );

      const qty = entities.find((e) => e.type === "quantity");
      expect(qty).toBeDefined();
      expect(qty?.value).toBe("2");
    });

    it("extracts word quantities", async () => {
      const entities = await mockNLUService.extractEntities(
        "Give me two Paneer Tikka",
        menuItems
      );

      const qty = entities.find((e) => e.type === "quantity");
      expect(qty?.value).toBe("2");
    });

    it("extracts modifiers", async () => {
      const entities = await mockNLUService.extractEntities(
        "Make it extra spicy",
        menuItems
      );

      const mods = entities.filter((e) => e.type === "modifier");
      expect(mods.length).toBeGreaterThan(0);
      expect(mods.some((m) => m.value === "extra spicy")).toBe(true);
    });

    it("defaults to quantity 1 when no quantity specified", async () => {
      const entities = await mockNLUService.extractEntities(
        "Add Butter Chicken",
        menuItems
      );

      const qty = entities.find((e) => e.type === "quantity");
      expect(qty?.value).toBe("1");
    });

    it("returns empty entities for gibberish with no dish match", async () => {
      const entities = await mockNLUService.extractEntities(
        "xyzrandomnonenglish",
        menuItems
      );

      // No dish will be found, but quantity defaults to 1
      const dish = entities.find((e) => e.type === "dish");
      expect(dish).toBeUndefined();
    });
  });

  describe("generateResponse", () => {
    it("generates order confirmation with dish and quantity", async () => {
      const response = await mockNLUService.generateResponse("order", [
        { type: "dish", value: "Butter Chicken", itemId: "mi-3" },
        { type: "quantity", value: "2" },
      ]);

      expect(response).toContain("2x Butter Chicken");
      expect(response).toContain("cart");
    });

    it("generates order confirmation without modifiers", async () => {
      const response = await mockNLUService.generateResponse("order", [
        { type: "dish", value: "Paneer Tikka", itemId: "mi-1" },
        { type: "quantity", value: "1" },
      ]);

      expect(response).toContain("1x Paneer Tikka");
      expect(response).not.toContain("with");
    });

    it("generates modify response with modifiers", async () => {
      const response = await mockNLUService.generateResponse("modify", [
        { type: "dish", value: "Butter Chicken" },
        { type: "modifier", value: "extra spicy" },
      ]);

      expect(response).toContain("extra spicy");
    });

    it("generates cancel response with dish", async () => {
      const response = await mockNLUService.generateResponse("cancel", [
        { type: "dish", value: "Naan", itemId: "mi-10" },
      ]);

      expect(response).toContain("Naan");
    });

    it("generates query response without dish", async () => {
      const response = await mockNLUService.generateResponse("query", [
        { type: "quantity", value: "1" },
      ]);

      expect(response).toContain("menu categories");
    });

    it("generates reorder response", async () => {
      const response = await mockNLUService.generateResponse("reorder", []);

      expect(response).toContain("previous orders");
    });

    it("generates fallback for unknown intent", async () => {
      const response = await mockNLUService.generateResponse("unknown", []);

      expect(response).toContain("order");
    });
  });
});
