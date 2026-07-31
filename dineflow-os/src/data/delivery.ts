export const DELIVERY_FEE = 40;
export const FREE_DELIVERY_THRESHOLD = 1000;
export const DELIVERY_ETA_MINUTES = 35;
export const PICKUP_ETA_MINUTES = 20;

export function getDeliveryFee(subtotal: number): number {
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

export const SERVED_PINCODES = [
  "500033",
  "500034",
  "500035",
  "500036",
  "500037",
  "500038",
  "500041",
  "500042",
];
