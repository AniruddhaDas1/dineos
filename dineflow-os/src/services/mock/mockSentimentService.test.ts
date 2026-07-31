import { describe, it, expect } from "vitest";
import { mockSentimentService } from "./mockSentimentService";

describe("mockSentimentService", () => {
  describe("analyzeSentiment", () => {
    it("classifies positive text as positive", async () => {
      const result = await mockSentimentService.analyzeSentiment(
        "This place is amazing and the food is excellent! Best service ever.",
        5
      );

      expect(result.label).toBe("positive");
      expect(result.score).toBeGreaterThan(0.2);
      expect(result.score).toBeLessThanOrEqual(1);
    });

    it("classifies negative text as negative", async () => {
      const result = await mockSentimentService.analyzeSentiment(
        "This was terrible and awful. The service was slow and rude.",
        1
      );

      expect(result.label).toBe("negative");
      expect(result.score).toBeLessThan(-0.2);
      expect(result.score).toBeGreaterThanOrEqual(-1);
    });

    it("classifies neutral text as neutral", async () => {
      const result = await mockSentimentService.analyzeSentiment(
        "It was okay, nothing special, just average.",
        3
      );

      expect(result.label).toBe("neutral");
    });

    it("considers rating in sentiment score", async () => {
      // Same text, different ratings
      const positiveText = "The food was okay";
      const highRating = await mockSentimentService.analyzeSentiment(positiveText, 5);
      const lowRating = await mockSentimentService.analyzeSentiment(positiveText, 1);

      expect(highRating.score).toBeGreaterThan(lowRating.score);
    });

    it("clamps score to [-1, 1]", async () => {
      const result = await mockSentimentService.analyzeSentiment(
        "excellent amazing wonderful fantastic perfect best love",
        5
      );

      expect(result.score).toBeLessThanOrEqual(1);
    });

    it("extracts topics from feedback text", async () => {
      const result = await mockSentimentService.analyzeSentiment(
        "The food was great but service was slow.",
        4
      );

      expect(result.topics.length).toBeGreaterThan(0);
      expect(result.topics).toContain("food");
      expect(result.topics).toContain("service");
    });

    it("returns 'general' topic when no topic keywords match", async () => {
      const result = await mockSentimentService.analyzeSentiment(
        "The experience was good.",
        5
      );

      // "good" is a positive keyword but not a topic keyword
      // Should still extract a topic or default to "general"
      expect(result.topics).toContain("general");
    });
  });

  describe("getSentimentTrend", () => {
    it("returns daily trend entries for date range", async () => {
      const trend = await mockSentimentService.getSentimentTrend({
        start: "2026-07-25",
        end: "2026-07-31",
      });

      expect(trend).toHaveLength(7);
    });

    it("each entry has date, avgScore, and count", async () => {
      const trend = await mockSentimentService.getSentimentTrend({
        start: "2026-07-25",
        end: "2026-07-27",
      });

      trend.forEach((t) => {
        expect(t).toHaveProperty("date");
        expect(t).toHaveProperty("avgScore");
        expect(t).toHaveProperty("count");
        expect(t.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(t.avgScore).toBeGreaterThanOrEqual(0);
        expect(t.count).toBeGreaterThan(0);
      });
    });
  });

  describe("getTopTopics", () => {
    it("returns topics limited by the limit parameter", async () => {
      const topics = await mockSentimentService.getTopTopics(3);

      expect(topics).toHaveLength(3);
    });

    it("returns all topics when limit exceeds available", async () => {
      const topics = await mockSentimentService.getTopTopics(100);

      expect(topics.length).toBeLessThanOrEqual(7);
    });

    it("first topic has the highest count", async () => {
      const topics = await mockSentimentService.getTopTopics(5);

      for (let i = 1; i < topics.length; i++) {
        expect(topics[i].count).toBeLessThanOrEqual(topics[i - 1].count);
      }
    });

    it("includes 'food' as a topic", async () => {
      const topics = await mockSentimentService.getTopTopics(7);

      expect(topics.some((t) => t.topic === "food")).toBe(true);
    });

    it("each topic has topic, count, and avgSentiment", async () => {
      const topics = await mockSentimentService.getTopTopics(3);

      topics.forEach((t) => {
        expect(t).toHaveProperty("topic");
        expect(t).toHaveProperty("count");
        expect(t).toHaveProperty("avgSentiment");
        expect(t.avgSentiment).toBeGreaterThanOrEqual(0);
        expect(t.avgSentiment).toBeLessThanOrEqual(1);
      });
    });
  });
});
