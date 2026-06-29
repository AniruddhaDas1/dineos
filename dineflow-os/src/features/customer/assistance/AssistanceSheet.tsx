import { useState } from "react";
import { BellRing, GlassWater, Hand, Sparkles } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { useOrderStore } from "@/stores/order.store";
import type { AssistanceType } from "@/services/types";

const ACTIONS: {
  type: AssistanceType;
  label: string;
  icon: React.ReactNode;
}[] = [
  { type: "waiter", label: "Call Waiter", icon: <BellRing className="h-5 w-5" /> },
  { type: "water", label: "Request Water", icon: <GlassWater className="h-5 w-5" /> },
  { type: "tissue", label: "Need Tissue", icon: <Sparkles className="h-5 w-5" /> },
];

export function AssistanceSheet() {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const requestAssistance = useOrderStore((s) => s.requestAssistance);
  const hasOrder = !!useOrderStore((s) => s.activeOrder);

  async function fire(type: AssistanceType, label: string) {
    if (!hasOrder) return;
    await requestAssistance(type);
    setOpen(false);
    setToast(`${label} requested`);
    setTimeout(() => setToast(null), 2500);
  }

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          {hasOrder && (
            <button className="fixed bottom-24 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-foreground shadow-lg border border-border">
              <Hand className="h-5 w-5" />
            </button>
          )}
        </SheetTrigger>
        <SheetContent side="bottom">
          <SheetTitle>Need assistance?</SheetTitle>
          <div className="mt-4 space-y-2">
            {ACTIONS.map((a) => (
              <button
                key={a.type}
                onClick={() => fire(a.type, a.label)}
                className="flex w-full items-center gap-3 rounded-xl bg-surface-2 p-4 text-left"
              >
                <span className="text-accent">{a.icon}</span>
                <span className="font-medium">{a.label}</span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {toast && (
        <div className="fixed bottom-28 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-sm text-background">
          {toast}
        </div>
      )}
    </>
  );
}
