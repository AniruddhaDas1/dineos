import type {
  SentimentService,
  SentimentResult,
  SentimentTrend,
  TopicFrequency,
} from "../types";

// Sentiment keyword dictionaries
const POSITIVE_KEYWORDS = [
  "excellent",
  "amazing",
  "wonderful",
  "fantastic",
  "great",
  "love",
  "perfect",
  "best",
  "delicious",
  "tasty",
  "fresh",
  "authentic",
  "impressive",
  "outstanding",
  "superb",
  "brilliant",
  "friendly",
  "quick",
  "clean",
  "beautiful",
  "cozy",
  "comfortable",
  "recommend",
  "favorite",
  "exceptional",
];

const NEGATIVE_KEYWORDS = [
  "terrible",
  "awful",
  "bad",
  "worst",
  "horrible",
  "disgusting",
  "cold",
  "late",
  "rude",
  "slow",
  "dirty",
  "stale",
  "bland",
  "overpriced",
  "disappointing",
  "mediocre",
  "poor",
  "wait",
  "waited",
  "never again",
  "waste",
  "disappointed",
  "unhappy",
  "annoyed",
  "frustrated",
];

// Topic extraction keywords
const TOPIC_KEYWORDS: Record<string, string[]> = {
  food: ["food", "dish", "meal", "taste", "flavor", "spice", "seasoning", "cook"],
  service: ["service", "staff", "waiter", "server", "attentive", "helpful", "rude"],
  ambiance: ["ambiance", "atmosphere", "decor", "music", "lighting", "vibe", "cozy"],
  price: ["price", "value", "expensive", "cheap", "worth", "cost", "affordable"],
  speed: ["time", "wait", "quick", "fast", "slow", "prompt", "delayed"],
  portion: ["portion", "quantity", "size", "small", "large", "generous", "enough"],
  freshness: ["fresh", "stale", "old", "quality", "raw", "overcooked", "perfect"],
};

function calculateKeywordScore(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  let score = 0;
  let matches = 0;

  for (const keyword of keywords) {
    if (lower.includes(keyword)) {
      score += 1;
      matches++;
    }
  }

  // Normalize by text length (words)
  const wordCount = lower.split(/\s+/).length;
  return matches > 0 ? Math.min(score / Math.max(wordCount / 10, 1), 1) : 0;
}

function calculateRatingSentiment(rating: number): number {
  // Map 1-5 rating to -1 to 1 sentiment
  return (rating - 3) / 2;
}

function extractTopics(text: string): string[] {
  const lower = text.toLowerCase();
  const topics: string[] = [];

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      topics.push(topic);
    }
  }

  return topics.length > 0 ? topics : ["general"];
}

export const mockSentimentService: SentimentService = {
  async analyzeSentiment(
    text: string,
    rating: number
  ): Promise<SentimentResult> {
    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 50));

    const positiveScore = calculateKeywordScore(text, POSITIVE_KEYWORDS);
    const negativeScore = calculateKeywordScore(text, NEGATIVE_KEYWORDS);
    const ratingSentiment = calculateRatingSentiment(rating);

    // Combine text and rating sentiment
    const textSentiment = positiveScore - negativeScore;
    const combinedScore = textSentiment * 0.6 + ratingSentiment * 0.4;

    // Clamp to -1 to 1
    const score = Math.max(-1, Math.min(1, combinedScore));

    let label: "positive" | "negative" | "neutral";
    if (score > 0.2) label = "positive";
    else if (score < -0.2) label = "negative";
    else label = "neutral";

    const topics = extractTopics(text);

    return { score, label, topics };
  },

  async getSentimentTrend(dateRange: {
    start: string;
    end: string }): Promise<SentimentTrend[]> {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const trends: SentimentTrend[] = [];

    const current = new Date(start);
    while (current <= end) {
      // Generate mock trend data with some randomness
      const baseScore = 0.3 + Math.random() * 0.4; // 0.3 to 0.7
      const count = Math.floor(Math.random() * 20) + 5;

      trends.push({
        date: current.toISOString().split("T")[0],
        avgScore: Math.round(baseScore * 100) / 100,
        count,
      });

      current.setDate(current.getDate() + 1);
    }

    return trends;
  },

  async getTopTopics(limit: number): Promise<TopicFrequency[]> {
    const topics: TopicFrequency[] = [
      {
        topic: "food",
        count: 156,
        avgSentiment: 0.72,
      },
      {
        topic: "service",
        count: 89,
        avgSentiment: 0.65,
      },
      {
        topic: "ambiance",
        count: 67,
        avgSentiment: 0.81,
      },
      {
        topic: "price",
        count: 45,
        avgSentiment: 0.45,
      },
      {
        topic: "speed",
        count: 34,
        avgSentiment: 0.38,
      },
      {
        topic: "portion",
        count: 28,
        avgSentiment: 0.52,
      },
      {
        topic: "freshness",
        count: 23,
        avgSentiment: 0.69,
      },
    ];

    return topics.slice(0, limit);
  },
};
