import { useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, TrendingUp, MessageSquare } from "lucide-react";
import { useAIStore } from "@/stores/ai.store";
import { Skeleton } from "@/components/ui/skeleton";

function getSentimentColor(score: number): string {
  if (score > 0.6) return "text-green-500";
  if (score > 0.3) return "text-yellow-500";
  if (score > -0.3) return "text-muted";
  return "text-red-500";
}

function getSentimentLabel(score: number): string {
  if (score > 0.6) return "Very Positive";
  if (score > 0.3) return "Positive";
  if (score > -0.3) return "Neutral";
  if (score > -0.6) return "Negative";
  return "Very Negative";
}

export function SentimentDashboard() {
  const {
    sentimentTrend,
    topTopics,
    loadingSentiment,
    loadSentimentTrend,
    loadTopTopics,
  } = useAIStore();

  useEffect(() => {
    const end = new Date().toISOString().split("T")[0];
    const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    loadSentimentTrend(start, end);
    loadTopTopics();
  }, [loadSentimentTrend, loadTopTopics]);

  if (loadingSentiment) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  const avgSentiment =
    sentimentTrend.length > 0
      ? sentimentTrend.reduce((sum, t) => sum + t.avgScore, 0) /
        sentimentTrend.length
      : 0;

  const totalReviews = sentimentTrend.reduce((sum, t) => sum + t.count, 0);

  return (
    <div className="space-y-6">
      {/* Overall sentiment */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="h-5 w-5 text-accent" />
          <h3 className="font-serif text-lg">Customer Sentiment</h3>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className={`font-serif text-3xl ${getSentimentColor(avgSentiment)}`}>
              {(avgSentiment * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-muted mt-1">
              {getSentimentLabel(avgSentiment)}
            </p>
          </div>

          <div className="text-center">
            <p className="font-serif text-3xl">{totalReviews}</p>
            <p className="text-xs text-muted mt-1">Total Reviews</p>
          </div>

          <div className="text-center">
            <p className="font-serif text-3xl text-green-500">
              {sentimentTrend.filter((t) => t.avgScore > 0.5).length}
            </p>
            <p className="text-xs text-muted mt-1">Positive Days</p>
          </div>
        </div>
      </div>

      {/* Trend chart */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-accent" />
          <h3 className="font-serif text-lg">7-Day Trend</h3>
        </div>

        <div className="flex items-end gap-2 h-32">
          {sentimentTrend.map((day, i) => {
            const height = ((day.avgScore + 1) / 2) * 100; // Map -1..1 to 0..100
            return (
              <motion.div
                key={day.date}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="flex-1 rounded-t bg-accent/60"
                title={`${day.date}: ${(day.avgScore * 100).toFixed(0)}% (${day.count} reviews)`}
              />
            );
          })}
        </div>

        <div className="flex justify-between mt-2 text-[10px] text-muted">
          <span>{sentimentTrend[0]?.date}</span>
          <span>{sentimentTrend[sentimentTrend.length - 1]?.date}</span>
        </div>
      </div>

      {/* Top topics */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5 text-accent" />
          <h3 className="font-serif text-lg">Top Discussion Topics</h3>
        </div>

        <div className="space-y-3">
          {topTopics.map((topic, i) => (
            <div key={topic.topic} className="flex items-center gap-3">
              <span className="w-20 text-sm capitalize">{topic.topic}</span>
              <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(topic.count / (topTopics[0]?.count || 1)) * 100}%`,
                  }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="h-full bg-accent rounded-full"
                />
              </div>
              <span className="text-xs text-muted w-8 text-right">
                {topic.count}
              </span>
              <span
                className={`text-xs w-16 text-right ${getSentimentColor(topic.avgSentiment)}`}
              >
                {(topic.avgSentiment * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
