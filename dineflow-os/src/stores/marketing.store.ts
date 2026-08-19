import { create } from "zustand";
import { persist } from "zustand/middleware";
import { services } from "@/services";
import type {
  MarketingAutomation,
  MarketingCampaign,
  MarketingMessageLog,
  MarketingTemplate,
} from "@/services/types";

interface MarketingState {
  templates: MarketingTemplate[];
  campaigns: MarketingCampaign[];
  automations: MarketingAutomation[];
  logs: MarketingMessageLog[];
  loading: boolean;
  refresh: () => Promise<void>;
  sendCampaign: (id: string) => Promise<void>;
  runAutomation: (id: string) => Promise<void>;
}

export const useMarketingStore = create<MarketingState>()(
  persist(
    (set) => ({
      templates: [],
      campaigns: [],
      automations: [],
      logs: [],
      loading: false,

      async refresh() {
        set({ loading: true });
        try {
          const [templates, campaigns, automations, logs] = await Promise.all([
            services.marketing.getTemplates(),
            services.marketing.getCampaigns(),
            services.marketing.getAutomations(),
            services.marketing.getLogs(),
          ]);
          set({ templates, campaigns, automations, logs });
        } finally {
          set({ loading: false });
        }
      },

      async sendCampaign(id) {
        await services.marketing.sendCampaign(id);
        const campaigns = await services.marketing.getCampaigns();
        const logs = await services.marketing.getLogs();
        set({ campaigns, logs });
      },

      async runAutomation(id) {
        await services.marketing.runAutomation(id);
        const automations = await services.marketing.getAutomations();
        const logs = await services.marketing.getLogs();
        set({ automations, logs });
      },
    }),
    { name: "dineflow-marketing", partialize: () => ({}) }
  )
);
