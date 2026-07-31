import { create } from "zustand";
import type { Coupon } from "@/services/types";
import { validateCoupon, applyCouponDiscount } from "@/data/coupons";

interface CouponState {
  coupon: Coupon | null;
  discount: number;
  apply: (code: string, subtotal: number) => boolean;
  clear: () => void;
  getDiscount: (subtotal: number) => number;
}

export const useCouponStore = create<CouponState>((set, get) => ({
  coupon: null,
  discount: 0,

  apply(code, subtotal) {
    const result = validateCoupon(code, subtotal);
    if (result) {
      const discount = applyCouponDiscount(result, subtotal);
      set({ coupon: result, discount });
      return true;
    }
    set({ coupon: null, discount: 0 });
    return false;
  },

  clear() {
    set({ coupon: null, discount: 0 });
  },

  getDiscount(subtotal) {
    const { coupon } = get();
    if (!coupon) return 0;
    return applyCouponDiscount(coupon, subtotal);
  },
}));
