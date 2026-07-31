# Phase 10: AI Features — Design Spec

## Overview

Phase 10 adds five AI-powered features to DineFlow OS, implemented as mock services with realistic UI. All AI logic runs client-side using heuristic algorithms (no external API calls), following the existing swappable data layer pattern.

## Features

### 1. Menu Recommendation Engine

**Purpose:** Personalized dish suggestions based on customer context.

**Inputs:**
- Customer order history (from session store)
- Time of day (breakfast/lunch/dinner)
- Current season
- Dish popularity (order frequency)
- Dietary tags (veg/non-veg, spice level)

**Algorithm (mock):**
```
score = basePopularity * timeWeight * seasonWeight * historyBoost * dietaryMatch
```

**UI Components:**
- `RecommendationBanner` — shown on menu page, 3-4 personalized suggestions
- `BecauseYouLiked` — "Because you ordered X" section
- `TrendingNow` — popularity-based suggestions for new customers

**Service Interface:**
```typescript
interface RecommendationService {
  getPersonalizedRecommendations(customerId: string, limit: number): Promise<MenuItem[]>;
  getTrendingDishes(limit: number): Promise<MenuItem[]>;
  getSimilarDishes(dishId: string, limit: number): Promise<MenuItem[]>;
}
```

---

### 2. Demand Forecasting

**Purpose:** Predict restaurant traffic and inventory needs.

**Inputs:**
- Historical order data (last 30 days simulated)
- Day of week
- Time of day
- Special events (holidays, festivals)

**Algorithm (mock):**
```
baseDemand = historicalAvg[dayOfWeek][hour]
seasonalFactor = seasonMultiplier[currentMonth]
forecast = baseDemand * seasonalFactor * dayOfWeekWeight
```

**UI Components:**
- `DemandChart` — hourly demand forecast on dashboard
- `PeakHoursIndicator` — shows predicted busy periods
- `InventoryAlert` — stock depletion predictions

**Service Interface:**
```typescript
interface ForecastService {
  getHourlyForecast(date: string): Promise<HourlyDemand[]>;
  getDailyForecast week: string): Promise<DailyDemand[]>;
  getInventoryForecast(dishId: string): Promise<InventoryPrediction>;
}
```

---

### 3. Smart Pricing & Promotions

**Purpose:** Dynamic pricing suggestions and personalized offers.

**Inputs:**
- Customer loyalty tier
- Order frequency
- Average order value
- Current demand level
- Time since last visit

**Algorithm (mock):**
```
discount = baseDiscount * loyaltyMultiplier * churnRisk * demandDiscount
couponValue = clamp(discount, 5%, 25%)
```

**UI Components:**
- `SmartCoupon` — personalized discount cards
- `PricingInsight` — "Popular time = better prices" indicator
- `LoyaltyReward` — AI-optimized reward suggestions

**Service Interface:**
```typescript
interface PricingService {
  getPersonalizedOffers(customerId: string): Promise<Offer[]>;
  getDynamicPricing(itemId: string, time: string): Promise<PricingResult>;
  getLoyaltyRewards(customerId: string): Promise<Reward[]>;
}
```

---

### 4. Natural Language Ordering

**Purpose:** Chat-based ordering with natural language understanding.

**Inputs:**
- User text/voice input
- Menu context
- Order history

**Algorithm (mock):**
```
intent = classifyIntent(input)  // order, modify, cancel, query
entities = extractEntities(input)  // dishes, quantities, modifications
response = generateResponse(intent, entities, menuContext)
```

**Supported Intents:**
- `order` — "Add 2 Butter Chicken"
- `modify` — "Make it extra spicy"
- `cancel` — "Remove the Naan"
- `query` — "What's vegetarian?"
- `reorder` — "Order my usual"

**UI Components:**
- `ChatBot` — floating chat interface
- `QuickReply` — suggested actions
- `OrderSummary` — live cart preview in chat

**Service Interface:**
```typescript
interface NLPUnderstandingService {
  parseIntent(input: string): Promise<NLUResult>;
  extractEntities(input: string, menuContext: MenuItem[]): Promise<ExtractedEntities>;
  generateResponse(intent: string, entities: ExtractedEntities): Promise<string>;
}
```

---

### 5. Sentiment Analysis

**Purpose:** Analyze customer feedback for insights.

**Inputs:**
- Feedback text
- Rating (1-5 stars)
- Order context

**Algorithm (mock):**
```
sentiment = keywordSentiment(text) + ratingSentiment(rating)
topics = extractTopics(text)
urgency = detectUrgency(text, sentiment)
```

**Sentiment Keywords:**
- Positive: "excellent", "amazing", "love", "perfect", "best"
- Negative: "terrible", "awful", "cold", "late", "rude"
- Neutral: "okay", "fine", "average", "decent"

**UI Components:**
- `SentimentDashboard` — sentiment trends over time
- `FeedbackCard` — analyzed feedback with sentiment badge
- `AlertBanner` — urgent negative feedback alerts

**Service Interface:**
```typescript
interface SentimentService {
  analyzeSentiment(text: string, rating: number): Promise<SentimentResult>;
  getSentimentTrend(dateRange: DateRange): Promise<SentimentTrend[]>;
  getTopTopics(limit: number): Promise<TopicFrequency[]>;
}
```

---

## Implementation Structure

```
src/features/ai/
├── recommendations/
│   ├── RecommendationBanner.tsx
│   ├── BecauseYouLiked.tsx
│   └── TrendingNow.tsx
├── forecasting/
│   ├── DemandChart.tsx
│   ├── PeakHoursIndicator.tsx
│   └── InventoryAlert.tsx
├── pricing/
│   ├── SmartCoupon.tsx
│   ├── PricingInsight.tsx
│   └── LoyaltyReward.tsx
├── nlp/
│   ├── ChatBot.tsx
│   ├── QuickReply.tsx
│   └── OrderSummary.tsx
├── sentiment/
│   ├── SentimentDashboard.tsx
│   ├── FeedbackCard.tsx
│   └── AlertBanner.tsx
└── index.ts

src/services/mock/
├── mockRecommendationService.ts
├── mockForecastService.ts
├── mockPricingService.ts
├── mockNLUService.ts
└── mockSentimentService.ts

src/stores/
├── ai.store.ts          // AI feature state
└── chat.store.ts        // Chat/NLP state
```

---

## Service Registration

Add to `src/services/index.ts`:
```typescript
export interface AIServices {
  recommendation: RecommendationService;
  forecast: ForecastService;
  pricing: PricingService;
  nlp: NLPUnderstandingService;
  sentiment: SentimentService;
}
```

Mock implementations in `src/services/mock/` following existing pattern.

---

## UI Integration Points

| Feature | Integration Point | Location |
|---------|-------------------|----------|
| Recommendations | Menu page top | `customer/menu/MenuPage.tsx` |
| Demand Forecast | POS dashboard | `pos/dashboard/DashboardPage.tsx` |
| Smart Pricing | Cart page | `customer/cart/CartPage.tsx` |
| Chat Bot | Global floating button | `app/App.tsx` |
| Sentiment | POS feedback panel | `pos/crm/FeedbackPanel.tsx` |

---

## Data Dependencies

- `src/data/menu.ts` — menu items with tags
- `src/stores/session.store.ts` — customer history
- `src/stores/order.store.ts` — order data for forecasting
- `src/stores/feedback.store.ts` — feedback for sentiment

---

## Testing Strategy

- Unit tests for each service algorithm
- Mock data generators for realistic test scenarios
- Integration tests for service → store → component flow

---

## Success Criteria

1. All 5 features render with realistic mock data
2. Recommendation engine returns contextually relevant suggestions
3. Forecasting shows believable hourly/daily patterns
4. Chat bot handles 5+ intent types correctly
5. Sentiment analysis classifies text accurately
6. No performance degradation (all algorithms < 50ms)
