import { useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp } from "lucide-react";
import { useAIStore } from "@/stores/ai.store";
import { useSessionStore } from "@/stores/session.store";
import { formatCurrency } from "@/lib/format";
import { VegMark } from "@/features/customer/components/VegMark";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function RecommendationBanner() {
  const { recommendations, trending, loadingRecommendations, loadRecommendations, loadTrending } =
    useAIStore();
  const customer = useSessionStore((s) => s.customer);

  useEffect(() => {
    if (customer?.mobile) {
      loadRecommendations(customer.mobile);
    } else {
      loadTrending();
    }
  }, [customer?.mobile, loadRecommendations, loadTrending]);

  const items = customer?.mobile ? recommendations : trending;

  if (loadingRecommendations) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        {customer?.mobile ? (
          <Sparkles className="h-5 w-5 text-accent" />
        ) : (
          <TrendingUp className="h-5 w-5 text-accent" />
        )}
        <h3 className="font-serif text-lg">
          {customer?.mobile ? "Recommended for You" : "Trending Now"}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {items.slice(0, 6).map((rec, i) => (
          <motion.div
            key={rec.item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group relative overflow-hidden rounded-xl border border-border bg-surface p-3 transition-shadow hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <img
                src={rec.item.image}
                alt={rec.item.name}
                className="h-14 w-14 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <VegMark type={rec.item.vegType} />
                  <p className="font-medium text-sm truncate">{rec.item.name}</p>
                </div>
                <p className="text-xs text-muted mt-0.5">{rec.reason}</p>
                <p className="font-serif text-sm text-accent mt-1">
                  {formatCurrency(rec.item.price)}
                </p>
              </div>
            </div>

            {rec.item.badges?.[0] && (
              <Badge
                variant="outline"
                className="absolute top-2 right-2 text-[10px] px-1.5 py-0"
              >
                {rec.item.badges[0]}
              </Badge>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
