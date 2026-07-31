import type {
  ForecastService,
  HourlyDemand,
  DailyDemand,
  InventoryPrediction,
} from "../types";
import { menuItems } from "@/data/menu";

// Base demand patterns by hour (0-23)
const HOURLY_BASE = [
  5, 3, 2, 2, 5, 15, 35, 60, 75, 70, 85, 95, // 0-11
  90, 80, 60, 50, 55, 70, 90, 95, 85, 60, 30, 10, // 12-23
];

// Day of week multipliers (0=Sunday)
const DAY_MULTIPLIERS = [1.1, 0.8, 0.85, 0.9, 1.0, 1.3, 1.2];

// Seasonal multipliers by month (0=January)
const SEASON_MULTIPLIERS = [
  0.9, 0.85, 0.95, 1.0, 1.05, 1.1, 1.15, 1.1, 1.05, 1.0, 0.95, 1.2,
];

function getSeasonMultiplier(): number {
  const month = new Date().getMonth();
  return SEASON_MULTIPLIERS[month];
}

function addNoise(value: number, range: number = 0.15): number {
  const noise = 1 + (Math.random() * 2 - 1) * range;
  return Math.round(value * noise);
}

export const mockForecastService: ForecastService = {
  async getHourlyForecast(date: string): Promise<HourlyDemand[]> {
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();
    const seasonMult = getSeasonMultiplier();
    const dayMult = DAY_MULTIPLIERS[dayOfWeek];

    return HOURLY_BASE.map((base, hour) => {
      const predicted = addNoise(base * dayMult * seasonMult);
      const confidence = hour >= 6 && hour <= 22 ? 0.85 : 0.6;
      return { hour, predicted, confidence };
    });
  },

  async getDailyForecast(week: string): Promise<DailyDemand[]> {
    const startOfWeek = new Date(week);
    const seasonMult = getSeasonMultiplier();
    const days: DailyDemand[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dayOfWeek = date.getDay();
      const dayMult = DAY_MULTIPLIERS[dayOfWeek];

      // Sum hourly base for the day
      const baseSum = HOURLY_BASE.reduce((a, b) => a + b, 0);
      const predicted = addNoise(baseSum * dayMult * seasonMult);

      days.push({
        date: date.toISOString().split("T")[0],
        dayOfWeek: date.toLocaleDateString("en-US", { weekday: "long" }),
        predicted,
      });
    }

    return days;
  },

  async getInventoryForecast(dishId: string): Promise<InventoryPrediction> {
    const item = menuItems.find((m) => m.id === dishId);
    const currentStock = item ? Math.floor(Math.random() * 50) + 10 : 20;

    // Estimate daily consumption based on popularity
    let dailyConsumption = 5;
    if (item?.badges?.includes("bestseller")) dailyConsumption = 25;
    else if (item?.badges?.includes("popular")) dailyConsumption = 15;
    else if (item?.badges?.includes("chef-recommendation")) dailyConsumption = 12;

    const daysUntilStockout = Math.floor(currentStock / dailyConsumption);
    const reorderSuggested = daysUntilStockout <= 2;

    return {
      itemId: dishId,
      currentStock,
      daysUntilStockout,
      reorderSuggested,
    };
  },
};
