import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PosFeatures {
  instantPos: boolean;
  tableDining: boolean;
  onlineOrders: boolean;
  reservations: boolean;
  websiteBuilder: boolean;
}

interface PosSettingsState {
  features: PosFeatures;
  toggle: (feature: keyof PosFeatures) => void;
  isEnabled: (feature: keyof PosFeatures) => boolean;
}

export const usePosSettingsStore = create<PosSettingsState>()(
  persist(
    (set, get) => ({
      features: {
        instantPos: true,
        tableDining: true,
        onlineOrders: true,
        reservations: true,
        websiteBuilder: true,
      },

      toggle(feature) {
        set((s) => ({
          features: { ...s.features, [feature]: !s.features[feature] },
        }));
      },

      isEnabled(feature) {
        return get().features[feature];
      },
    }),
    { name: "dineflow-pos-settings" }
  )
);
