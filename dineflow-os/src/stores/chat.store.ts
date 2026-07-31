import { create } from "zustand";
import { services } from "@/services";
import { menuItems } from "@/data/menu";
import type { NLUIntent, ExtractedEntity } from "@/services/types";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  intent?: NLUIntent;
  entities?: ExtractedEntity[];
}

interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  isProcessing: boolean;

  // Actions
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (input: string) => Promise<void>;
  clearChat: () => void;
}

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to Saffron & Smoke! I can help you order, answer questions about our menu, or reorder your favorites. What would you like?",
      timestamp: Date.now(),
    },
  ],
  isOpen: false,
  isProcessing: false,

  toggleChat: () => set((s) => ({ isOpen: !s.isOpen })),
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),

  sendMessage: async (input: string) => {
    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    set((s) => ({
      messages: [...s.messages, userMessage],
      isProcessing: true,
    }));

    try {
      // Parse intent
      const nluResult = await services.nlp.parseIntent(input);

      // Extract entities
      const entities = await services.nlp.extractEntities(input, menuItems);

      // Generate response
      const response = await services.nlp.generateResponse(
        nluResult.intent,
        entities
      );

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: response,
        timestamp: Date.now(),
        intent: nluResult.intent,
        entities,
      };

      set((s) => ({
        messages: [...s.messages, assistantMessage],
        isProcessing: false,
      }));
    } catch {
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: "Sorry, I didn't catch that. Could you try again?",
        timestamp: Date.now(),
      };

      set((s) => ({
        messages: [...s.messages, errorMessage],
        isProcessing: false,
      }));
    }
  },

  clearChat: () =>
    set({
      messages: [
        {
          id: "welcome",
          role: "assistant",
          content:
            "Chat cleared. How can I help you today?",
          timestamp: Date.now(),
        },
      ],
    }),
}));
