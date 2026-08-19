import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Clock } from "lucide-react";
import { services } from "@/services";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import type { Feedback } from "@/services/types";

interface UrgentFeedback extends Feedback {
  customerName?: string;
  sentimentScore: number;
  topics: string[];
}

function getUrgencyColor(score: number): string {
  if (score < -0.5) return "border-red-500 bg-danger/5";
  if (score < -0.2) return "border-orange-500 bg-orange-500/5";
  return "border-yellow-500 bg-yellow-500/5";
}

export function AlertBanner() {
  const [alerts, setAlerts] = useState<UrgentFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadAlerts = async () => {
      const feedbacks = await services.customer.getFeedbacks();
      const urgent: UrgentFeedback[] = [];

      for (const f of feedbacks) {
        const sentiment = await services.sentiment.analyzeSentiment(
          f.review || "",
          f.rating
        );
        if (sentiment.score < -0.2) {
          urgent.push({
            ...f,
            customerName: f.customerName,
            sentimentScore: sentiment.score,
            topics: sentiment.topics,
          });
        }
      }

      setAlerts(
        urgent
          .sort((a, b) => a.sentimentScore - b.sentimentScore)
          .slice(0, 3)
      );
      setLoading(false);
    };

    loadAlerts();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4">
        <Skeleton className="h-5 w-40 mb-2" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  const visible = alerts.filter((a) => !dismissed.has(a.orderId));

  if (visible.length === 0) return null;

  return (
    <AnimatePresence>
      {visible.map((alert) => (
        <motion.div
          key={alert.orderId}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          className={cn(
            "rounded-xl border p-4 mb-3",
            getUrgencyColor(alert.sentimentScore)
          )}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-danger mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="outline" className="text-xs text-danger border-danger/30">
                  Urgent
                </Badge>
                <span className="text-xs text-muted">
                  Score: {(alert.sentimentScore * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-sm font-medium truncate">
                {alert.customerName || "Customer"} — Order #{alert.orderId.slice(-5)}
              </p>
              {alert.review && (
                <p className="text-sm text-foreground mt-1 line-clamp-2">
                  "{alert.review}"
                </p>
              )}
              <div className="mt-1.5 flex flex-wrap gap-1">
                {alert.topics.map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted mt-1.5 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Needs follow-up
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => setDismissed((d) => d.add(alert.orderId))}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
