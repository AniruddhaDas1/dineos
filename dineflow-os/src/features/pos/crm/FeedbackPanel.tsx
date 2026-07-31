import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { services } from "@/services";
import { Skeleton } from "@/components/ui/skeleton";
import { SentimentDashboard } from "@/features/ai/sentiment/SentimentDashboard";
import { AlertBanner } from "@/features/ai/sentiment/AlertBanner";
import { FeedbackCard } from "@/features/ai/sentiment/FeedbackCard";
import type { Feedback } from "@/services/types";

type FeedbackWithCustomer = Feedback & { customerName?: string };

export function FeedbackPanel() {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState<FeedbackWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    services.customer.getFeedbacks().then((f) => {
      setFeedbacks(f);
      setLoading(false);
    });
  }, []);

  const avgRating = feedbacks.length
    ? feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length
    : 0;

  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-serif text-3xl">Feedback</h1>
      <p className="mt-1 text-sm text-muted">
        {feedbacks.length} review{feedbacks.length !== 1 ? "s" : ""}
        {feedbacks.length > 0 && (
          <>
            {" · "}
            Avg{" "}
            <span className="text-accent">{avgRating.toFixed(1)}</span> ★
          </>
        )}
      </p>

      {/* AI Urgent Feedback Alerts */}
      <div className="mt-6">
        <AlertBanner />
      </div>

      {/* AI Sentiment Dashboard */}
      <div className="mt-6">
        <SentimentDashboard />
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))
        ) : feedbacks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted">
            <MessageSquare className="mb-3 h-10 w-10 opacity-40" />
            <p>No feedback yet.</p>
          </div>
        ) : (
          feedbacks.map((f, i) => (
            <FeedbackCard
              key={`${f.orderId}-${i}`}
              feedback={f}
              onClick={() => navigate(`/pos/orders/${f.orderId}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}
