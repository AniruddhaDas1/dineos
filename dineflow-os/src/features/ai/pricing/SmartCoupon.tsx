import { useEffect } from "react";
import { motion } from "framer-motion";
import { Gift, Tag, Clock } from "lucide-react";
import { useAIStore } from "@/stores/ai.store";
import { useSessionStore } from "@/stores/session.store";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function SmartCoupon() {
  const { offers, loadingOffers, loadOffers } = useAIStore();
  const customer = useSessionStore((s) => s.customer);

  useEffect(() => {
    if (customer?.mobile) {
      loadOffers(customer.mobile);
    }
  }, [customer?.mobile, loadOffers]);

  if (loadingOffers) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if (offers.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Gift className="h-5 w-5 text-accent" />
        <h3 className="font-serif text-lg">Special Offers</h3>
      </div>

      {offers.map((offer, i) => (
        <motion.div
          key={offer.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="relative overflow-hidden rounded-xl border border-accent/30 bg-accent/5 p-4"
        >
          {/* Dashed border effect */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Tag className="h-4 w-4 text-accent" />
                <span className="font-medium">{offer.title}</span>
              </div>
              <p className="text-sm text-muted mb-2">{offer.description}</p>

              <div className="flex items-center gap-3 text-xs text-muted">
                {offer.minOrder > 0 && (
                  <span>Min. order: ₹{offer.minOrder}</span>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    Expires{" "}
                    {new Date(offer.validUntil).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="font-serif text-2xl text-accent">
                {offer.discountType === "percent"
                  ? `${offer.discountValue}%`
                  : `₹${offer.discountValue}`}
              </p>
              <p className="text-xs text-muted">OFF</p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <code className="text-xs bg-surface px-2 py-1 rounded font-mono">
              {offer.code}
            </code>
            <Button variant="outline" size="sm" className="text-xs h-7">
              Copy Code
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
