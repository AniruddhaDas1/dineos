import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, Plus } from "lucide-react";
import { useAIStore } from "@/stores/ai.store";
import { useCartStore } from "@/stores/cart.store";
import { useOrderContext } from "@/lib/orderContext";
import { Skeleton } from "@/components/ui/skeleton";
import { VegMark } from "@/features/customer/components/VegMark";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import type { MenuItem } from "@/services/types";

export function TrendingNow() {
  const { trending, loadingRecommendations, loadTrending } = useAIStore();
  const addFromItem = useCartStore((s) => s.addFromItem);
  const navigate = useNavigate();
  const { base } = useOrderContext();

  useEffect(() => {
    if (trending.length === 0) {
      loadTrending();
    }
  }, [trending.length, loadTrending]);

  function add(item: MenuItem) {
    const hasRequiredAddOns = item.addOnGroups?.some((g) => g.required);
    if (hasRequiredAddOns) {
      navigate(`${base}/item/${item.id}`);
      return;
    }
    addFromItem(item, 1, [], "");
  }

  if (loadingRecommendations && trending.length === 0) {
    return (
      <div className="mb-6">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-18 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (trending.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-accent" />
        <h3 className="font-serif text-lg">Trending Now</h3>
        <Badge variant="outline" className="text-xs">
          {trending.length} dishes
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {trending.slice(0, 4).map((rec, i) => (
          <motion.div
            key={rec.item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(`${base}/item/${rec.item.id}`)}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-surface p-3 text-center transition-shadow hover:shadow-md"
          >
            <div className="relative mx-auto mb-2 h-14 w-14">
              <img
                src={rec.item.image}
                alt={rec.item.name}
                className="h-full w-full rounded-lg object-cover"
              />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0">
                <TrendingUp className="h-3 w-3" />
              </Badge>
            </div>
            <p className="font-medium text-sm truncate">{rec.item.name}</p>
            <div className="mt-1 flex items-center justify-center gap-1.5">
              <VegMark type={rec.item.vegType} />
              <span className="font-serif text-sm text-accent">
                {formatCurrency(rec.item.price)}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-muted">{rec.reason}</p>

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
