import type {
  RecommendationService,
  RecommendationResult,
  MenuItem,
} from "../types";
import { menuItems } from "@/data/menu";

function getTimeWeight(): number {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return 0.3; // breakfast
  if (hour >= 11 && hour < 15) return 1.0; // lunch peak
  if (hour >= 15 && hour < 18) return 0.5; // evening
  if (hour >= 18 && hour < 23) return 1.0; // dinner peak
  return 0.2; // late night
}

function getSeasonWeight(item: MenuItem): number {
  const month = new Date().getMonth();
  const isWinter = month >= 10 || month <= 2;
  const isSummer = month >= 3 && month <= 6;

  // Heavier dishes more popular in winter
  if (item.calories && item.calories > 500) return isWinter ? 1.3 : 0.8;
  // Lighter dishes more popular in summer
  if (item.calories && item.calories < 300) return isSummer ? 1.2 : 0.9;
  return 1.0;
}

function calculateScore(
  item: MenuItem,
  orderHistory: string[],
  isTrending: boolean
): number {
  const timeWeight = getTimeWeight();
  const seasonWeight = getSeasonWeight(item);

  // Base popularity from badges
  let basePopularity = 0.5;
  if (item.badges?.includes("bestseller")) basePopularity = 1.0;
  if (item.badges?.includes("chef-recommendation")) basePopularity = 0.9;
  if (item.badges?.includes("popular")) basePopularity = 0.8;

  // History boost - items ordered before get higher score
  const historyBoost = orderHistory.includes(item.id) ? 1.4 : 1.0;

  // Trending boost
  const trendingBoost = isTrending ? 1.2 : 1.0;

  // Rating boost
  const ratingBoost = item.rating ? item.rating / 5 : 1.0;

  return (
    basePopularity *
    timeWeight *
    seasonWeight *
    historyBoost *
    trendingBoost *
    ratingBoost
  );
}

function getReason(
  item: MenuItem,
  orderHistory: string[],
  isTrending: boolean
): string {
  if (orderHistory.includes(item.id)) return "Based on your order history";
  if (item.badges?.includes("bestseller")) return "Our bestseller";
  if (item.badges?.includes("chef-recommendation")) return "Chef's pick";
  if (isTrending) return "Trending now";
  if (item.rating && item.rating >= 4.5) return "Highly rated";
  return "You might enjoy this";
}

export const mockRecommendationService: RecommendationService = {
  async getPersonalizedRecommendations(
    customerId: string,
    limit: number
  ): Promise<RecommendationResult[]> {
    // Simulate order history from localStorage
    const historyKey = `dineflow_history_${customerId}`;
    const orderHistory: string[] = JSON.parse(
      localStorage.getItem(historyKey) || "[]"
    );

    const available = menuItems.filter((item) => item.available);
    const scored = available.map((item) => ({
      item,
      score: calculateScore(item, orderHistory, false),
      reason: getReason(item, orderHistory, false),
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  },

  async getTrendingDishes(limit: number): Promise<RecommendationResult[]> {
    const available = menuItems.filter((item) => item.available);
    const scored = available.map((item) => ({
      item,
      score: calculateScore(item, [], true),
      reason: getReason(item, [], true),
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  },

  async getSimilarDishes(
    dishId: string,
    limit: number
  ): Promise<RecommendationResult[]> {
    const target = menuItems.find((item) => item.id === dishId);
    if (!target) return [];

    const available = menuItems.filter(
      (item) => item.available && item.id !== dishId
    );

    const scored = available.map((item) => {
      let similarity = 0.5;

      // Same category = high similarity
      if (item.categoryId === target.categoryId) similarity += 0.3;

      // Similar spice level
      if (item.spiceLevel !== undefined && target.spiceLevel !== undefined) {
        const spiceDiff = Math.abs(item.spiceLevel - target.spiceLevel);
        similarity += 0.1 * (1 - spiceDiff / 3);
      }

      // Similar price range
      const priceDiff = Math.abs(item.price - target.price) / target.price;
      if (priceDiff < 0.3) similarity += 0.1;

      return {
        item,
        score: similarity,
        reason: `Similar to ${target.name}`,
      };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  },
};
