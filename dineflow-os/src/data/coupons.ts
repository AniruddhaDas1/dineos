import type { Coupon } from "@/services/types";

const now = Date.now();
const DAY = 86_400_000;
const YEAR = 365 * DAY;

export const coupons: Coupon[] = [
  {
    id: "cpn-1",
    code: "WELCOME10",
    type: "percent",
    value: 10,
    minOrder: 0,
    maxDiscount: 200,
    usageLimit: 1000,
    usedCount: 47,
    validFrom: now - 30 * DAY,
    validUntil: now + YEAR,
    active: true,
  },
  {
    id: "cpn-2",
    code: "FLAT50",
    type: "flat",
    value: 50,
    minOrder: 300,
    usageLimit: 500,
    usedCount: 23,
    validFrom: now - 15 * DAY,
    validUntil: now + 180 * DAY,
    active: true,
  },
  {
    id: "cpn-3",
    code: "FIRST100",
    type: "flat",
    value: 100,
    minOrder: 500,
    usageLimit: 200,
    usedCount: 12,
    validFrom: now - 7 * DAY,
    validUntil: now + 90 * DAY,
    active: true,
  },
];

export function validateCoupon(
  code: string,
  subtotal: number,
  _customerMobile?: string
): Coupon | null {
  const upper = code.trim().toUpperCase();
  const coupon = coupons.find((c) => c.code === upper);
  if (!coupon) return null;
  if (!coupon.active) return null;
  const now = Date.now();
  if (now < coupon.validFrom || now > coupon.validUntil) return null;
  if (coupon.usedCount >= coupon.usageLimit) return null;
  if (subtotal < coupon.minOrder) return null;
  return coupon;
}

export function applyCouponDiscount(coupon: Coupon, subtotal: number): number {
  if (coupon.type === "percent") {
    const raw = subtotal * (coupon.value / 100);
    return coupon.maxDiscount != null ? Math.min(raw, coupon.maxDiscount) : raw;
  }
  return coupon.value;
}
