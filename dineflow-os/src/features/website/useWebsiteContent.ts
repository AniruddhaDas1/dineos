import { useWebsiteStore } from "@/stores/website.store";

export function useWebsiteContent() {
  const config = useWebsiteStore((s) =>
    s.configs.find((c) => c.id === s.activeId)
  );
  return config?.content;
}
