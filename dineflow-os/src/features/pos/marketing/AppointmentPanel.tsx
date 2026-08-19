import { useState } from "react";
import { Calendar, Plus, Check, X } from "lucide-react";
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
import type { Appointment, AppointmentType } from "@/services/types";

const TYPE_LABELS: Record<AppointmentType, string> = {
  demo: "Demo",
  callback: "Callback",
  tasting: "Tasting",
  consultation: "Consultation",
  follow_up: "Follow-up",
};

const STATUS_BADGE: Record<Appointment["status"], string> = {
  scheduled: "bg-blue-500/15 text-blue-400",
  confirmed: "bg-success/15 text-success",
  completed: "bg-surface-2 text-muted",
  cancelled: "bg-danger/15 text-danger",
  no_show: "bg-orange-500/15 text-orange-400",
};

export function AppointmentPanel() {
  const appointments = useOutreachStore((s) => s.appointments);
  const bookAppointment = useOutreachStore((s) => s.bookAppointment);
  const cancelAppointment = useOutreachStore((s) => s.cancelAppointment);
  const completeAppointment = useOutreachStore((s) => s.completeAppointment);
  const canManage = usePermission("marketing:manage");
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted">{appointments.length} appointment{appointments.length !== 1 ? "s" : ""}</p>
        {canManage && (
          <Button className="gap-2" onClick={() => setFormOpen(true)}>
            <Calendar className="h-4 w-4" /> Book Appointment
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {appointments.length === 0 && (
          <p className="py-12 text-center text-muted">No appointments scheduled.</p>
        )}
        {appointments.map((a) => (
          <div key={a.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15">
                  <Calendar className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{a.customerName}</p>
                    <Badge className={STATUS_BADGE[a.status]}>{a.status}</Badge>
                  </div>
                  <p className="text-xs text-muted">{a.mobile}</p>
                  <p className="mt-1 text-sm text-muted">
                    {TYPE_LABELS[a.type]} ·{" "}
                    {new Date(a.dateTime).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}{" "}
                    · {a.durationMinutes} min
                  </p>
                  {a.notes && <p className="mt-1 text-xs italic text-muted">{a.notes}</p>}
                </div>
              </div>

              {canManage && a.status !== "completed" && a.status !== "cancelled" && (
                <div className="flex shrink-0 items-center gap-1">
                  <Button size="sm" className="gap-1" onClick={() => completeAppointment(a.id)}>
                    <Check className="h-3 w-3" /> Complete
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 text-danger" onClick={() => cancelAppointment(a.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {formOpen && (
        <AppointmentForm
          onBook={(input) => {
            bookAppointment(input);
            setFormOpen(false);
          }}
          onClose={() => setFormOpen(false)}
        />
      )}
    </div>
  );
}

function AppointmentForm({
  onBook,
  onClose,
}: {
  onBook: (input: Omit<Appointment, "id" | "createdAt">) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [type, setType] = useState<AppointmentType>("demo");
  const [dateTime, setDateTime] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold">Book Appointment</h3>
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Mobile</Label>
              <Input inputMode="numeric" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))} maxLength={10} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as AppointmentType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Duration (min)</Label>
              <Input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value) || 15)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Date & Time</Label>
            <Input type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!name.trim() || mobile.length !== 10}
            onClick={() =>
              onBook({
                customerName: name.trim(),
                mobile,
                type,
                dateTime: new Date(dateTime).getTime(),
                durationMinutes: duration,
                status: "scheduled",
                notes: notes.trim() || undefined,
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" /> Book
          </Button>
        </div>
      </div>
    </div>
  );
}
