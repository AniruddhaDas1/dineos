import { useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Clock } from "lucide-react";
import { useAIStore } from "@/stores/ai.store";
import { Skeleton } from "@/components/ui/skeleton";

export function DemandChart() {
  const { hourlyForecast, loadingForecast, loadHourlyForecast } = useAIStore();

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    loadHourlyForecast(today);
  }, [loadHourlyForecast]);

  if (loadingForecast) {
    return (
      <div className="rounded-xl border border-border bg-surface p-5">
        <Skeleton className="h-5 w-40 mb-4" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  const maxDemand = Math.max(...hourlyForecast.map((h) => h.predicted), 1);
  const currentHour = new Date().getHours();

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-accent" />
          <h3 className="font-serif text-lg">Demand Forecast</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <Clock className="h-3.5 w-3.5" />
          <span>Today</span>
        </div>
      </div>

      {/* Simple bar chart */}
      <div className="flex items-end gap-1 h-40">
        {hourlyForecast
          .filter((h) => h.hour >= 8 && h.hour <= 22)
          .map((h) => {
            const height = (h.predicted / maxDemand) * 100;
            const isNow = h.hour === currentHour;
            const isPast = h.hour < currentHour;

            return (
              <motion.div
                key={h.hour}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: h.hour * 0.02, duration: 0.3 }}
                className={`flex-1 rounded-t ${
                  isNow
                    ? "bg-accent"
                    : isPast
                      ? "bg-muted/30"
                      : "bg-accent/40"
                }`}
                title={`${h.hour}:00 - ${h.predicted} orders`}
              />
            );
          })}
      </div>

      {/* Hour labels */}
      <div className="flex gap-1 mt-2">
        {hourlyForecast
          .filter((h) => h.hour >= 8 && h.hour <= 22)
          .filter((h) => h.hour % 3 === 0)
          .map((h) => (
            <div
              key={h.hour}
              className="text-[10px] text-muted"
              style={{ marginLeft: h.hour === 9 ? 0 : "auto" }}
            >
              {h.hour}:00
            </div>
          ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-muted">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-accent" />
          <span>Now</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-accent/40" />
          <span>Predicted</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-muted/30" />
          <span>Past</span>
        </div>
      </div>
    </div>
  );
}
