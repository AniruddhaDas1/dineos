import type { LoyaltyTier } from "@/services/types";
import {
  nextTierThreshold,
  prevTierThreshold,
} from "@/services/mock/mockCustomerService";
import { cn } from "@/lib/cn";

const TIER_STYLES: Record<LoyaltyTier, string> = {
  bronze: "text-amber-600",
  silver: "text-gray-300",
  gold: "text-accent",
  platinum: "text-purple-400",
};

const TIER_GRADIENTS: Record<LoyaltyTier, string> = {
  bronze: "from-amber-900/30 to-amber-700/10",
  silver: "from-gray-600/30 to-gray-400/10",
  gold: "from-accent/30 to-accent/5",
  platinum: "from-purple-700/30 to-purple-400/10",
};

interface LoyaltyCardProps {
  tier: LoyaltyTier;
  points: number;
  compact?: boolean;
}

export function LoyaltyCard({ tier, points, compact }: LoyaltyCardProps) {
  const lower = prevTierThreshold(tier);
  const upper = nextTierThreshold(tier);
  const isMaxTier = tier === "platinum";
  const progress = isMaxTier
    ? 100
    : Math.min(100, ((points - lower) / (upper - lower)) * 100);

  const pointsToNext = isMaxTier ? 0 : Math.max(0, upper - points);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br p-5",
        TIER_GRADIENTS[tier]
      )}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted">
              Loyalty Tier
            </p>
            <p
              className={cn(
                "mt-1 font-serif text-2xl capitalize",
                TIER_STYLES[tier]
              )}
            >
              {tier}
            </p>
          </div>
          <div className="text-right">
            <p className={cn("font-serif text-3xl", TIER_STYLES[tier])}>
              {points}
            </p>
            <p className="text-xs text-muted">points</p>
          </div>
        </div>

        {!compact && (
          <div className="mt-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className={cn("h-full rounded-full", TIER_STYLES[tier].replace("text-", "bg-"))}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted">
              {isMaxTier ? (
                "Maximum tier reached 🎉"
              ) : (
                <>
                  {pointsToNext} points to{" "}
                  <span className="capitalize">
                    {tier === "bronze"
                      ? "silver"
                      : tier === "silver"
                        ? "gold"
                        : "platinum"}
                  </span>
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
