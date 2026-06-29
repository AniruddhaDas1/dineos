import { Star } from "lucide-react";

export function Rating({ value }: { value?: number }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted">
      <Star className="h-3 w-3 fill-accent text-accent" /> {value.toFixed(1)}
    </span>
  );
}
