import { create } from "zustand";
import { persist } from "zustand/middleware";
import { services } from "@/services";
import type {
  Appointment,
  VoiceCallLog,
  VoiceCallScript,
} from "@/services/types";

interface OutreachState {
  scripts: VoiceCallScript[];
  calls: VoiceCallLog[];
  appointments: Appointment[];
  loading: boolean;
  refresh: () => Promise<void>;
  startCall: (input: { customerName: string; mobile: string; scriptId: string }) => Promise<void>;
  bookAppointment: (input: Omit<Appointment, "id" | "createdAt">) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;
  completeAppointment: (id: string) => Promise<void>;
}

export const useOutreachStore = create<OutreachState>()(
  persist(
    (set) => ({
      scripts: [],
      calls: [],
      appointments: [],
      loading: false,

      async refresh() {
        set({ loading: true });
        try {
          const [scripts, calls, appointments] = await Promise.all([
            services.voiceCall.getScripts(),
            services.voiceCall.getCallLogs(),
            services.appointment.getAppointments(),
          ]);
          set({ scripts, calls, appointments });
        } finally {
          set({ loading: false });
        }
      },

      async startCall(input) {
        await services.voiceCall.startCall(input);
        const calls = await services.voiceCall.getCallLogs();
        set({ calls });
      },

      async bookAppointment(input) {
        await services.appointment.createAppointment(input);
        const appointments = await services.appointment.getAppointments();
        set({ appointments });
      },

      async cancelAppointment(id) {
        await services.appointment.cancelAppointment(id);
        const appointments = await services.appointment.getAppointments();
        set({ appointments });
      },

      async completeAppointment(id) {
        await services.appointment.completeAppointment(id);
        const appointments = await services.appointment.getAppointments();
        set({ appointments });
      },
    }),
    { name: "dineflow-outreach", partialize: () => ({}) }
  )
);
