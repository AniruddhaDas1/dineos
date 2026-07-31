import { useEffect } from "react";
import { motion } from "framer-motion";
import { Gift, Star, Crown } from "lucide-react";
import { useAIStore } from "@/stores/ai.store";
import { useSessionStore } from "@/stores/session.store";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";

export function LoyaltyReward() {
  const { rewards, loadingOffers, loadRewards } = useAIStore();
  const customer = useSessionStore((s) => s.customer);

  useEffect(() => {
    if (customer?.mobile && rewards.length === 0) {
      loadRewards(customer.mobile);
    }
  }, [customer?.mobile, rewards.length, loadRewards]);

  if (!customer?.mobile) return null;

  if (loadingOffers && rewards.length === 0) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (rewards.length === 0) return null;

  return (
    <div className="rounded-xl border border-accent/30 bg-accent/5 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Crown className="h-5 w-5 text-accent" />
        <h3 className="font-serif text-lg">AI Rewards</h3>
        <Badge variant="outline" className="ml-auto text-xs text-accent border-accent/30">
          Personalized
        </Badge>
      </div>

      <div className="space-y-3">
        {rewards.slice(0, 3).map((reward, i) => (
          <motion.div
            key={reward.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center justify-between rounded-lg bg-surface p-3"
          >
            <div className="flex items-center gap-3">
              <Gift className="h-4 w-4 text-accent" />
              <div>
                <p className="font-medium text-sm">{reward.title}</p>
                <p className="text-xs text-muted">{reward.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-serif text-lg text-accent">
                {formatCurrency(reward.discountValue)}
              </p>
              <p className="text-xs text-muted">
                {reward.pointsRequired} pts
              </p>
              <Button size="sm" variant="ghost" className="h-6 text-xs mt-1">
                Redeem
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="mt-3 text-xs text-muted">
        <Star className="inline h-3 w-3 text-accent" /> You have 0 points — order more to unlock rewards!
      </p>
    </div>
  );
}
