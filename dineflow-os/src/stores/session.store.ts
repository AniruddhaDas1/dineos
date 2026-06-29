import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Customer } from "@/services/types";

interface SessionState {
  customer: Customer | null;
  setCustomer: (c: Customer) => void;
  clear: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      customer: null,
      setCustomer: (c) => set({ customer: c }),
      clear: () => set({ customer: null }),
    }),
    { name: "dineflow-session" }
  )
);
