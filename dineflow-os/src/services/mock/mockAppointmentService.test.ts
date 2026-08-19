import { describe, it, expect, beforeEach } from "vitest";
import { mockAppointmentService } from "./mockAppointmentService";

describe("mockAppointmentService", () => {
  beforeEach(() => {
    mockAppointmentService.__reset();
  });

  it("creates and lists appointments sorted by date", async () => {
    const later = await mockAppointmentService.createAppointment({
      customerName: "Later",
      mobile: "9000000001",
      type: "demo",
      dateTime: Date.now() + 2 * 24 * 60 * 60_000,
      durationMinutes: 30,
      status: "scheduled",
    });
    const sooner = await mockAppointmentService.createAppointment({
      customerName: "Sooner",
      mobile: "9000000002",
      type: "callback",
      dateTime: Date.now() + 24 * 60 * 60_000,
      durationMinutes: 15,
      status: "scheduled",
    });

    const list = await mockAppointmentService.getAppointments();
    const ids = list.map((a) => a.id);
    expect(ids.indexOf(sooner.id)).toBeLessThan(ids.indexOf(later.id));
  });

  it("cancels and completes appointments", async () => {
    const appt = await mockAppointmentService.createAppointment({
      customerName: "Test",
      mobile: "9000000003",
      type: "tasting",
      dateTime: Date.now() + 3600000,
      durationMinutes: 30,
      status: "scheduled",
    });

    await mockAppointmentService.cancelAppointment(appt.id);
    let list = await mockAppointmentService.getAppointments();
    expect(list.find((a) => a.id === appt.id)?.status).toBe("cancelled");

    const appt2 = await mockAppointmentService.createAppointment({
      customerName: "Test2",
      mobile: "9000000004",
      type: "follow_up",
      dateTime: Date.now() + 3600000,
      durationMinutes: 15,
      status: "scheduled",
    });
    await mockAppointmentService.completeAppointment(appt2.id);
    list = await mockAppointmentService.getAppointments();
    expect(list.find((a) => a.id === appt2.id)?.status).toBe("completed");
  });

  it("links an appointment to a reservation", async () => {
    const appt = await mockAppointmentService.createAppointment({
      customerName: "Link Test",
      mobile: "9000000005",
      type: "demo",
      dateTime: Date.now() + 3600000,
      durationMinutes: 30,
      status: "scheduled",
    });

    const linked = await mockAppointmentService.linkReservation(appt.id, "res-1");
    expect(linked.reservationId).toBe("res-1");
    expect(linked.status).toBe("confirmed");
  });
});
