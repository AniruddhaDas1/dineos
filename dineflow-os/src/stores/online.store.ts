import { create } from "zustand";
import type { DeliveryAddress } from "@/services/types";

type OrderType = "pickup" | "delivery" | null;

interface OnlineState {
  orderType: OrderType;
  address: DeliveryAddress | null;
  scheduledFor: number | null;
  setType: (type: OrderType) => void;
  setAddress: (address: DeliveryAddress | null) => void;
  setScheduledFor: (time: number | null) => void;
  clear: () => void;
}

export const useOnlineStore = create<OnlineState>((set) => ({
  orderType: null,
  address: null,
  scheduledFor: null,

  setType(type) {
    set({ orderType: type });
  },

  setAddress(address) {
    set({ address });
  },

  setScheduledFor(time) {
    set({ scheduledFor: time });
  },

  clear() {
    set({ orderType: null, address: null, scheduledFor: null });
  },
}));
