export interface RedemptionInput {
  pointsBalance: number;
  subtotal: number;
}

export interface RedemptionOutput {
  pointsUsed: number;
  discount: number;
}

/** 10 loyalty points = ₹10 discount. Max 50% of subtotal per order. */
const POINTS_TO_CURRENCY = 1;
const MAX_REDEMPTION_RATIO = 0.5;

export function computeRedemption(input: RedemptionInput): RedemptionOutput {
  if (input.pointsBalance <= 0 || input.subtotal <= 0) {
    return { pointsUsed: 0, discount: 0 };
  }
  const maxDiscount = input.subtotal * MAX_REDEMPTION_RATIO;
  const maxPoints = Math.floor(maxDiscount / POINTS_TO_CURRENCY);
  const pointsUsed = Math.min(input.pointsBalance, maxPoints);
  const discount = pointsUsed * POINTS_TO_CURRENCY;
  return { pointsUsed, discount };
}
