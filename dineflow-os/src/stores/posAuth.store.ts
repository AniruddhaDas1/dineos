import { create } from "zustand";
import { persist } from "zustand/middleware";
import { services } from "@/services";
import type { StaffMember } from "@/services/types";

interface PosAuthState {
  staff: StaffMember | null;
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
}

export const usePosAuthStore = create<PosAuthState>()(
  persist(
    (set) => ({
      staff: null,

      async login(pin: string) {
        const allStaff = await services.staff.getAllStaff();
        const found = allStaff.find((s) => s.pin === pin);
        if (found) {
          await services.staff.clockIn(found.id);
          set({ staff: found });
          return true;
        }
        return false;
      },

      logout() {
        const current = usePosAuthStore.getState().staff;
        if (current) {
          services.staff.clockOut(current.id);
        }
        set({ staff: null });
      },
    }),
    { name: "dineflow-pos-auth" }
  )
);
