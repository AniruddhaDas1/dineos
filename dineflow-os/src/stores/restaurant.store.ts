import { create } from "zustand";
import { restaurant as defaultRestaurant } from "@/data/restaurant";
import type { Restaurant } from "@/services/types";

const STORAGE_KEY = "dineflow-restaurant";

function loadDetails(): Restaurant {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultRestaurant, ...JSON.parse(stored) };
    }
  } catch {}
  return defaultRestaurant;
}

interface RestaurantState {
  details: Restaurant;
  updateDetails: (updates: Partial<Restaurant>) => void;
}

export const useRestaurantStore = create<RestaurantState>((set) => ({
  details: loadDetails(),
  updateDetails: (updates) =>
    set((state) => {
      const updated = { ...state.details, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { details: updated };
    }),
}));
