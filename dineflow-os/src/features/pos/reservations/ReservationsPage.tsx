import { useEffect, useState } from "react";
import { Plus, Edit3, Check, Users, Clock, MapPin, X } from "lucide-react";
import { mockReservationService } from "@/services/mock/mockReservationService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { Reservation } from "@/services/types";

export function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editRes, setEditRes] = useState<Reservation | null>(null);

  async function refresh() {
    setReservations(mockReservationService.getReservations());
  }

  useEffect(() => { refresh(); }, []);

  function openForm(r?: Reservation) { setEditRes(r ?? null); setFormOpen(true); }
  async function handleDelete(id: string) { mockReservationService.cancelReservation(id); refresh(); }
  async function handleSeat(id: string) { mockReservationService.markSeated(id); refresh(); }

  const upcoming = reservations.filter((r) => r.status === "confirmed");
  const seated = reservations.filter((r) => r.status === "seated");

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Reservations</h1>
          <p className="mt-1 text-sm text-muted">Schedule and manage table reservations.</p>
        </div>
        <Button className="gap-2" onClick={() => openForm()}>
          <Plus className="h-4 w-4" /> Add Reservation
        </Button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 font-serif text-xl">Upcoming ({upcoming.length})</h2>
          <div className="space-y-2">
            {upcoming.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{r.guestName}</p>
                    <p className="text-xs text-muted">{r.phone}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8" onClick={() => openForm(r)}><Edit3 className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 text-danger" onClick={() => handleDelete(r.id)}><X className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {r.guests} guests</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(r.dateTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                  {r.tableId && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Table {r.tableId}</span>}
                </div>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" className="gap-1" onClick={() => handleSeat(r.id)}>
                    <Check className="h-3 w-3" /> Seat
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {seated.length > 0 && (
          <div>
            <h2 className="mb-3 font-serif text-xl">Seated ({seated.length})</h2>
            <div className="space-y-2">
              {seated.map((r) => (
                <div key={r.id} className="rounded-xl border border-success/30 bg-surface p-4">
                  <p className="font-medium">{r.guestName}</p>
                  <p className="text-xs text-muted">{r.guests} guests · {r.tableId ? `Table ${r.tableId}` : "Unassigned"}</p>
                  <span className="mt-1 inline-block rounded bg-success/15 px-2 py-0.5 text-xs font-medium text-success">Seated</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ReservationFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        reservation={editRes ?? undefined}
        onSave={(r) => {
          if (editRes) mockReservationService.updateReservation(editRes.id, r);
          else mockReservationService.createReservation(r);
          refresh();
        }}
      />
    </div>
  );
}

function ReservationFormDialog({ open, onOpenChange, reservation, onSave }: {
  open: boolean; onOpenChange: (o: boolean) => void;
  reservation?: Reservation;
  onSave: (r: Omit<Reservation, "id" | "createdAt">) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState(2);
  const [dateTime, setDateTime] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (reservation) {
      setName(reservation.guestName);
      setPhone(reservation.phone);
      setGuests(reservation.guests);
      setDateTime(new Date(reservation.dateTime).toISOString().slice(0, 16));
      setNotes(reservation.notes ?? "");
    } else {
      setName(""); setPhone(""); setGuests(2);
      setDateTime(new Date(Date.now() + 3600000).toISOString().slice(0, 16));
      setNotes("");
    }
  }, [reservation, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{reservation ? "Edit" : "New"} Reservation</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Guest Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Guests</Label><Input type="number" value={guests} onChange={(e) => setGuests(parseInt(e.target.value) || 1)} /></div>
            <div className="space-y-2"><Label>Date & Time</Label><Input type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label>Notes</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => {
            onSave({ guestName: name, phone, guests, dateTime: new Date(dateTime).getTime(), notes, status: "confirmed", tableId: null });
            onOpenChange(false);
          }} disabled={!name.trim()}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
