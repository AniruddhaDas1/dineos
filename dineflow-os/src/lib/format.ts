export function formatCurrency(amount: number): string {
  const hasFraction = Math.round(amount * 100) % 100 !== 0;
  return `₹${hasFraction ? amount.toFixed(2) : Math.round(amount).toString()}`;
}
