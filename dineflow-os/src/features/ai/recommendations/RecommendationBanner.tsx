import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Plus } from "lucide-react";
import { useAIStore } from "@/stores/ai.store";
import { useSessionStore } from "@/stores/session.store";
import { useCartStore } from "@/stores/cart.store";
import { useOrderContext } from "@/lib/orderContext";
import { formatCurrency } from "@/lib/format";
import { VegMark } from "@/features/customer/components/VegMark";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { MenuItem } from "@/services/types";

export function RecommendationBanner() {
  const { recommendations, trending, loadingRecommendations, loadRecommendations, loadTrending } =
    useAIStore();
  const customer = useSessionStore((s) => s.customer);
  const addFromItem = useCartStore((s) => s.addFromItem);
  const navigate = useNavigate();
  const { base } = useOrderContext();

  useEffect(() => {
    if (customer?.mobile) {
      loadRecommendations(customer.mobile);
    } else {
      loadTrending();
    }
  }, [customer?.mobile, loadRecommendations, loadTrending]);

  const items = customer?.mobile ? recommendations : trending;

  function add(item: MenuItem) {
    const hasRequiredAddOns = item.addOnGroups?.some((g) => g.required);
    if (hasRequiredAddOns) {
      navigate(`${base}/item/${item.id}`);
      return;
    }
    addFromItem(item, 1, [], "");
  }

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
          {customer?.mobile ? "Recommended" : "Trending Now"}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {items.slice(0, 6).map((rec, i) => (
          <motion.div
            key={rec.item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(`${base}/item/${rec.item.id}`)}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-surface p-3 transition-shadow hover:shadow-md"
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

            <button
              aria-label={`Add ${rec.item.name} to cart`}
              disabled={!rec.item.available}
              onClick={(e) => {
                e.stopPropagation();
                add(rec.item);
              }}
              className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 disabled:opacity-30"
            >
              <Plus className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
