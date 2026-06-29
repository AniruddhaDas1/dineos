export function cartLineId(itemId: string, selectedAddOnIds: string[]): string {
  const sorted = [...selectedAddOnIds].sort().join(",");
  return `${itemId}|${sorted}`;
}
