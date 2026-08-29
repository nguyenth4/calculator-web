/** Round a value up to the nearest multiple of 500 (used for cost/price display). */
export function roundUpTo500(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.ceil(value / 500) * 500;
}

/** Format a number as Vietnamese currency, e.g. 1234567 -> "1.234.567đ" */
export function formatVND(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }
  return `${new Intl.NumberFormat("vi-VN").format(Math.round(value))}đ`;
}

/** Format a plain number with thousand separators, no currency suffix. */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }
  return new Intl.NumberFormat("vi-VN").format(value);
}

/**
 * Parse a user-typed currency/number string into a number.
 * Accepts thousand separators ("." or ",") and stray whitespace.
 * Returns NaN if the string has no usable digits.
 */
export function parseNumberInput(raw: string): number {
  if (raw == null) return NaN;
  const cleaned = raw
    .toString()
    .replace(/đ/gi, "")
    .replace(/\s/g, "")
    .replace(/[.,](?=\d{3}(\D|$))/g, "")
    .replace(",", ".");
  if (cleaned.trim() === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
}
