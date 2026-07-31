import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { services } from "@/services";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { useOrderContext } from "@/lib/orderContext";
import { VegMark } from "../components/VegMark";
import { SpiceDots } from "../components/SpiceDots";
import { Rating } from "../components/Rating";
import { BadgeRow } from "../components/BadgeRow";
import { RecommendationBanner } from "@/features/ai/recommendations/RecommendationBanner";
import { BecauseYouLiked } from "@/features/ai/recommendations/BecauseYouLiked";
import { TrendingNow } from "@/features/ai/recommendations/TrendingNow";
import type { Category, MenuItem, VegType } from "@/services/types";

export function MenuPage() {
  const navigate = useNavigate();
  const { base } = useOrderContext();
  const [cats, setCats] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [vegFilter, setVegFilter] = useState<"all" | VegType>("all");
  const [activeCat, setActiveCat] = useState<string>("");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    Promise.all([
      services.menu.getCategories(),
      services.menu.getMenuItems(),
    ]).then(([c, i]) => {
      setCats(c);
      setItems(i);
      setActiveCat(c[0]?.id ?? "");
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      const matchesQuery =
        !query ||
        it.name.toLowerCase().includes(query.toLowerCase()) ||
        (it.description ?? "").toLowerCase().includes(query.toLowerCase());
      const matchesVeg = vegFilter === "all" || it.vegType === vegFilter;
      return matchesQuery && matchesVeg;
    });
  }, [items, query, vegFilter]);

  // Scroll spy: set active category as user scrolls.
  useEffect(() => {
    if (loading) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting)
            setActiveCat((e.target as HTMLElement).dataset.cat ?? "");
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [cats, loading, query, vegFilter]);

  function scrollToCat(id: string) {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Sticky header: search + filters + category rail */}
      <div className="sticky top-0 z-30 space-y-3 border-b border-border bg-background/90 p-4 backdrop-blur">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dishes…"
            aria-label="Search dishes"
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 text-sm">
          {(["all", "veg", "non-veg", "egg"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVegFilter(v)}
              className={`rounded-full border px-3 py-1 capitalize ${
                vegFilter === v
                  ? "border-accent text-accent"
                  : "border-border text-muted"
              }`}
            >
              {v === "all" ? "All" : v}
            </button>
          ))}
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {cats.map((c) => (
            <button
              key={c.id}
              onClick={() => scrollToCat(c.id)}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-sm ${
                activeCat === c.id
                  ? "bg-accent text-accent-foreground"
                  : "bg-surface-2 text-muted"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu sections */}
      <div className="p-4">
        {/* AI Recommendations */}
        <RecommendationBanner />
        <BecauseYouLiked />
        <TrendingNow />

        {cats.map((c) => {
          const list = filtered.filter((i) => i.categoryId === c.id);
          if (!list.length) return null;
          return (
            <section
              key={c.id}
              data-cat={c.id}
              ref={(el) => {
                sectionRefs.current[c.id] = el;
              }}
              className="mb-8 scroll-mt-44"
            >
              <h2 className="mb-3 font-serif text-xl">{c.name}</h2>
              <div className="space-y-3">
                {list.map((it) => (
                  <button
                    key={it.id}
                    disabled={!it.available}
                    onClick={() =>
                      navigate(`${base}/item/${it.id}`)
                    }
                    className="flex w-full gap-3 rounded-xl border border-border bg-surface p-3 text-left disabled:opacity-50"
                  >
                    <img
                      src={it.image}
                      alt={it.name}
                      className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <VegMark type={it.vegType} />
                        <span className="truncate font-medium">{it.name}</span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                        {it.description}
                      </p>
                      <div className="mt-1.5 flex items-center gap-3">
                        <Rating value={it.rating} />
                        <SpiceDots level={it.spiceLevel ?? 0} />
                        {it.prepMinutes && (
                          <span className="text-xs text-muted">
                            {it.prepMinutes} min
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <BadgeRow badges={it.badges} />
                        <span className="font-semibold">
                          {formatCurrency(it.price)}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
        {!filtered.length && (
          <p className="py-10 text-center text-muted">
            No dishes match your search.
          </p>
        )}
      </div>
    </div>
  );
}
