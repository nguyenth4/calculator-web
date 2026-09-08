/** Round a value up to the nearest multiple of 500 (used for cost/price display). */
export function roundUpTo500(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.ceil(value / 500) * 500;
}

/** Round a value to the nearest multiple of 500. */
export function roundToNearest500(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.round(value / 500) * 500;
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

/** Format an editable number with comma thousands separators and a dot decimal separator. */
export function formatNumberInput(raw: string | null | undefined): string {
  const cleaned = (raw ?? "").replace(/[^\d.,]/g, "");
  if (cleaned === "") return "";

  const decimalParts = cleaned.split(".");
  if (decimalParts.length > 2) return formatNumberInput(`${decimalParts[0]}.${decimalParts.slice(1).join("")}`);

  const [integerPart, fractionalPart] = decimalParts;
  const integer = integerPart.replace(/,/g, "");
  const formattedInteger = integer === "" ? "" : new Intl.NumberFormat("en-US").format(Number(integer));

  return fractionalPart === undefined
    ? formattedInteger
    : `${formattedInteger}.${fractionalPart.replace(/,/g, "")}`;
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
    .replace(/\s/g, "");
  if (cleaned.trim() === "") return NaN;

  const normalized = cleaned.replace(/,/g, "");

  const value = Number(normalized);
  return Number.isFinite(value) ? value : NaN;
}
