export interface TotalsInput {
  subtotal: number;
  gstPercent: number;
  serviceChargePercent: number;
  discount?: number;
  deliveryFee?: number;
}

export interface TotalsOutput {
  discount: number;
  afterDiscount: number;
  gst: number;
  serviceCharge: number;
  deliveryFee: number;
  total: number;
}

export function computeTotals(input: TotalsInput): TotalsOutput {
  const discount = input.discount ?? 0;
  const afterDiscount = Math.max(0, input.subtotal - discount);
  const gst = +(afterDiscount * (input.gstPercent / 100)).toFixed(2);
  const serviceCharge = +(
    afterDiscount *
    (input.serviceChargePercent / 100)
  ).toFixed(2);
  const deliveryFee = input.deliveryFee ?? 0;
  const total = +(afterDiscount + gst + serviceCharge + deliveryFee).toFixed(2);
  return { discount, afterDiscount, gst, serviceCharge, deliveryFee, total };
}
