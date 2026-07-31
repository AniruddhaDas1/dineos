import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useWebsiteContent } from "./useWebsiteContent";

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < value
              ? "fill-accent text-accent"
              : "fill-transparent text-border"
          }`}
        />
      ))}
    </div>
  );
}

export function ReviewsSection() {
  const content = useWebsiteContent();
  const reviews = content?.reviews ?? [];

  return (
    <section id="reviews" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.25em] text-accent">
            Testimonials
          </p>
          <h2 className="mb-4 font-serif text-4xl md:text-5xl">
            What Our Guests Say
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {reviews.map((review, i) => (
            <motion.blockquote
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-surface p-8"
            >
              <StarRating value={review.rating} />
              <p className="mt-4 text-muted leading-relaxed italic">
                "{review.text}"
              </p>
              <footer className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-sm font-medium text-accent">
                  {review.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="font-medium">{review.name}</p>
                  <p className="text-xs text-muted">
                    {new Date(review.date).toLocaleDateString("en-IN", {
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
