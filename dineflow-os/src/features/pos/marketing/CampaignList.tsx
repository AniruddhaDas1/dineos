import { useState } from "react";
import { Plus, Play, Pause, Trash2, Pencil, Send, MessageSquare, Mail } from "lucide-react";
import { useMarketingStore } from "@/stores/marketing.store";
import { usePermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CampaignComposer } from "./CampaignComposer";
import { services } from "@/services";
import type { MarketingCampaign, MarketingChannel } from "@/services/types";

const CHANNEL_ICON: Record<MarketingChannel, React.ReactNode> = {
  whatsapp: <MessageSquare className="h-4 w-4 text-green-500" />,
  sms: <MessageSquare className="h-4 w-4 text-blue-500" />,
  email: <Mail className="h-4 w-4 text-amber-500" />,
};

const STATUS_BADGE: Record<MarketingCampaign["status"], string> = {
  draft: "bg-surface-2 text-muted",
  scheduled: "bg-blue-500/15 text-blue-400",
  running: "bg-amber-500/15 text-amber-400",
  completed: "bg-success/15 text-success",
  paused: "bg-orange-500/15 text-orange-400",
};

export function CampaignList() {
  const campaigns = useMarketingStore((s) => s.campaigns);
  const sendCampaign = useMarketingStore((s) => s.sendCampaign);
  const refresh = useMarketingStore((s) => s.refresh);
  const canManage = usePermission("marketing:manage");
  const [composerOpen, setComposerOpen] = useState(false);
  const [editing, setEditing] = useState<MarketingCampaign | null>(null);

  async function handleSend(id: string) {
    await sendCampaign(id);
  }

  async function handlePause(id: string) {
    const c = campaigns.find((x) => x.id === id);
    if (!c) return;
    await services.marketing.updateCampaign(id, {
      status: c.status === "paused" ? "draft" : "paused",
    });
    await refresh();
  }

  async function handleDelete(id: string) {
    await services.marketing.deleteCampaign(id);
    await refresh();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted">{campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}</p>
        {canManage && (
          <Button className="gap-2" onClick={() => { setEditing(null); setComposerOpen(true); }}>
            <Plus className="h-4 w-4" /> New Campaign
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {campaigns.length === 0 && (
          <p className="py-12 text-center text-muted">No campaigns yet. Create your first one.</p>
        )}
        {campaigns.map((c) => (
          <div key={c.id} className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{CHANNEL_ICON[c.channel]}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{c.name}</p>
                    <Badge className={STATUS_BADGE[c.status]}>{c.status}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {audienceLabel(c.audience)} · {c.channel}
                  </p>
                  <p className="mt-2 max-w-2xl text-sm text-foreground/80">{c.message}</p>
                </div>
              </div>
              {canManage && (
                <div className="flex shrink-0 items-center gap-1">
                  {c.status !== "completed" && (
                    <Button size="sm" className="gap-1" onClick={() => handleSend(c.id)}>
                      <Play className="h-3 w-3" /> Send
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="h-8 w-8" onClick={() => { setEditing(c); setComposerOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {c.status === "running" || c.status === "completed" ? (
                    <Button size="sm" variant="ghost" className="h-8 w-8" onClick={() => handlePause(c.id)}>
                      <Pause className="h-4 w-4" />
                    </Button>
                  ) : null}
                  <Button size="sm" variant="ghost" className="h-8 w-8 text-danger" onClick={() => handleDelete(c.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {c.status === "completed" && (
              <div className="mt-4 flex flex-wrap gap-4 border-t border-border pt-3 text-xs text-muted">
                <Stat icon={<Send className="h-3 w-3" />} label="Sent" value={c.stats.sent} />
                <Stat label="Delivered" value={c.stats.delivered} />
                <Stat label="Opened" value={c.stats.opened} />
                <Stat label="Clicked" value={c.stats.clicked} />
              </div>
            )}
          </div>
        ))}
      </div>

      <CampaignComposer
        open={composerOpen}
        onOpenChange={setComposerOpen}
        campaign={editing}
      />
    </div>
  );
}

function audienceLabel(a: MarketingCampaign["audience"]): string {
  const parts = [a.segment === "all" ? "All customers" : a.segment];
  if (a.tier !== "all") parts.push(a.tier);
  return parts.join(" · ");
}

function Stat({ icon, label, value }: { icon?: React.ReactNode; label: string; value: number }) {
  return (
    <span className="flex items-center gap-1.5">
      {icon}
      {label} <span className="font-medium text-foreground">{value}</span>
    </span>
  );
}
