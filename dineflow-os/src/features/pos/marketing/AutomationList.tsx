import { useState } from "react";
import { Play, Trash2, Pencil, Zap } from "lucide-react";
import { useMarketingStore } from "@/stores/marketing.store";
import { usePermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { services } from "@/services";
import type { AutomationTrigger, MarketingAutomation, MarketingChannel } from "@/services/types";

const TRIGGER_LABELS: Record<AutomationTrigger, string> = {
  first_order: "First order placed",
  order_completed: "Order completed",
  negative_feedback: "Negative feedback received",
  customer_at_risk: "Customer at risk",
  customer_churned: "Customer churned",
  customer_vip: "Customer becomes VIP",
};

const CHANNEL_COLOR: Record<MarketingChannel, string> = {
  whatsapp: "text-green-500",
  sms: "text-blue-500",
  email: "text-amber-500",
};

export function AutomationList() {
  const automations = useMarketingStore((s) => s.automations);
  const runAutomation = useMarketingStore((s) => s.runAutomation);
  const refresh = useMarketingStore((s) => s.refresh);
  const canManage = usePermission("marketing:manage");
  const [editing, setEditing] = useState<MarketingAutomation | null>(null);

  async function handleToggle(id: string, enabled: boolean) {
    await services.marketing.updateAutomation(id, { enabled: !enabled });
    await refresh();
  }

  async function handleDelete(id: string) {
    await services.marketing.deleteAutomation(id);
    await refresh();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted">{automations.length} automation{automations.length !== 1 ? "s" : ""}</p>
        {canManage && (
          <Button className="gap-2" onClick={() => setEditing({} as MarketingAutomation)}>
            <Zap className="h-4 w-4" /> New Automation
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {automations.length === 0 && (
          <p className="py-12 text-center text-muted">No automations yet.</p>
        )}
        {automations.map((a) => (
          <div key={a.id} className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5"><Zap className={`h-5 w-5 ${CHANNEL_COLOR[a.channel]}`} /></div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{a.name}</p>
                    <Badge className={a.enabled ? "bg-success/15 text-success" : "bg-surface-2 text-muted"}>
                      {a.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    Trigger: {TRIGGER_LABELS[a.trigger]} · {a.channel}
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    Ran {a.runCount} time{a.runCount !== 1 ? "s" : ""}
                    {a.lastRunAt ? ` · Last ${new Date(a.lastRunAt).toLocaleDateString("en-IN")}` : ""}
                  </p>
                </div>
              </div>

              {canManage && (
                <div className="flex shrink-0 items-center gap-1">
                  <Button size="sm" className="gap-1" onClick={() => runAutomation(a.id)}>
                    <Play className="h-3 w-3" /> Run
                  </Button>
                  <button
                    onClick={() => handleToggle(a.id, a.enabled)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${a.enabled ? "bg-accent" : "bg-surface-2 border border-border"}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow-sm ${a.enabled ? "left-[22px]" : "left-[2px]"}`} />
                  </button>
                  <Button size="sm" variant="ghost" className="h-8 w-8" onClick={() => setEditing(a)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 text-danger" onClick={() => handleDelete(a.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <AutomationEditor
          automation={editing.id ? editing : null}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function AutomationEditor({ automation, onClose }: { automation: MarketingAutomation | null; onClose: () => void }) {
  const templates = useMarketingStore((s) => s.templates);
  const refresh = useMarketingStore((s) => s.refresh);
  const [name, setName] = useState(automation?.name ?? "");
  const [trigger, setTrigger] = useState<AutomationTrigger>(automation?.trigger ?? "first_order");
  const [channel, setChannel] = useState<MarketingChannel>(automation?.channel ?? "whatsapp");
  const [templateId, setTemplateId] = useState(automation?.templateId ?? "");

  const channelTemplates = templates.filter((t) => t.channel === channel);

  async function handleSave() {
    if (!name.trim() || !templateId) return;
    if (automation) {
      await services.marketing.updateAutomation(automation.id, { name, trigger, channel, templateId });
    } else {
      await services.marketing.createAutomation({
        name,
        trigger,
        audience: { segment: "all", tier: "all" },
        channel,
        templateId,
        enabled: true,
      });
    }
    await refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-lg border border-border bg-surface p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold">{automation ? "Edit Automation" : "New Automation"}</h3>
        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Trigger</Label>
            <Select value={trigger} onValueChange={(v) => setTrigger(v as AutomationTrigger)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(TRIGGER_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Channel</Label>
            <Select value={channel} onValueChange={(v) => { setChannel(v as MarketingChannel); setTemplateId(""); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Template</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger><SelectValue placeholder="Choose a template" /></SelectTrigger>
              <SelectContent>
                {channelTemplates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || !templateId}>Save</Button>
        </div>
      </div>
    </div>
  );
}
