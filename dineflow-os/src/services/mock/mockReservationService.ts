import type { Reservation } from "@/services/types";

let reservations: Reservation[] = [
  {
    id: "res-1", guestName: "Deepak Sharma", phone: "9810012345", guests: 4,
    dateTime: Date.now() + 2 * 3600000, tableId: "tbl-3", status: "confirmed", createdAt: Date.now(),
  },
  {
    id: "res-2", guestName: "Nandini Reddy", phone: "9900011223", guests: 2,
    dateTime: Date.now() + 4 * 3600000, tableId: null, status: "confirmed", createdAt: Date.now(),
    notes: "Allergic to nuts",
  },
  {
    id: "res-3", guestName: "Karan Kapoor", phone: "9100099887", guests: 6,
    dateTime: Date.now() + 24 * 3600000, tableId: "tbl-8", status: "confirmed", createdAt: Date.now(),
  },
];

function nid(): string {
  return `res-${crypto.randomUUID().slice(0, 6)}`;
}

export const mockReservationService = {
  getReservations(date?: string) {
    const now = Date.now();
    return reservations.filter((r) => {
      if (date) {
        const d = new Date(date + "T00:00:00+05:30").getTime();
        return r.dateTime >= d && r.dateTime < d + 86400000;
      }
      return r.dateTime > now - 3600000;
    }).sort((a, b) => a.dateTime - b.dateTime);
  },

  createReservation(r: Omit<Reservation, "id" | "createdAt">) {
    const created: Reservation = { ...r, id: nid(), createdAt: Date.now() };
    reservations.push(created);
    return created;
  },

  updateReservation(id: string, updates: Partial<Reservation>) {
    const idx = reservations.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error("Not found");
    reservations[idx] = { ...reservations[idx], ...updates };
    return reservations[idx];
  },

  cancelReservation(id: string) {
    const r = reservations.find((r) => r.id === id);
    if (r) r.status = "cancelled";
  },

  markSeated(id: string) {
    const r = reservations.find((r) => r.id === id);
    if (r) r.status = "seated";
  },
};
