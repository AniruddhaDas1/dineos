import type { AppointmentService } from "../index";
import type { Appointment } from "@/services/types";

let appointments: Appointment[] = [
  {
    id: "appt-1",
    customerName: "Meera Nair",
    mobile: "9000011111",
    type: "tasting",
    dateTime: Date.now() + 3 * 24 * 60 * 60_000,
    durationMinutes: 30,
    status: "scheduled",
    notes: "Interested in the new tasting menu.",
    callId: "call-seed-0",
    createdAt: Date.now() - 24 * 60 * 60_000,
  },
  {
    id: "appt-2",
    customerName: "Karthik Reddy",
    mobile: "9000022222",
    type: "callback",
    dateTime: Date.now() + 24 * 60 * 60_000,
    durationMinutes: 15,
    status: "confirmed",
    createdAt: Date.now() - 2 * 24 * 60 * 60_000,
  },
];

let seq = 0;
function nextId(): string {
  seq += 1;
  return `appt-${Date.now()}-${seq}`;
}

export const mockAppointmentService: AppointmentService & {
  __reset: () => void;
} = {
  async getAppointments() {
    return [...appointments].sort((a, b) => a.dateTime - b.dateTime);
  },

  async createAppointment(a) {
    const created: Appointment = { ...a, id: nextId(), createdAt: Date.now() };
    appointments.push(created);
    return created;
  },

  async updateAppointment(id, patch) {
    const idx = appointments.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error(`Appointment ${id} not found`);
    appointments[idx] = { ...appointments[idx], ...patch };
    return appointments[idx];
  },

  async cancelAppointment(id) {
    const a = appointments.find((a) => a.id === id);
    if (a) a.status = "cancelled";
  },

  async completeAppointment(id) {
    const a = appointments.find((a) => a.id === id);
    if (a) a.status = "completed";
  },

  async linkReservation(appointmentId, reservationId) {
    const appointment = appointments.find((a) => a.id === appointmentId);
    if (!appointment) throw new Error(`Appointment ${appointmentId} not found`);
    appointment.reservationId = reservationId;
    appointment.status = "confirmed";
    return appointment;
  },

  __reset() {
    appointments = [];
    seq = 0;
  },
};
