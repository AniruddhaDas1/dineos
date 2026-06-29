import { cn } from "@/lib/cn";
import type { VegType } from "@/services/types";

export function VegMark({
  type,
  className,
}: {
  type: VegType;
  className?: string;
}) {
  const color =
    type === "veg"
      ? "border-success"
      : type === "egg"
        ? "border-accent"
        : "border-danger";
  const dot =
    type === "veg"
      ? "bg-success"
      : type === "egg"
        ? "bg-accent"
        : "bg-danger";
  return (
    <span
      className={cn(
        "inline-flex h-4 w-4 items-center justify-center rounded-sm border bg-background",
        color,
        className
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", dot)} />
    </span>
  );
}
