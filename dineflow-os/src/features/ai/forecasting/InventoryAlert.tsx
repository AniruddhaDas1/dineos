import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Package, TrendingDown } from "lucide-react";
import { services } from "@/services";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { menuItems } from "@/data/menu";
import type { InventoryPrediction } from "@/services/types";

interface AlertItem {
  id: string;
  name: string;
  prediction: InventoryPrediction;
}

export function InventoryAlert() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAlerts = async () => {
      setLoading(true);
      const results: AlertItem[] = [];

      for (const item of menuItems.slice(0, 8)) {
        const pred = await services.forecast.getInventoryForecast(item.id);
        if (pred.reorderSuggested || pred.daysUntilStockout <= 2) {
          results.push({
            id: item.id,
            name: item.name,
            prediction: pred,
          });
        }
      }

      setAlerts(
        results.sort((a, b) => a.prediction.daysUntilStockout - b.prediction.daysUntilStockout)
      );
      setLoading(false);
    };

    loadAlerts();
  }, []);

  if (loading && alerts.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-5">
        <Skeleton className="h-5 w-44 mb-4" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center gap-2 text-green-500">
          <Package className="h-5 w-5" />
          <span className="text-sm font-medium">All ingredients well stocked</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h3 className="font-serif text-lg text-destructive">
            Low Stock Alerts
          </h3>
        </div>
        <Badge variant="outline" className="text-xs text-destructive border-destructive/30">
          {alerts.length} alert{alerts.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      <div className="space-y-3">
        {alerts.slice(0, 5).map((alert, i) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between rounded-lg bg-surface p-3"
          >
            <div className="flex items-center gap-3">
              <TrendingDown className="h-4 w-4 text-destructive" />
              <div>
                <p className="font-medium text-sm">{alert.name}</p>
                <p className="text-xs text-muted">
                  {alert.prediction.currentStock} items left ·{" "}
                  {alert.prediction.daysUntilStockout} day
                  {alert.prediction.daysUntilStockout !== 1 ? "s" : ""} until stockout
                </p>
              </div>
            </div>
            {alert.prediction.reorderSuggested && (
              <Button size="sm" variant="outline" className="text-xs h-7">
                Reorder
              </Button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
