import { Pencil, Trash2, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { hslTripletToHex } from "@/lib/color";
import type { WebsiteConfig } from "@/services/types";

interface SavedWebsitesProps {
  configs: WebsiteConfig[];
  activeId: string | null;
  onSetActive: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SavedWebsites({ configs, activeId, onSetActive, onEdit, onDelete }: SavedWebsitesProps) {
  if (configs.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted">
        No saved websites yet. Pick a template above to start building.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {configs.map((cfg) => {
        const isActive = cfg.id === activeId;
        return (
          <div
            key={cfg.id}
            className={cn(
              "flex items-center justify-between rounded-xl border p-4 transition-colors",
              isActive ? "border-accent/50 bg-accent/5" : "border-border bg-surface"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-lg border border-border"
                style={{ backgroundColor: hslTripletToHex(cfg.theme.accent) }}
              />
              <div>
                <p className="font-medium">{cfg.label}</p>
                <p className="text-xs text-muted">{cfg.content.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isActive ? (
                <span className="flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent">
                  <Star className="h-3 w-3" /> Live
                </span>
              ) : (
                <Button size="sm" variant="outline" className="gap-1" onClick={() => onSetActive(cfg.id)}>
                  <Check className="h-3 w-3" /> Set Active
                </Button>
              )}
              <Button size="sm" variant="ghost" className="h-8 w-8" onClick={() => onEdit(cfg.id)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="h-8 w-8 text-danger hover:text-danger" onClick={() => onDelete(cfg.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
