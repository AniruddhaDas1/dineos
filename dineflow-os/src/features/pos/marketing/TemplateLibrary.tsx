import { useState } from "react";
import { Plus, Trash2, Pencil, MessageSquare, Mail } from "lucide-react";
import { useMarketingStore } from "@/stores/marketing.store";
import { usePermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import type { MarketingChannel, MarketingTemplate } from "@/services/types";

function extractVariables(body: string): string[] {
  const matches = body.match(/\{\{\w+\}\}/g) ?? [];
  return [...new Set(matches)];
}

export function TemplateLibrary() {
  const templates = useMarketingStore((s) => s.templates);
  const refresh = useMarketingStore((s) => s.refresh);
  const canManage = usePermission("marketing:manage");
  const [editing, setEditing] = useState<MarketingTemplate | null>(null);

  async function handleDelete(id: string) {
    await services.marketing.deleteTemplate(id);
    await refresh();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted">{templates.length} template{templates.length !== 1 ? "s" : ""}</p>
        {canManage && (
          <Button className="gap-2" onClick={() => setEditing({} as MarketingTemplate)}>
            <Plus className="h-4 w-4" /> New Template
          </Button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {templates.map((t) => {
          const vars = extractVariables(t.body);
          return (
            <div key={t.id} className="rounded-xl border border-border bg-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {t.channel === "email" ? (
                      <Mail className="h-5 w-5 text-amber-500" />
                    ) : (
                      <MessageSquare className={`h-5 w-5 ${t.channel === "whatsapp" ? "text-green-500" : "text-blue-500"}`} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-xs capitalize text-muted">{t.channel}</p>
                    {t.subject && <p className="mt-1 text-sm font-medium">{t.subject}</p>}
                    <p className="mt-1 text-sm text-foreground/80 line-clamp-2">{t.body}</p>
                  </div>
                </div>
                {canManage && (
                  <div className="flex shrink-0 items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8" onClick={() => setEditing(t)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 text-danger" onClick={() => handleDelete(t.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              {vars.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {vars.map((v) => (
                    <Badge key={v} variant="outline" className="text-xs">{v}</Badge>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editing && (
        <TemplateEditor template={editing.id ? editing : null} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function TemplateEditor({ template, onClose }: { template: MarketingTemplate | null; onClose: () => void }) {
  const refresh = useMarketingStore((s) => s.refresh);
  const [name, setName] = useState(template?.name ?? "");
  const [channel, setChannel] = useState<MarketingChannel>(template?.channel ?? "whatsapp");
  const [subject, setSubject] = useState(template?.subject ?? "");
  const [body, setBody] = useState(template?.body ?? "");

  async function handleSave() {
    if (!name.trim() || !body.trim()) return;
    if (template) {
      await services.marketing.updateTemplate(template.id, {
        name,
        channel,
        subject: channel === "email" ? subject : undefined,
        body,
      });
    } else {
      await services.marketing.createTemplate({
        name,
        channel,
        subject: channel === "email" ? subject : undefined,
        body,
      });
    }
    await refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-lg border border-border bg-surface p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold">{template ? "Edit Template" : "New Template"}</h3>
        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Template name" />
          </div>
          <div className="space-y-1.5">
            <Label>Channel</Label>
            <Select value={channel} onValueChange={(v) => setChannel(v as MarketingChannel)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="email">Email</SelectItem>
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
            <Label>Body</Label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} className="min-h-[120px]" />
            <p className="text-xs text-muted">
              Variables: {"{{name}}"}, {"{{points}}"}, {"{{tier}}"}, {"{{restaurant}}"}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || !body.trim()}>Save</Button>
        </div>
      </div>
    </div>
  );
}
