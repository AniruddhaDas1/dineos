export function formatCurrency(amount: number): string {
  const hasFraction = Math.round(amount * 100) % 100 !== 0;
  return `₹${hasFraction ? amount.toFixed(2) : Math.round(amount).toString()}`;
}

export function formatHour(hour: number): string {
  const h = hour % 12;
  const suffix = hour < 12 ? "AM" : "PM";
  return `${h === 0 ? 12 : h} ${suffix}`;
}
