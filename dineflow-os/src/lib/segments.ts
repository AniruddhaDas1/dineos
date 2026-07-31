import type { CustomerProfile, Segment } from "@/services/types";

const DAY = 86_400_000;

/**
 * Segments a customer based on their profile data.
 *
 * Priority order (first match wins):
 * 1. churned — last visit > 90 days ago
 * 2. at-risk — last visit > 30 days ago
 * 3. vip — tier is gold or platinum
 * 4. new — fewer than 2 visits
 * 5. regular — everything else
 */
export function segmentCustomer(profile: CustomerProfile): Segment {
  const daysSinceVisit =
    profile.lastVisit > 0
      ? (Date.now() - profile.lastVisit) / DAY
      : Infinity;

  if (daysSinceVisit > 90) return "churned";
  if (daysSinceVisit > 30) return "at-risk";
  if (profile.tier === "gold" || profile.tier === "platinum") return "vip";
  if (profile.visits < 2) return "new";
  return "regular";
}

export const SEGMENT_CONFIG: Record<
  Segment,
  { label: string; className: string }
> = {
  vip: { label: "VIP", className: "bg-amber-500/15 text-amber-400" },
  regular: {
    label: "Regular",
    className: "bg-foreground/10 text-foreground",
  },
  new: { label: "New", className: "bg-blue-500/15 text-blue-400" },
  "at-risk": { label: "At Risk", className: "bg-orange-500/15 text-orange-400" },
  churned: { label: "Churned", className: "bg-red-500/15 text-red-400" },
};
