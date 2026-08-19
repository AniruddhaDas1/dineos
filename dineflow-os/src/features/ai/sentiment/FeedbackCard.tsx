import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Tag } from "lucide-react";
import { services } from "@/services";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import type { Feedback, SentimentResult } from "@/services/types";

interface FeedbackCardProps {
  feedback: Feedback & { customerName?: string };
  onClick?: () => void;
}

const SENTIMENT_COLORS = {
  positive: "border-green-500/30 bg-green-500/5",
  neutral: "border-orange-500/30 bg-orange-500/5",
  negative: "border-red-500/30 bg-red-500/5",
};

const SENTIMENT_LABEL = {
  positive: "Positive",
  neutral: "Neutral",
  negative: "Negative",
};

export function FeedbackCard({ feedback, onClick }: FeedbackCardProps) {
  const [sentiment, setSentiment] = useState<SentimentResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const analyze = async () => {
      const result = await services.sentiment.analyzeSentiment(
        feedback.review || "",
        feedback.rating
      );
      setSentiment(result);
      setLoading(false);
    };
    analyze();
  }, [feedback]);

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-full mb-1" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    );
  }

  const label = sentiment ? sentiment.label : "neutral";

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={cn(
        "block w-full rounded-xl border p-4 text-left transition-colors hover:bg-surface-2",
        SENTIMENT_COLORS[label]
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-medium text-sm">
              {feedback.customerName || "Anonymous"}
            </span>
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                label === "positive"
                  ? "text-green-400 border-green-400/30"
                  : label === "negative"
                    ? "text-red-400 border-red-400/30"
                    : "text-orange-400 border-orange-400/30"
              )}
            >
              {SENTIMENT_LABEL[label]}
            </Badge>
            {sentiment && (
              <span className="text-xs text-muted">
                {(sentiment.score * 100).toFixed(0)}%
              </span>
            )}
          </div>

          {feedback.review && (
            <p className="text-sm text-foreground mt-1 line-clamp-2">
              "{feedback.review}"
            </p>
          )}

          {sentiment && sentiment.topics.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {sentiment.topics.map((topic) => (
                <Badge
                  key={topic}
                  variant="outline"
                  className="text-xs flex items-center gap-1"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {topic}
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-1.5 flex items-center gap-3 text-xs text-muted">
            <div className="flex items-center gap-1">
              <span>Order #{feedback.orderId.slice(-5)}</span>
            </div>
            <span>
              {new Date(feedback.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Star
              key={idx}
              className={cn(
                "h-3 w-3",
                idx < feedback.rating
                  ? "fill-accent text-accent"
                  : "text-border"
              )}
            />
          ))}
        </div>
      </div>
    </motion.button>
  );
}
