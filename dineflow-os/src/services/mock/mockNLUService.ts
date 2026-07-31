import type {
  NLPUnderstandingService,
  NLUResult,
  NLUIntent,
  ExtractedEntity,
  MenuItem,
} from "../types";

// Intent classification keywords
const INTENT_PATTERNS: Record<NLUIntent, string[]> = {
  order: [
    "add",
    "order",
    "want",
    "get me",
    "bring",
    "give me",
    "i'll have",
    "i'll take",
    "let me get",
  ],
  modify: [
    "make it",
    "extra",
    "less",
    "no",
    "without",
    "add more",
    "change to",
    "swap",
  ],
  cancel: [
    "remove",
    "cancel",
    "delete",
    "take off",
    "drop",
    "never mind",
  ],
  query: [
    "what",
    "which",
    "do you have",
    "is there",
    "show me",
    "tell me",
    "options",
  ],
  reorder: [
    "my usual",
    "last time",
    "same as before",
    "order again",
    "reorder",
    "what i had",
  ],
  unknown: [],
};

// Quantity extraction patterns
const QUANTITY_PATTERNS = [
  /(\d+)\s*(?:plates?|pcs?|pieces?|portions?)/i,
  /(?:one|two|three|four|five|six|seven|eight|nine|ten)\s/i,
  /(\d+)/,
];

const WORD_TO_NUM: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  a: 1,
  an: 1,
};

// Modifier keywords
const MODIFIER_KEYWORDS = [
  "extra spicy",
  "less spicy",
  "mild",
  "spicy",
  "hot",
  "cold",
  "no onion",
  "no garlic",
  "extra cheese",
  "less oil",
  "crispy",
  "soft",
];

function classifyIntent(input: string): { intent: NLUIntent; confidence: number } {
  const lower = input.toLowerCase();
  let bestIntent: NLUIntent = "unknown";
  let bestScore = 0;

  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    if (intent === "unknown") continue;
    let score = 0;
    for (const pattern of patterns) {
      if (lower.includes(pattern)) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent as NLUIntent;
    }
  }

  const confidence = bestScore > 0 ? Math.min(0.6 + bestScore * 0.15, 0.95) : 0.3;
  return { intent: bestIntent, confidence };
}

function extractQuantity(input: string): number {
  const lower = input.toLowerCase();

  // Check word numbers first (word-boundary match to avoid "a" matching "add")
  for (const [word, num] of Object.entries(WORD_TO_NUM)) {
    const wordRegex = new RegExp(`\\b${word}\\b`, "i");
    if (wordRegex.test(lower)) return num;
  }

  // Check digit patterns
  for (const pattern of QUANTITY_PATTERNS) {
    const match = input.match(pattern);
    if (match) return parseInt(match[1]);
  }

  return 1; // default
}

function findDishMention(input: string, menu: MenuItem[]): MenuItem | null {
  const lower = input.toLowerCase();

  // Exact match first
  for (const item of menu) {
    if (lower.includes(item.name.toLowerCase())) {
      return item;
    }
  }

  // Partial match
  for (const item of menu) {
    const words = item.name.toLowerCase().split(" ");
    if (words.some((word) => word.length > 3 && lower.includes(word))) {
      return item;
    }
  }

  return null;
}

function extractModifiers(input: string): string[] {
  const lower = input.toLowerCase();
  return MODIFIER_KEYWORDS.filter((mod) => lower.includes(mod));
}

function generateResponse(intent: string, entities: ExtractedEntity[]): string {
  const dish = entities.find((e) => e.type === "dish");
  const quantity = entities.find((e) => e.type === "quantity");
  const modifiers = entities.filter((e) => e.type === "modifier");

  switch (intent) {
    case "order":
      if (dish) {
        const qty = quantity ? parseInt(quantity.value) : 1;
        const modStr = modifiers.length
          ? ` with ${modifiers.map((m) => m.value).join(" and ")}`
          : "";
        return `Added ${qty}x ${dish.value}${modStr} to your cart.`;
      }
      return "What would you like to order? You can say things like 'Add 2 Butter Chicken'.";

    case "modify":
      if (dish && modifiers.length) {
        return `Updated ${dish.value}: ${modifiers.map((m) => m.value).join(", ")}.`;
      }
      return "What would you like to modify? You can say 'Make it extra spicy' or 'No onion'.";

    case "cancel":
      if (dish) {
        return `Removed ${dish.value} from your cart.`;
      }
      return "Which item would you like to remove?";

    case "query":
      if (dish) {
        return `Here's what I know about ${dish.value}. Would you like to add it to your order?`;
      }
      return "Here are our menu categories. What are you in the mood for?";

    case "reorder":
      return "I found your previous orders. Would you like to reorder your usual?";

    default:
      return "I can help you order, modify your order, or answer questions about our menu. What would you like?";
  }
}

export const mockNLUService: NLPUnderstandingService = {
  async parseIntent(input: string): Promise<NLUResult> {
    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 100));

    const { intent, confidence } = classifyIntent(input);
    return { intent, confidence, raw: input };
  },

  async extractEntities(
    input: string,
    menuContext: MenuItem[]
  ): Promise<ExtractedEntity[]> {
    const entities: ExtractedEntity[] = [];

    // Extract dish
    const dish = findDishMention(input, menuContext);
    if (dish) {
      entities.push({
        type: "dish",
        value: dish.name,
        itemId: dish.id,
      });
    }

    // Extract quantity
    const quantity = extractQuantity(input);
    entities.push({
      type: "quantity",
      value: quantity.toString(),
    });

    // Extract modifiers
    const modifiers = extractModifiers(input);
    for (const mod of modifiers) {
      entities.push({
        type: "modifier",
        value: mod,
      });
    }

    return entities;
  },

  async generateResponse(
    intent: string,
    entities: ExtractedEntity[]
  ): Promise<string> {
    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 150));
    return generateResponse(intent, entities);
  },
};
