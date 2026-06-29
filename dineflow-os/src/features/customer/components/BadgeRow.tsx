import { Badge } from "@/components/ui/badge";
import type { Badge as B } from "@/services/types";

const LABELS: Record<B, string> = {
  bestseller: "Bestseller",
  "chef-recommendation": "Chef's Pick",
  popular: "Popular",
  new: "New",
};

export function BadgeRow({ badges }: { badges?: B[] }) {
  if (!badges?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((b) => (
        <Badge key={b} variant={b === "new" ? "success" : "default"}>
          {LABELS[b]}
        </Badge>
      ))}
    </div>
  );
}
