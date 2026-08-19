import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCheck, MousePointerClick, Eye } from "lucide-react";
import { services } from "@/services";
import { Skeleton } from "@/components/ui/skeleton";
import type { MarketingAnalytics } from "@/services/types";

const CHANNELS = [
  { key: "whatsapp" as const, label: "WhatsApp", color: "bg-green-500" },
  { key: "sms" as const, label: "SMS", color: "bg-blue-500" },
  { key: "email" as const, label: "Email", color: "bg-amber-500" },
];

export function AnalyticsDashboard() {
  const [data, setData] = useState<MarketingAnalytics | null>(null);

  useEffect(() => {
    services.marketing.getAnalytics().then(setData);
  }, []);

  if (!data) {
    return <Skeleton className="h-64 rounded-xl" />;
  }

  const { totals, byChannel, timeSeries } = data;
  const maxChannel = Math.max(
    ...CHANNELS.map((c) => byChannel[c.key].sent),
    1
  );
  const maxSeries = Math.max(...timeSeries.map((d) => Math.max(d.sent, d.opened, d.clicked)), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard icon={<Send className="h-4 w-4" />} label="Sent" value={String(totals.sent)} />
        <KpiCard icon={<CheckCheck className="h-4 w-4" />} label="Delivered" value={String(totals.delivered)} />
        <KpiCard icon={<Eye className="h-4 w-4" />} label="Open Rate" value={`${totals.openRate}%`} />
        <KpiCard icon={<MousePointerClick className="h-4 w-4" />} label="Click Rate" value={`${totals.clickRate}%`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-4 font-serif text-lg">Channel Breakdown</h3>
          <div className="space-y-4">
            {CHANNELS.map((c) => (
              <div key={c.key}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className={c.color + " h-2 w-2 rounded-full"} />
                    {c.label}
                  </span>
                  <span className="text-muted">{byChannel[c.key].sent} sent</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted/30">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(byChannel[c.key].sent / maxChannel) * 100}%` }}
                    transition={{ duration: 0.4 }}
                    className={`h-full rounded-full ${c.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-4 font-serif text-lg">7-Day Engagement</h3>
          <div className="flex h-32 items-end gap-2">
            {timeSeries.map((d, i) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full items-end gap-0.5" style={{ height: "100%" }}>
                  <Bar
                    value={d.sent}
                    max={maxSeries}
                    className="bg-accent/40"
                    delay={i * 0.03}
                  />
                  <Bar
                    value={d.opened}
                    max={maxSeries}
                    className="bg-accent/80"
                    delay={i * 0.03 + 0.1}
                  />
                  <Bar
                    value={d.clicked}
                    max={maxSeries}
                    className="bg-success"
                    delay={i * 0.03 + 0.2}
                  />
                </div>
                <span className="text-[8px] text-muted">
                  {new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent/40" /> Sent</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent/80" /> Opened</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success" /> Clicked</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2 text-accent">{icon}</div>
      <p className="mt-2 font-serif text-2xl">{value}</p>
      <p className="text-xs uppercase tracking-widest text-muted">{label}</p>
    </div>
  );
}

function Bar({ value, max, className, delay }: { value: number; max: number; className: string; delay: number }) {
  const height = Math.max(4, (value / max) * 100);
  return (
    <motion.div
      initial={{ height: 0 }}
      animate={{ height: `${height}%` }}
      transition={{ delay, duration: 0.3 }}
      className={`flex-1 rounded-t ${className}`}
      title={String(value)}
    />
  );
}
