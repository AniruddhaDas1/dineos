import type { WebsiteTheme } from "@/services/types";

const STYLE_ID = "website-theme";

export function themeToCssVars(theme: WebsiteTheme): string {
  return `
    :root {
      --background: ${theme.background};
      --surface: ${theme.surface};
      --surface-2: ${theme.surface2};
      --foreground: ${theme.foreground};
      --muted: ${theme.muted};
      --border: ${theme.border};
      --accent: ${theme.accent};
      --accent-foreground: ${theme.accentForeground};
    }
  `;
}

export function applyWebsiteTheme(theme: WebsiteTheme): void {
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = themeToCssVars(theme);
}

export function clearWebsiteTheme(): void {
  const el = document.getElementById(STYLE_ID);
  if (el) el.remove();
}
