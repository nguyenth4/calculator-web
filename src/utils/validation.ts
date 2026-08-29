/** Pure validation helpers shared by forms across the app. */

export function requireText(value: string, fieldLabel: string): string | undefined {
  if (!value || value.trim() === "") {
    return `${fieldLabel} không được để trống.`;
  }
  return undefined;
}

export function requirePositiveNumber(
  value: number,
  fieldLabel: string,
): string | undefined {
  if (Number.isNaN(value)) {
    return `${fieldLabel} phải là một số hợp lệ.`;
  }
  if (value <= 0) {
    return `${fieldLabel} phải lớn hơn 0.`;
  }
  return undefined;
}

export function requireNonNegativeNumber(
  value: number,
  fieldLabel: string,
): string | undefined {
  if (Number.isNaN(value)) {
    return `${fieldLabel} phải là một số hợp lệ.`;
  }
  if (value < 0) {
    return `${fieldLabel} không được là số âm.`;
  }
  return undefined;
}

export function requirePositiveInteger(
  value: number,
  fieldLabel: string,
): string | undefined {
  const positiveError = requirePositiveNumber(value, fieldLabel);
  if (positiveError) return positiveError;
  if (!Number.isInteger(value)) {
    return `${fieldLabel} phải là số nguyên.`;
  }
  return undefined;
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some((message) => Boolean(message));
}
