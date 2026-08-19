import { useState } from "react";
import { Phone, Play, Trash2 } from "lucide-react";
import { useOutreachStore } from "@/stores/outreach.store";
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
import type { VoiceCallLog, VoiceCallScript } from "@/services/types";

const OUTCOME_LABELS: Record<string, string> = {
  interested: "Interested",
  not_interested: "Not interested",
  call_back_later: "Call back later",
  appointment_booked: "Appointment booked",
  wrong_number: "Wrong number",
  voicemail: "Voicemail",
};

export function VoiceCallPanel() {
  const calls = useOutreachStore((s) => s.calls);
  const scripts = useOutreachStore((s) => s.scripts);
  const startCall = useOutreachStore((s) => s.startCall);
  const refresh = useOutreachStore((s) => s.refresh);
  const canManage = usePermission("marketing:manage");
  const [formOpen, setFormOpen] = useState(false);

  async function handleStart(input: { customerName: string; mobile: string; scriptId: string }) {
    await startCall(input);
    setFormOpen(false);
  }

  async function handleDeleteScript(id: string) {
    await services.voiceCall.deleteScript(id);
    await refresh();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted">{calls.length} call log{calls.length !== 1 ? "s" : ""}</p>
        {canManage && (
          <Button className="gap-2" onClick={() => setFormOpen(true)}>
            <Phone className="h-4 w-4" /> New AI Call
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="mb-3 font-serif text-lg">Call Scripts</h3>
          <div className="space-y-2">
            {scripts.map((s) => (
              <div key={s.id} className="flex items-start justify-between gap-3 rounded-lg bg-surface-2 p-3">
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="mt-1 text-xs text-muted">{s.prompt}</p>
                </div>
                {canManage && (
                  <Button size="sm" variant="ghost" className="h-8 w-8 text-danger" onClick={() => handleDeleteScript(s.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {scripts.length === 0 && <p className="py-6 text-center text-muted">No scripts yet.</p>}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="mb-3 font-serif text-lg">Call History</h3>
          <div className="space-y-2">
            {calls.map((c) => (
              <CallRow key={c.id} call={c} />
            ))}
            {calls.length === 0 && <p className="py-6 text-center text-muted">No calls yet.</p>}
          </div>
        </div>
      </div>

      {formOpen && (
        <CallForm
          scripts={scripts}
          onStart={handleStart}
          onClose={() => setFormOpen(false)}
        />
      )}
    </div>
  );
}

function CallRow({ call }: { call: VoiceCallLog }) {
  const statusColor =
    call.status === "completed"
      ? "bg-success/15 text-success"
      : call.status === "failed"
        ? "bg-danger/15 text-danger"
        : "bg-amber-500/15 text-amber-400";

  return (
    <div className="flex items-start justify-between gap-3 rounded-lg bg-surface-2 p-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium">{call.customerName}</p>
          <Badge className={statusColor}>{call.status}</Badge>
        </div>
        <p className="text-xs text-muted">{call.mobile}</p>
        {call.outcome && (
          <p className="mt-1 text-xs text-muted">
            Outcome: {OUTCOME_LABELS[call.outcome] ?? call.outcome}
          </p>
        )}
        {call.transcript && (
          <p className="mt-1 text-xs italic text-muted line-clamp-2">{call.transcript}</p>
        )}
      </div>
      <div className="shrink-0 text-right text-xs text-muted">
        {call.durationSeconds ? `${call.durationSeconds}s` : "—"}
      </div>
    </div>
  );
}

function CallForm({
  scripts,
  onStart,
  onClose,
}: {
  scripts: VoiceCallScript[];
  onStart: (input: { customerName: string; mobile: string; scriptId: string }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [scriptId, setScriptId] = useState(scripts[0]?.id ?? "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold">Start AI Voice Call</h3>
        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label>Customer Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Mobile</Label>
            <Input inputMode="numeric" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))} maxLength={10} />
          </div>
          <div className="space-y-1.5">
            <Label>Script</Label>
            <Select value={scriptId} onValueChange={setScriptId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {scripts.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!name.trim() || mobile.length !== 10 || !scriptId}
            onClick={() => onStart({ customerName: name.trim(), mobile, scriptId })}
          >
            <Play className="mr-2 h-4 w-4" /> Start Call
          </Button>
        </div>
      </div>
    </div>
  );
}
