import { UtensilsCrossed } from "lucide-react";
import { useKdsStore } from "@/stores/kds.store";
import { STATIONS } from "@/data/station";
import { KdsBoard } from "./KdsBoard";

export function KdsLayout() {
  const stationName = useKdsStore((s) => s.stationName);
  const setStationName = useKdsStore((s) => s.setStationName);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex flex-shrink-0 items-center justify-between border-b border-border bg-surface px-6 py-3">
        <div className="flex items-center gap-3">
          <UtensilsCrossed className="h-5 w-5 text-accent" />
          <span className="font-serif text-lg">Saffron &amp; Smoke</span>
          <span className="hidden rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent sm:inline-block">
            Kitchen Display
          </span>
        </div>

        {/* Station selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="kds-station" className="text-xs text-muted">
            Station
          </label>
          <select
            id="kds-station"
            value={stationName}
            onChange={(e) => setStationName(e.target.value)}
            className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm text-foreground outline-none focus:border-accent"
          >
            {STATIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Board */}
      <main className="flex-1 overflow-hidden">
        <KdsBoard />
      </main>
    </div>
  );
}
