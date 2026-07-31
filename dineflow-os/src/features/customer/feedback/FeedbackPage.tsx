import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Star } from "lucide-react";
import { useFeedbackStore } from "@/stores/feedback.store";
import { TopBar } from "../components/TopBar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/cn";

export function FeedbackPage() {
  const { tableId = "", orderId = "" } = useParams();
  const navigate = useNavigate();
  const submit = useFeedbackStore((s) => s.submit);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [done, setDone] = useState(false);

  async function send() {
    await submit({
      orderId,
      rating,
      review: review || undefined,
      createdAt: Date.now(),
    });
    setDone(true);
  }

  return (
    <div className="p-5">
      <TopBar title="Feedback" />
      <div className="mt-6 text-center">
        {done ? (
          <>
            <p className="font-serif text-2xl">Thank you!</p>
            <p className="mt-2 text-sm text-muted">
              We can't wait to serve you again.
            </p>
            <Button
              className="mt-6"
              onClick={() => navigate(`/order/table/${tableId}`)}
            >
              Back to table
            </Button>
          </>
        ) : (
          <>
            <p className="font-serif text-2xl">How was your meal?</p>
            <div className="mt-5 flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(n)}
                >
                  <Star
                    className={cn(
                      "h-9 w-9 transition-colors",
                      (hover || rating) >= n
                        ? "fill-accent text-accent"
                        : "text-muted"
                    )}
                  />
                </button>
              ))}
            </div>
            <Textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Tell us more (optional)"
              className="mt-6 text-left"
            />
            <Button
              className="mt-4 w-full"
              size="lg"
              disabled={rating === 0}
              onClick={send}
            >
              Submit
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
