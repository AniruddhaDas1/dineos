import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WebsiteConfig, WebsiteContent, WebsiteTheme } from "@/services/types";
import { websiteTemplates } from "@/data/websiteTemplates";

function nextId(): string {
  return `web-${crypto.randomUUID().slice(0, 8)}`;
}

function cloneTemplate(templateId: string): Omit<WebsiteConfig, "id" | "createdAt" | "updatedAt"> {
  const tpl = websiteTemplates.find((t) => t.id === templateId) ?? websiteTemplates[0];
  // Deep clone content + theme to avoid mutating the seed template
  const content: WebsiteContent = JSON.parse(JSON.stringify(tpl.content));
  const theme: WebsiteTheme = { ...tpl.theme };
  return {
    label: tpl.name,
    templateId: tpl.id,
    content,
    theme,
  };
}

interface WebsiteState {
  configs: WebsiteConfig[];
  activeId: string | null;
  selectTemplate: (templateId: string) => WebsiteConfig;
  createConfig: (c: Omit<WebsiteConfig, "id" | "createdAt" | "updatedAt">) => WebsiteConfig;
  updateConfig: (id: string, patch: Partial<Omit<WebsiteConfig, "id" | "createdAt" | "updatedAt">>) => void;
  deleteConfig: (id: string) => void;
  setActive: (id: string) => void;
  getActive: () => WebsiteConfig | undefined;
}

function seedDefaultConfigs(): { configs: WebsiteConfig[]; activeId: string } {
  const now = Date.now();
  const cloned = cloneTemplate("tpl-restaurant");
  const cfg: WebsiteConfig = {
    ...cloned,
    id: nextId(),
    createdAt: now,
    updatedAt: now,
  };
  cfg.content.name = "Saffron & Smoke"; // preserve current brand name
  return { configs: [cfg], activeId: cfg.id };
}

const seeded = seedDefaultConfigs();

export const useWebsiteStore = create<WebsiteState>()(
  persist(
    (set, get) => ({
      configs: seeded.configs,
      activeId: seeded.activeId,

      selectTemplate(templateId) {
        const base = cloneTemplate(templateId);
        const cfg: WebsiteConfig = {
          ...base,
          id: nextId(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        return cfg;
      },

      createConfig(c) {
        const cfg: WebsiteConfig = {
          ...c,
          id: nextId(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((s) => ({ configs: [...s.configs, cfg] }));
        return cfg;
      },

      updateConfig(id, patch) {
        set((s) => ({
          configs: s.configs.map((cfg) =>
            cfg.id === id ? { ...cfg, ...patch, updatedAt: Date.now() } : cfg
          ),
        }));
      },

      deleteConfig(id) {
        set((s) => {
          const configs = s.configs.filter((c) => c.id !== id);
          let activeId = s.activeId;
          if (activeId === id) {
            activeId = configs.length > 0 ? configs[0].id : null;
          }
          return { configs, activeId };
        });
      },

      setActive(id) {
        set({ activeId: id });
      },

      getActive() {
        const { configs, activeId } = get();
        return configs.find((c) => c.id === activeId);
      },
    }),
    { name: "dineflow-website-builder" }
  )
);
