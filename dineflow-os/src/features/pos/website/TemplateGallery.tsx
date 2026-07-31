import type { CSSProperties } from "react";
import type { WebsiteTemplate, WebsiteTheme } from "@/services/types";
import { websiteTemplates } from "@/data/websiteTemplates";

interface TemplateGalleryProps {
  onSelect: (templateId: string) => void;
}

// Build a style object that injects the template's theme as CSS variables,
// so the preview renders with the template's real colors.
function themeVars(theme: WebsiteTheme): CSSProperties {
  return {
    "--background": theme.background,
    "--surface": theme.surface,
    "--surface-2": theme.surface2,
    "--foreground": theme.foreground,
    "--muted": theme.muted,
    "--border": theme.border,
    "--accent": theme.accent,
    "--accent-foreground": theme.accentForeground,
  } as CSSProperties;
}

function TemplatePreview({ tpl }: { tpl: WebsiteTemplate }) {
  const { content, theme } = tpl;
  return (
    <div
      className="relative h-44 w-full overflow-hidden bg-background text-foreground"
      style={themeVars(theme)}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="font-serif text-sm text-accent">{content.name}</span>
        <span className="rounded bg-accent px-2 py-0.5 text-[9px] font-medium uppercase tracking-widest text-accent-foreground">
          Order
        </span>
      </div>

      {/* Hero */}
      <div className="relative h-20">
        {content.heroImage && (
          <img src={content.heroImage} alt="" className="h-full w-full object-cover opacity-80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-background/20" />
        <div className="absolute inset-x-0 bottom-1 px-3">
          <p className="truncate font-serif text-base leading-tight text-foreground">
            {content.name}
          </p>
          <p className="truncate text-[9px] text-muted">{content.tagline}</p>
        </div>
      </div>

      {/* Mini menu cards */}
      <div className="grid grid-cols-3 gap-1.5 p-2">
        {content.menuItems.slice(0, 3).map((m, i) => (
          <div key={i} className="overflow-hidden rounded-md border border-border bg-surface">
            {m.image && (
              <img src={m.image} alt="" className="h-7 w-full object-cover" />
            )}
            <div className="px-1 py-0.5">
              <p className="truncate text-[8px] text-foreground">{m.name}</p>
              <p className="text-[8px] text-accent">₹{m.price}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Category badge */}
      <span className="absolute right-2 top-2 z-10 rounded-md bg-black/40 px-2 py-0.5 text-[9px] font-medium text-white backdrop-blur">
        {tpl.category}
      </span>
    </div>
  );
}

export function TemplateGallery({ onSelect }: TemplateGalleryProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {websiteTemplates.map((tpl) => (
        <button
          key={tpl.id}
          onClick={() => onSelect(tpl.id)}
          className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface text-left transition-colors hover:border-accent/40"
        >
          <TemplatePreview tpl={tpl} />
          <div className="p-4">
            <p className="font-serif text-lg">{tpl.name}</p>
            <p className="mt-1 text-xs text-muted">{tpl.description}</p>
            <span className="mt-3 inline-block text-xs font-medium uppercase tracking-widest text-accent">
              Use this template →
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
