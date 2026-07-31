import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star } from "lucide-react";
import { services } from "@/services";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";
import { segmentCustomer, SEGMENT_CONFIG } from "@/lib/segments";
import type { CustomerProfile, LoyaltyTier, Segment } from "@/services/types";

const TIER_DOT: Record<LoyaltyTier, string> = {
  bronze: "bg-amber-600",
  silver: "bg-gray-300",
  gold: "bg-accent",
  platinum: "bg-purple-400",
};

const SEGMENT_FILTERS: ("all" | Segment)[] = [
  "all",
  "vip",
  "regular",
  "new",
  "at-risk",
  "churned",
];

export function CrmPage() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<CustomerProfile[]>([]);
  const [query, setQuery] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<"all" | Segment>("all");

  useEffect(() => {
    services.customer.getAllProfiles().then(setProfiles);
  }, []);

  const segments = profiles.map(segmentCustomer);

  const filtered = profiles.filter((p, i) => {
    const matchesQuery =
      !query ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.mobile.includes(query.trim());
    const matchesSegment =
      segmentFilter === "all" || segments[i] === segmentFilter;
    return matchesQuery && matchesSegment;
  });

  const totalSpend = profiles.reduce((s, p) => s + p.totalSpend, 0);
  const avgSpend = profiles.length ? totalSpend / profiles.length : 0;
  const vipCount = segments.filter((s) => s === "vip").length;

  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-serif text-3xl">CRM</h1>
      <p className="mt-1 text-sm text-muted">
        {profiles.length} registered customer
        {profiles.length !== 1 ? "s" : ""}
      </p>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatBox label="Customers" value={String(profiles.length)} />
        <StatBox label="Total Revenue" value={formatCurrency(totalSpend)} />
        <StatBox label="Avg Spend" value={formatCurrency(avgSpend)} />
        <StatBox label="VIPs" value={String(vipCount)} />
      </div>

      {/* Search + segment filter */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or mobile…"
            className="pl-9"
            aria-label="Search customers"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {SEGMENT_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setSegmentFilter(s)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs capitalize transition-colors",
                segmentFilter === s
                  ? "border-accent text-accent"
                  : "border-border text-muted hover:text-foreground"
              )}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Customer list */}
      <div className="mt-6 space-y-2">
        {filtered.length === 0 && (
          <p className="py-8 text-center text-muted">No customers found.</p>
        )}
        {filtered.map((p) => {
          const seg = segmentCustomer(p);
          const segCfg = SEGMENT_CONFIG[seg];
          return (
            <button
              key={p.mobile}
              onClick={() => navigate(`/pos/crm/${p.mobile}`)}
              className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-5 py-4 text-left transition-colors hover:bg-surface-2"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-sm font-medium text-muted">
                  {p.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{p.name}</p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        segCfg.className
                      )}
                    >
                      {segCfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted">
                    {p.mobile} · {p.visits} visit{p.visits > 1 ? "s" : ""}
                    {p.avgRating > 0 && (
                      <>
                        {" "}
                        ·{" "}
                        <Star className="inline h-3 w-3 fill-accent text-accent" />{" "}
                        {p.avgRating.toFixed(1)}
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-serif text-sm">
                    {formatCurrency(p.totalSpend)}
                  </p>
                  <p className="text-xs text-muted">{p.points} pts</p>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs capitalize">
                  <span className={cn("h-2 w-2 rounded-full", TIER_DOT[p.tier])} />
                  {p.tier}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 font-serif text-xl">{value}</p>
    </div>
  );
}
