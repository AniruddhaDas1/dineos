import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { services } from "@/services";
import { useMarketingStore } from "@/stores/marketing.store";
import type { MarketingCampaign, MarketingChannel, MarketingTemplate } from "@/services/types";

const SEGMENTS = ["all", "vip", "regular", "new", "at-risk", "churned"] as const;
const TIERS = ["all", "bronze", "silver", "gold", "platinum"] as const;

const VARIABLES = ["{{name}}", "{{points}}", "{{tier}}", "{{restaurant}}"];

export function CampaignComposer({
  open,
  onOpenChange,
  campaign,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  campaign: MarketingCampaign | null;
}) {
  const templates = useMarketingStore((s) => s.templates);
  const refresh = useMarketingStore((s) => s.refresh);

  const [name, setName] = useState("");
  const [channel, setChannel] = useState<MarketingChannel>("whatsapp");
  const [segment, setSegment] = useState<string>("all");
  const [tier, setTier] = useState<string>("all");
  const [templateId, setTemplateId] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");

  useEffect(() => {
    if (campaign) {
      setName(campaign.name);
      setChannel(campaign.channel);
      setSegment(campaign.audience.segment);
      setTier(campaign.audience.tier);
      setTemplateId(campaign.templateId ?? "");
      setMessage(campaign.message);
      setSubject(campaign.subject ?? "");
    } else {
      setName("");
      setChannel("whatsapp");
      setSegment("all");
      setTier("all");
      setTemplateId("");
      setMessage("");
      setSubject("");
    }
  }, [campaign, open]);

  function pickTemplate(id: string) {
    setTemplateId(id);
    const tpl = templates.find((t) => t.id === id);
    if (tpl) {
      setChannel(tpl.channel);
      setMessage(tpl.body);
      setSubject(tpl.subject ?? "");
    }
  }

  async function handleSave() {
    if (!name.trim() || !message.trim()) return;
    const payload = {
      name,
      channel,
      audience: { segment: segment as MarketingCampaign["audience"]["segment"], tier: tier as MarketingCampaign["audience"]["tier"] },
      templateId: templateId || undefined,
      message,
      subject: channel === "email" ? subject : undefined,
      status: "draft" as const,
    };

    if (campaign) {
      await services.marketing.updateCampaign(campaign.id, payload);
    } else {
      await services.marketing.createCampaign(payload);
    }
    await refresh();
    onOpenChange(false);
  }

  const channelTemplates = templates.filter((t) => t.channel === channel);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{campaign ? "Edit Campaign" : "New Campaign"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Campaign Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Weekend Special" />
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Audience Segment</Label>
              <Select value={segment} onValueChange={setSegment}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SEGMENTS.map((s) => (
                    <SelectItem key={s} value={s}>{s === "all" ? "All customers" : s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Loyalty Tier</Label>
              <Select value={tier} onValueChange={setTier}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIERS.map((t) => (
                    <SelectItem key={t} value={t}>{t === "all" ? "All tiers" : t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Template (optional)</Label>
            <Select value={templateId || "__none"} onValueChange={(v) => v !== "__none" && pickTemplate(v)}>
              <SelectTrigger><SelectValue placeholder="Choose a template" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">No template</SelectItem>
                {channelTemplates.map((t: MarketingTemplate) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {channel === "email" && (
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject line" />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Message</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message…"
              className="min-h-[120px]"
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {VARIABLES.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setMessage((m) => m + " " + v)}
                  className="rounded-full border border-border px-2.5 py-1 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || !message.trim()}>
            {campaign ? "Save Changes" : "Create Campaign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
