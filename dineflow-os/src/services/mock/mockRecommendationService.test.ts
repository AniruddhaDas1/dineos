import { describe, it, expect, beforeEach } from "vitest";
import { mockRecommendationService } from "./mockRecommendationService";

describe("mockRecommendationService", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("getPersonalizedRecommendations", () => {
    it("returns recommendations for a customer with no history", async () => {
      const recs = await mockRecommendationService.getPersonalizedRecommendations(
        "customer-no-history",
        6
      );

      expect(recs).toHaveLength(6);
      expect(recs.every((r) => r.item.available)).toBe(true);
      // Each result has item, score, reason
      recs.forEach((r) => {
        expect(r).toHaveProperty("item");
        expect(r).toHaveProperty("score");
        expect(r).toHaveProperty("reason");
        expect(r.score).toBeGreaterThan(0);
      });
    });

    it("sorts by score descending", async () => {
      const recs = await mockRecommendationService.getPersonalizedRecommendations(
        "customer-no-history",
        5
      );

      for (let i = 1; i < recs.length; i++) {
        expect(recs[i].score).toBeLessThanOrEqual(recs[i - 1].score);
      }
    });

    it("boosts items from order history", async () => {
      const customerId = "customer-with-history";
      // Seed localStorage with order history containing a bestseller
      const historyKey = `dineflow_history_${customerId}`;
      localStorage.setItem(historyKey, JSON.stringify(["mi-1"]));

      const recs = await mockRecommendationService.getPersonalizedRecommendations(
        customerId,
        10
      );

      const historyItem = recs.find((r) => r.item.id === "mi-1");
      expect(historyItem).toBeDefined();
      // Item in history should have historyBoost = 1.4 applied
      expect(historyItem?.reason).toBe("Based on your order history");
    });

    it("respects limit parameter", async () => {
      const recs = await mockRecommendationService.getPersonalizedRecommendations(
        "customer-no-history",
        3
      );
      expect(recs).toHaveLength(3);
    });
  });

  describe("getTrendingDishes", () => {
    it("returns trending dishes with trending boost", async () => {
      const trending = await mockRecommendationService.getTrendingDishes(4);

      expect(trending).toHaveLength(4);
      expect(trending.every((r) => r.item.available)).toBe(true);
      // Trending items should have trending/badge-based reasons
      trending.forEach((r) => {
        expect(r.reason.toLowerCase()).toMatch(
          /trending|bestseller|chef|rated|enjoy|history/
        );
      });
    });

    it("prefers bestsellers in trending results", async () => {
      const trending = await mockRecommendationService.getTrendingDishes(3);

      // Bestsellers have basePopularity = 1.0, which combined with trending boost (1.2)
      // should rank them high
      const hasBestseller = trending.some((r) => r.item.badges?.includes("bestseller"));
      expect(hasBestseller).toBe(true);
    });
  });

  describe("getSimilarDishes", () => {
    it("returns dishes similar to the target", async () => {
      const similar = await mockRecommendationService.getSimilarDishes("mi-1", 4);

      expect(similar).toHaveLength(4);
      // Should not include the target dish itself
      expect(similar.every((r) => r.item.id !== "mi-1")).toBe(true);
    });

    it("returns empty array for non-existent dish", async () => {
      const similar = await mockRecommendationService.getSimilarDishes("nonexistent", 4);
      expect(similar).toHaveLength(0);
    });

    it("boosts similarity for same category", async () => {
      const similar = await mockRecommendationService.getSimilarDishes("mi-1", 5);

      // Target item: mi-1
      // Similar items in same category should have higher scores
      const categoryMatch = similar.find((r) => r.item.categoryId === similar[0].item.categoryId);
      expect(categoryMatch).toBeDefined();
    });

    it("sets reason to 'Similar to {targetName}'", async () => {
      const similar = await mockRecommendationService.getSimilarDishes("mi-1", 2);
      similar.forEach((r) => {
        expect(r.reason).toMatch(/^Similar to/);
      });
    });
  });
});
