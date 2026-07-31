import type { CartLine } from "@/services/types";
import { VegMark } from "@/features/customer/components/VegMark";

interface KdsItemRowProps {
  line: CartLine;
}

export function KdsItemRow({ line }: KdsItemRowProps) {
  return (
    <div className="flex items-start gap-2">
      <VegMark type={
        line.name.toLowerCase().includes("chicken") ||
        line.name.toLowerCase().includes("tandoori")
          ? "non-veg"
          : "veg"
      } />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-bold text-accent">{line.quantity}×</span>
          <span className="text-sm">{line.name}</span>
        </div>
        {line.selectedAddOns.length > 0 && (
          <div className="mt-0.5 flex flex-wrap gap-1">
            {line.selectedAddOns.map((a) => (
              <span
                key={a.id}
                className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted"
              >
                +{a.name}
              </span>
            ))}
          </div>
        )}
        {line.instructions && (
          <p className="mt-0.5 text-xs italic text-accent">
            ⚑ {line.instructions}
          </p>
        )}
      </div>
    </div>
  );
}
