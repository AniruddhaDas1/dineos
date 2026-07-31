import type {
  PricingService,
  Offer,
  PricingResult,
  Reward,
} from "../types";
import { menuItems } from "@/data/menu";

function getDemandLevel(): "low" | "medium" | "high" {
  const hour = new Date().getHours();
  if (hour >= 12 && hour <= 14) return "high"; // lunch rush
  if (hour >= 19 && hour <= 21) return "high"; // dinner rush
  if ((hour >= 11 && hour <= 15) || (hour >= 18 && hour <= 22)) return "medium";
  return "low";
}

function getDynamicMultiplier(demand: "low" | "medium" | "high"): number {
  switch (demand) {
    case "low":
      return 0.95; // 5% discount during off-peak
    case "medium":
      return 1.0;
    case "high":
      return 1.05; // 5% premium during peak
  }
}

function generateOfferId(): string {
  return `offer_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const mockPricingService: PricingService = {
  async getPersonalizedOffers(customerId: string): Promise<Offer[]> {
    const offers: Offer[] = [];
    const now = Date.now();

    // Welcome offer for new customers
    const visitCount = parseInt(
      localStorage.getItem(`dineflow_visits_${customerId}`) || "0"
    );

    if (visitCount <= 1) {
      offers.push({
        id: generateOfferId(),
        code: "WELCOME20",
        title: "Welcome Offer",
        description: "20% off on your first order",
        discountType: "percent",
        discountValue: 20,
        minOrder: 200,
        validUntil: now + 7 * 24 * 60 * 60 * 1000,
      });
    }

    // Time-based offers
    const hour = new Date().getHours();
    if (hour >= 14 && hour <= 17) {
      offers.push({
        id: generateOfferId(),
        code: "HAPPYHOUR",
        title: "Happy Hour Special",
        description: "15% off on all beverages",
        discountType: "percent",
        discountValue: 15,
        minOrder: 0,
        validUntil: now + 3 * 60 * 60 * 1000,
      });
    }

    // Frequency-based offers
    if (visitCount >= 5) {
      offers.push({
        id: generateOfferId(),
        code: "LOYAL50",
        title: "Loyalty Reward",
        description: "₹50 off on orders above ₹500",
        discountType: "flat",
        discountValue: 50,
        minOrder: 500,
        validUntil: now + 14 * 24 * 60 * 60 * 1000,
      });
    }

    // Random promotional offer
    offers.push({
      id: generateOfferId(),
      code: "SPICE10",
      title: "Spice Deal",
      description: "10% off on spicy dishes",
      discountType: "percent",
      discountValue: 10,
      minOrder: 150,
      validUntil: now + 3 * 24 * 60 * 60 * 1000,
    });

    return offers;
  },

  async getDynamicPricing(
    itemId: string,
    _time: string
  ): Promise<PricingResult> {
    const item = menuItems.find((m) => m.id === itemId);
    if (!item) {
      return {
        itemId,
        basePrice: 0,
        dynamicPrice: 0,
        demandLevel: "low",
      };
    }

    const demand = getDemandLevel();
    const multiplier = getDynamicMultiplier(demand);
    const dynamicPrice = Math.round(item.price * multiplier);

    return {
      itemId,
      basePrice: item.price,
      dynamicPrice,
      demandLevel: demand,
    };
  },

  async getLoyaltyRewards(_customerId: string): Promise<Reward[]> {
    const allRewards: Reward[] = [
      {
        id: "reward_1",
        title: "Free Dessert",
        description: "Complimentary dessert of your choice",
        pointsRequired: 100,
        discountValue: 150,
      },
      {
        id: "reward_2",
        title: "10% Off Next Order",
        description: "Get 10% off on your next visit",
        pointsRequired: 200,
        discountValue: 0,
      },
      {
        id: "reward_3",
        title: "Free Appetizer",
        description: "Choose any appetizer from the menu",
        pointsRequired: 300,
        discountValue: 250,
      },
      {
        id: "reward_4",
        title: "₹200 Voucher",
        description: "₹200 off on orders above ₹800",
        pointsRequired: 500,
        discountValue: 200,
      },
      {
        id: "reward_5",
        title: "Chef's Table Experience",
        description: "Exclusive 5-course tasting menu for 2",
        pointsRequired: 1000,
        discountValue: 2000,
      },
    ];

    return allRewards.map((reward) => ({
      ...reward,
      // Mark as available if user has enough points
    }));
  },
};
