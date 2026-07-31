import { describe, it, expect } from "vitest";
import { mockForecastService } from "./mockForecastService";

describe("mockForecastService", () => {
  describe("getHourlyForecast", () => {
    it("returns 24 hourly entries", async () => {
      const forecast = await mockForecastService.getHourlyForecast("2026-07-31");

      expect(forecast).toHaveLength(24);
      // Hours should be 0-23
      expect(forecast.map((f) => f.hour).sort((a, b) => a - b)).toEqual(
        Array.from({ length: 24 }, (_, i) => i)
      );
    });

    it("each entry has hour, predicted, and confidence", async () => {
      const forecast = await mockForecastService.getHourlyForecast("2026-07-31");

      forecast.forEach((h) => {
        expect(h).toHaveProperty("hour");
        expect(h).toHaveProperty("predicted");
        expect(h).toHaveProperty("confidence");
        expect(h.predicted).toBeGreaterThan(0);
        expect(h.confidence).toBeGreaterThanOrEqual(0);
        expect(h.confidence).toBeLessThanOrEqual(1);
      });
    });

    it("day of week multiplier affects predictions", async () => {
      // Sunday (day 0) has multiplier 1.1, Monday (day 1) has 0.8
      const sunday = await mockForecastService.getHourlyForecast("2025-01-05"); // Sun
      const monday = await mockForecastService.getHourlyForecast("2025-01-06"); // Mon

      const sundayTotal = sunday.reduce((s, h) => s + h.predicted, 0);
      const mondayTotal = monday.reduce((s, h) => s + h.predicted, 0);

      // Sunday (1.1) should have higher demand than Monday (0.8)
      expect(sundayTotal).toBeGreaterThan(mondayTotal);
    });

    it("confidence is higher during business hours", async () => {
      const forecast = await mockForecastService.getHourlyForecast("2026-07-31");

      const businessHours = forecast.filter((h) => h.hour >= 8 && h.hour <= 22);
      const offHours = forecast.filter((h) => h.hour < 8 || h.hour > 22);

      const avgBusiness = businessHours.reduce((s, h) => s + h.confidence, 0) / businessHours.length;
      const avgOff = offHours.reduce((s, h) => s + h.confidence, 0) / offHours.length;

      expect(avgBusiness).toBeGreaterThan(avgOff);
    });
  });

  describe("getDailyForecast", () => {
    it("returns 7 daily entries", async () => {
      const forecast = await mockForecastService.getDailyForecast("2026-07-27");

      expect(forecast).toHaveLength(7);
    });

    it("each entry has date, dayOfWeek, and predicted", async () => {
      const forecast = await mockForecastService.getDailyForecast("2026-07-27");

      forecast.forEach((d) => {
        expect(d).toHaveProperty("date");
        expect(d).toHaveProperty("dayOfWeek");
        expect(d).toHaveProperty("predicted");
        expect(d.predicted).toBeGreaterThan(0);
        expect(d.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    it("dates are sequential", async () => {
      const forecast = await mockForecastService.getDailyForecast("2026-07-27");

      for (let i = 1; i < forecast.length; i++) {
        const prev = new Date(forecast[i - 1].date).getTime();
        const curr = new Date(forecast[i].date).getTime();
        expect(curr - prev).toBe(24 * 60 * 60 * 1000);
      }
    });
  });

  describe("getInventoryForecast", () => {
    it("returns prediction for a valid dish", async () => {
      const pred = await mockForecastService.getInventoryForecast("mi-1");

      expect(pred).toHaveProperty("itemId", "mi-1");
      expect(pred).toHaveProperty("currentStock");
      expect(pred).toHaveProperty("daysUntilStockout");
      expect(pred).toHaveProperty("reorderSuggested");
      expect(pred.currentStock).toBeGreaterThan(0);
      expect(pred.daysUntilStockout).toBeGreaterThanOrEqual(0);
      expect(typeof pred.reorderSuggested).toBe("boolean");
    });

    it("returns default values for unknown dish", async () => {
      const pred = await mockForecastService.getInventoryForecast("unknown-dish");

      expect(pred.itemId).toBe("unknown-dish");
      expect(pred.currentStock).toBe(20);
      expect(pred.reorderSuggested).toBe(false); // 20/5 = 4 days, no reorder
    });

    it("bestseller dishes deplete faster", async () => {
      const pred = await mockForecastService.getInventoryForecast("mi-1");

      // If mi-1 is a bestseller, dailyConsumption = 25
      // daysUntilStockout = floor(currentStock / 25)
      if (pred.reorderSuggested) {
        expect(pred.daysUntilStockout).toBeLessThanOrEqual(2);
      }
    });
  });
});
