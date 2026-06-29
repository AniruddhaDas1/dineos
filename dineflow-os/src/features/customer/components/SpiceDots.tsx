import { Flame } from "lucide-react";

export function SpiceDots({ level }: { level: number }) {
  if (!level) return null;
  return (
    <span className="inline-flex items-center gap-0.5 text-danger">
      {Array.from({ length: level }).map((_, i) => (
        <Flame key={i} className="h-3 w-3" />
      ))}
    </span>
  );
}
