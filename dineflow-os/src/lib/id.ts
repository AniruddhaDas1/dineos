export function cartLineId(
  itemId: string,
  selectedAddOnIds: string[],
  instructions?: string
): string {
  const sorted = [...selectedAddOnIds].sort().join(",");
  // Include instructions so the same item + add-ons with DIFFERENT instructions
  // (e.g. "No onions" vs "Extra spicy") stay as separate cart lines.
  const note = instructions ? instructions.trim().toLowerCase() : "";
  return `${itemId}|${sorted}|${note}`;
}
