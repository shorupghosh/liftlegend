const bdtFormatter = new Intl.NumberFormat('en-BD', {
  maximumFractionDigits: 0,
});

export function formatBdt(amount: number): string {
  return `BDT ${bdtFormatter.format(amount || 0)}`;
}
