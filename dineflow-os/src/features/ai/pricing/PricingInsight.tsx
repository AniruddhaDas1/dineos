import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Tag } from "lucide-react";
import { services } from "@/services";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cart.store";
import type { PricingResult } from "@/services/types";
import { formatCurrency } from "@/lib/format";

function demandLabel(level: PricingResult["demandLevel"]): string {
  if (level === "high") return "High demand";
  if (level === "medium") return "Moderate demand";
  return "Low demand";
}

function timeBasedTip(): string {
  const hour = new Date().getHours();
  if (hour >= 11 && hour <= 13) return "Lunch rush pricing is active";
  if (hour >= 18 && hour <= 20) return "Dinner rush pricing is active";
  if (hour >= 15 && hour <= 17) return "Happy hour savings available";
  return "Off-peak pricing — good time to order!";
}

export function PricingInsight() {
  const lines = useCartStore((s) => s.lines);
  const [results, setResults] = useState<PricingResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lines.length === 0) {
      setResults([]);
      return;
    }

    const loadPricing = async () => {
      setLoading(true);
      const now = new Date().toISOString();
      const priced = await Promise.all(
        lines.slice(0, 3).map((line) =>
          services.pricing.getDynamicPricing(line.itemId, now)
        )
      );
      setResults(priced);
      setLoading(false);
    };
    loadPricing();
  }, [lines]);

  if (lines.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-surface p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="h-4 w-4 text-accent" />
        <h4 className="font-serif text-sm">Smart Pricing Insight</h4>
        <Badge variant="outline" className="ml-auto text-xs">
          AI
        </Badge>
      </div>

      <p className="text-xs text-muted mb-3 flex items-center gap-1.5">
        <Clock className="h-3 w-3" />
        {timeBasedTip()}
      </p>

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {results.map((r) => (
            <motion.div
              key={r.itemId}
              className="flex items-center justify-between text-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="text-muted">{r.itemId}</span>
              <div className="flex items-center gap-2">
                <span className="text-muted line-through">
                  {formatCurrency(r.basePrice)}
                </span>
                <span className="font-medium text-accent">
                  {formatCurrency(r.dynamicPrice)}
                </span>
                <Badge
                  className={
                    r.demandLevel === "high"
                      ? "text-red-400 bg-red-500/10"
                      : r.demandLevel === "medium"
                        ? "text-amber-400 bg-amber-500/10"
                        : "text-green-400 bg-green-500/10"
                  }
                >
                  {demandLabel(r.demandLevel)}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
