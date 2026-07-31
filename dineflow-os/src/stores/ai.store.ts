import { create } from "zustand";
import { services } from "@/services";
import type {
  RecommendationResult,
  HourlyDemand,
  DailyDemand,
  Offer,
  Reward,
  SentimentTrend,
  TopicFrequency,
} from "@/services/types";

interface AIState {
  // Recommendations
  recommendations: RecommendationResult[];
  trending: RecommendationResult[];
  loadingRecommendations: boolean;

  // Forecasting
  hourlyForecast: HourlyDemand[];
  dailyForecast: DailyDemand[];
  loadingForecast: boolean;

  // Pricing & Offers
  offers: Offer[];
  rewards: Reward[];
  loadingOffers: boolean;

  // Sentiment
  sentimentTrend: SentimentTrend[];
  topTopics: TopicFrequency[];
  loadingSentiment: boolean;

  // Actions
  loadRecommendations: (customerId: string) => Promise<void>;
  loadTrending: () => Promise<void>;
  loadSimilarDishes: (dishId: string) => Promise<void>;
  loadHourlyForecast: (date: string) => Promise<void>;
  loadDailyForecast: (week: string) => Promise<void>;
  loadOffers: (customerId: string) => Promise<void>;
  loadRewards: (customerId: string) => Promise<void>;
  loadSentimentTrend: (start: string, end: string) => Promise<void>;
  loadTopTopics: () => Promise<void>;
}

export const useAIStore = create<AIState>((set) => ({
  recommendations: [],
  trending: [],
  loadingRecommendations: false,

  hourlyForecast: [],
  dailyForecast: [],
  loadingForecast: false,

  offers: [],
  rewards: [],
  loadingOffers: false,

  sentimentTrend: [],
  topTopics: [],
  loadingSentiment: false,

  loadRecommendations: async (customerId: string) => {
    set({ loadingRecommendations: true });
    try {
      const recommendations =
        await services.recommendation.getPersonalizedRecommendations(
          customerId,
          6
        );
      set({ recommendations });
    } finally {
      set({ loadingRecommendations: false });
    }
  },

  loadTrending: async () => {
    set({ loadingRecommendations: true });
    try {
      const trending = await services.recommendation.getTrendingDishes(6);
      set({ trending });
    } finally {
      set({ loadingRecommendations: false });
    }
  },

  loadSimilarDishes: async (dishId: string) => {
    set({ loadingRecommendations: true });
    try {
      const recommendations =
        await services.recommendation.getSimilarDishes(dishId, 4);
      set({ recommendations });
    } finally {
      set({ loadingRecommendations: false });
    }
  },

  loadHourlyForecast: async (date: string) => {
    set({ loadingForecast: true });
    try {
      const hourlyForecast = await services.forecast.getHourlyForecast(date);
      set({ hourlyForecast });
    } finally {
      set({ loadingForecast: false });
    }
  },

  loadDailyForecast: async (week: string) => {
    set({ loadingForecast: true });
    try {
      const dailyForecast = await services.forecast.getDailyForecast(week);
      set({ dailyForecast });
    } finally {
      set({ loadingForecast: false });
    }
  },

  loadOffers: async (customerId: string) => {
    set({ loadingOffers: true });
    try {
      const offers = await services.pricing.getPersonalizedOffers(customerId);
      set({ offers });
    } finally {
      set({ loadingOffers: false });
    }
  },

  loadRewards: async (customerId: string) => {
    set({ loadingOffers: true });
    try {
      const rewards = await services.pricing.getLoyaltyRewards(customerId);
      set({ rewards });
    } finally {
      set({ loadingOffers: false });
    }
  },

  loadSentimentTrend: async (start: string, end: string) => {
    set({ loadingSentiment: true });
    try {
      const sentimentTrend = await services.sentiment.getSentimentTrend({
        start,
        end,
      });
      set({ sentimentTrend });
    } finally {
      set({ loadingSentiment: false });
    }
  },

  loadTopTopics: async () => {
    set({ loadingSentiment: true });
    try {
      const topTopics = await services.sentiment.getTopTopics(5);
      set({ topTopics });
    } finally {
      set({ loadingSentiment: false });
    }
  },
}));
