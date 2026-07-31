import type { OrderChannel } from "@/services/types";
import { UtensilsCrossed, ShoppingBag, Bike } from "lucide-react";
import { cn } from "@/lib/cn";

const CONFIG: Record<
  OrderChannel,
  { label: string; icon: React.ReactNode; className: string }
> = {
  "dine-in": {
    label: "Dine-in",
    icon: <UtensilsCrossed className="h-3 w-3" />,
    className: "bg-foreground/10 text-foreground",
  },
  pickup: {
    label: "Pickup",
    icon: <ShoppingBag className="h-3 w-3" />,
    className: "bg-blue-500/15 text-blue-400",
  },
  delivery: {
    label: "Delivery",
    icon: <Bike className="h-3 w-3" />,
    className: "bg-green-500/15 text-green-400",
  },
};

export function ChannelBadge({ channel }: { channel?: OrderChannel }) {
  if (!channel || channel === "dine-in") return null;
  const c = CONFIG[channel];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        c.className
      )}
    >
      {c.icon}
      {c.label}
    </span>
  );
}
