import { create } from "zustand";
import { services } from "@/services";
import type { Feedback } from "@/services/types";

interface FeedbackState {
  submit: (feedback: Feedback) => Promise<void>;
}

export const useFeedbackStore = create<FeedbackState>(() => ({
  async submit(feedback) {
    await services.customer.submitFeedback(feedback);
  },
}));
