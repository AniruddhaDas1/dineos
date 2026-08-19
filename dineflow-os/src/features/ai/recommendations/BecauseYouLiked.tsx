import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Star, Plus } from "lucide-react";
import { useAIStore } from "@/stores/ai.store";
import { useSessionStore } from "@/stores/session.store";
import { useCartStore } from "@/stores/cart.store";
import { useOrderContext } from "@/lib/orderContext";
import { services } from "@/services";
import { Skeleton } from "@/components/ui/skeleton";
import { VegMark } from "@/features/customer/components/VegMark";
import { formatCurrency } from "@/lib/format";
import type { MenuItem } from "@/services/types";

export function BecauseYouLiked() {
  const { recommendations, loadingRecommendations } = useAIStore();
  const customer = useSessionStore((s) => s.customer);
  const addFromItem = useCartStore((s) => s.addFromItem);
  const navigate = useNavigate();
  const { base } = useOrderContext();
  const [lastItem, setLastItem] = useState<string | null>(null);

  useEffect(() => {
    if (!customer?.mobile) return;
    services.customer.getHistory(customer).then((orders) => {
      const lastOrder = orders[0];
      if (lastOrder?.lines?.[0]) {
        setLastItem(lastOrder.lines[0].name);
      }
    });
  }, [customer?.mobile]);

  function add(item: MenuItem) {
    const hasRequiredAddOns = item.addOnGroups?.some((g) => g.required);
    if (hasRequiredAddOns) {
      navigate(`${base}/item/${item.id}`);
      return;
    }
    addFromItem(item, 1, [], "");
  }

  if (!customer?.mobile) return null;
  if (loadingRecommendations && recommendations.length === 0) {
    return (
      <div className="mb-6">
        <Skeleton className="h-5 w-48 mb-4" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-accent" />
        <h3 className="font-serif text-lg">
          {lastItem ? `Because you liked ${lastItem}` : "Recommended for You"}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {recommendations.slice(0, 3).map((rec, i) => (
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
                className="h-12 w-12 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <VegMark type={rec.item.vegType} />
                  <p className="font-medium text-sm truncate">{rec.item.name}</p>
                </div>
                <p className="text-xs text-muted mt-0.5">
                  {rec.reason}
                </p>
                <p className="font-serif text-sm text-accent mt-1">
                  {formatCurrency(rec.item.price)}
                </p>
              </div>
            </div>
            {rec.item.rating && (
              <div className="absolute top-2 right-2 bg-surface-2 rounded-full px-1.5 py-0.5 flex items-center gap-0.5 text-xs text-muted">
                <Star className="h-3 w-3 fill-accent text-accent" />
                {rec.item.rating.toFixed(1)}
              </div>
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
