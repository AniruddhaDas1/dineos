import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockPricingService } from "./mockPricingService";

describe("mockPricingService", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("getPersonalizedOffers", () => {
    it("always includes a random promotional offer", async () => {
      const offers = await mockPricingService.getPersonalizedOffers("customer-1");

      const hasSpice10 = offers.some((o) => o.code === "SPICE10");
      expect(hasSpice10).toBe(true);
    });

    it("includes welcome offer for new customers (visitCount <= 1)", async () => {
      // visitCount defaults to 0 when localStorage has no entry
      const offers = await mockPricingService.getPersonalizedOffers("new-customer");

      const welcome = offers.find((o) => o.code === "WELCOME20");
      expect(welcome).toBeDefined();
      expect(welcome?.discountValue).toBe(20);
      expect(welcome?.minOrder).toBe(200);
    });

    it("does not include welcome offer for returning customers (visitCount > 1)", async () => {
      localStorage.setItem("dineflow_visits_returning", "5");

      const offers = await mockPricingService.getPersonalizedOffers("returning");

      const welcome = offers.find((o) => o.code === "WELCOME20");
      expect(welcome).toBeUndefined();
    });

    it("includes loyalty offer for frequent customers (visitCount >= 5)", async () => {
      localStorage.setItem("dineflow_visits_frequent", "5");

      const offers = await mockPricingService.getPersonalizedOffers("frequent");

      const loyalty = offers.find((o) => o.code === "LOYAL50");
      expect(loyalty).toBeDefined();
      expect(loyalty?.discountValue).toBe(50);
    });

    it("includes happy hour offer during afternoon hours", async () => {
      // 3:00 PM local time → happy hour (14-17)
      vi.useFakeTimers().setSystemTime(new Date(2026, 6, 31, 15, 0, 0));

      const offers = await mockPricingService.getPersonalizedOffers("customer");

      const hasHappyHour = offers.some((o) => o.code === "HAPPYHOUR");
      expect(hasHappyHour).toBe(true);

      vi.useRealTimers();
    });

    it("each offer has required fields", async () => {
      const offers = await mockPricingService.getPersonalizedOffers("customer-1");

      offers.forEach((o) => {
        expect(o).toHaveProperty("id");
        expect(o).toHaveProperty("code");
        expect(o).toHaveProperty("title");
        expect(o).toHaveProperty("description");
        expect(o).toHaveProperty("discountType");
        expect(o).toHaveProperty("discountValue");
        expect(o).toHaveProperty("minOrder");
        expect(o).toHaveProperty("validUntil");
        expect(o.validUntil).toBeGreaterThan(Date.now());
      });
    });
  });

  describe("getDynamicPricing", () => {
    it("returns dynamic price based on demand level", async () => {
      const result = await mockPricingService.getDynamicPricing("mi-1", "2026-07-31T12:00:00Z");

      expect(result).toHaveProperty("itemId", "mi-1");
      expect(result).toHaveProperty("basePrice");
      expect(result).toHaveProperty("dynamicPrice");
      expect(result).toHaveProperty("demandLevel");
      expect(["low", "medium", "high"]).toContain(result.demandLevel);
    });

    it("returns zero price for unknown item", async () => {
      const result = await mockPricingService.getDynamicPricing("unknown", "2026-07-31T12:00:00Z");

      expect(result.basePrice).toBe(0);
      expect(result.dynamicPrice).toBe(0);
      expect(result.demandLevel).toBe("low");
    });

    it("high demand applies premium multiplier (1.05x)", async () => {
      // 1:00 PM local time → lunch rush (high demand)
      vi.useFakeTimers().setSystemTime(new Date(2026, 6, 31, 13, 0, 0));

      const result = await mockPricingService.getDynamicPricing("mi-1", "2026-07-31T13:00:00Z");

      expect(result.demandLevel).toBe("high");
      expect(result.dynamicPrice).toBe(Math.round(result.basePrice * 1.05));

      vi.useRealTimers();
    });

    it("low demand applies discount multiplier (0.95x)", async () => {
      // 03:00 = late night → low demand
      vi.useFakeTimers().setSystemTime(new Date("2026-07-31T03:00:00Z"));

      const result = await mockPricingService.getDynamicPricing("mi-1", "2026-07-31T03:00:00Z");

      expect(result.demandLevel).toBe("low");
      expect(result.dynamicPrice).toBe(Math.round(result.basePrice * 0.95));

      vi.useRealTimers();
    });
  });

  describe("getLoyaltyRewards", () => {
    it("returns 5 available rewards", async () => {
      const rewards = await mockPricingService.getLoyaltyRewards("customer-1");

      expect(rewards).toHaveLength(5);
      rewards.forEach((r) => {
        expect(r).toHaveProperty("id");
        expect(r).toHaveProperty("title");
        expect(r).toHaveProperty("description");
        expect(r).toHaveProperty("pointsRequired");
        expect(r).toHaveProperty("discountValue");
        expect(r.pointsRequired).toBeGreaterThan(0);
      });
    });

    it("rewards are sorted by points required ascending", async () => {
      const rewards = await mockPricingService.getLoyaltyRewards("customer-1");

      for (let i = 1; i < rewards.length; i++) {
        expect(rewards[i].pointsRequired).toBeGreaterThanOrEqual(
          rewards[i - 1].pointsRequired
        );
      }
    });

    it("includes high-value chef's table reward", async () => {
      const rewards = await mockPricingService.getLoyaltyRewards("customer-1");

      const chefTable = rewards.find((r) => r.title === "Chef's Table Experience");
      expect(chefTable).toBeDefined();
      expect(chefTable?.pointsRequired).toBe(1000);
    });
  });
});
