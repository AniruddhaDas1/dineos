import { useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Clock } from "lucide-react";
import { useAIStore } from "@/stores/ai.store";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatHour } from "@/lib/format";

function getHourColor(predicted: number, max: number): string {
  const ratio = predicted / max;
  if (ratio > 0.8) return "bg-red-500";
  if (ratio > 0.6) return "bg-orange-500";
  if (ratio > 0.4) return "bg-amber-500";
  return "bg-green-500";
}

export function PeakHoursIndicator() {
  const { hourlyForecast, loadingForecast, loadHourlyForecast } = useAIStore();

  useEffect(() => {
    if (hourlyForecast.length === 0) {
      const today = new Date().toISOString().split("T")[0];
      loadHourlyForecast(today);
    }
  }, [hourlyForecast.length, loadHourlyForecast]);

  if (loadingForecast && hourlyForecast.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-5">
        <Skeleton className="h-5 w-40 mb-4" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-12 rounded" />
          ))}
        </div>
      </div>
    );
  }

  const maxDemand = Math.max(...hourlyForecast.map((h) => h.predicted), 1);
  const currentHour = new Date().getHours();

  // Peak = top 3 hours by predicted demand
  const sorted = [...hourlyForecast].sort((a, b) => b.predicted - a.predicted);
  const peakHours = sorted.slice(0, 3).sort((a, b) => a.hour - b.hour);
  const nextPeak = peakHours.find((h) => h.hour > currentHour) ?? peakHours[0];

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-accent" />
          <h3 className="font-serif text-lg">Peak Hours Forecast</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          Today
        </Badge>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="text-center">
          <p className="font-serif text-2xl text-accent">
            {formatHour(nextPeak.hour)}
          </p>
          <p className="text-xs text-muted">Next peak</p>
        </div>
        <div className="text-center">
          <p className="font-serif text-2xl">
            {peakHours[0].predicted}
          </p>
          <p className="text-xs text-muted">Busiest hour</p>
        </div>
      </div>

      <div className="flex items-end gap-1 h-24">
        {hourlyForecast
          .filter((h) => h.hour >= 8 && h.hour <= 22)
          .map((h) => {
            const height = (h.predicted / maxDemand) * 100;
            const isNow = h.hour === currentHour;
            return (
              <div key={h.hour} className="flex flex-col items-center flex-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: h.hour * 0.02, duration: 0.3 }}
                  className={`w-full rounded-t-sm ${getHourColor(h.predicted, maxDemand)} ${
                    isNow ? "ring-2 ring-white ring-offset-2 ring-offset-background" : ""
                  }`}
                  title={`${formatHour(h.hour)}: ${h.predicted} orders (${Math.round(h.confidence * 100)}% confidence)`}
                />
                <span className="mt-1 text-[8px] text-muted">
                  {h.hour}:00
                </span>
              </div>
            );
          })}
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-muted">
        <Clock className="h-3 w-3" />
        <span>
          Peak hours: {peakHours.map((p) => formatHour(p.hour)).join(", ")}
        </span>
        <Badge className="text-xs bg-accent/10 text-accent">
          Busy up ahead
        </Badge>
      </div>
    </div>
  );
}
