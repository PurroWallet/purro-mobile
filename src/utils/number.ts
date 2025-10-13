export function formatPriceUSD(
  value: number | null,
  options?: { digits?: number },
) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const digits = options?.digits ?? 2;
  if (value >= 1000) {
    return `$${value.toLocaleString(undefined, {
      maximumFractionDigits: digits,
    })}`;
  }
  return `$${value.toFixed(digits)}`;
}

export function formatChangePercent(value: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}
