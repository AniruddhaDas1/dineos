import { Label } from "@/components/ui/label";
import { hexToHslTriplet, hslTripletToHex } from "@/lib/color";
import { applyWebsiteTheme, clearWebsiteTheme } from "@/lib/websiteTheme";
import type { WebsiteTheme } from "@/services/types";

interface ThemeEditorProps {
  theme: WebsiteTheme;
  onChange: (theme: WebsiteTheme) => void;
}

const FIELDS: { key: keyof WebsiteTheme; label: string }[] = [
  { key: "background", label: "Background" },
  { key: "surface", label: "Surface" },
  { key: "surface2", label: "Surface 2 (inputs)" },
  { key: "foreground", label: "Foreground (text)" },
  { key: "muted", label: "Muted text" },
  { key: "border", label: "Border" },
  { key: "accent", label: "Accent" },
  { key: "accentForeground", label: "Accent text" },
];

export function ThemeEditor({ theme, onChange }: ThemeEditorProps) {
  function handleColor(key: keyof WebsiteTheme, hex: string) {
    const next = { ...theme, [key]: hexToHslTriplet(hex) };
    onChange(next);
    applyWebsiteTheme(next);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Pick colors below. Changes preview live on the public site.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((f) => {
          const hex = hslTripletToHex(theme[f.key]);
          return (
            <div key={f.key} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-2 p-3">
              <div>
                <Label className="text-sm">{f.label}</Label>
                <p className="text-xs text-muted">{theme[f.key]}</p>
              </div>
              <input
                type="color"
                value={hex}
                onChange={(e) => handleColor(f.key, e.target.value)}
                className="h-10 w-12 cursor-pointer rounded border border-border bg-transparent"
                aria-label={f.label}
              />
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={clearWebsiteTheme}
        className="text-xs text-muted underline hover:text-foreground"
      >
        Reset preview to saved theme
      </button>
    </div>
  );
}
