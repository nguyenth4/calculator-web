import type { InputHTMLAttributes } from "react";
import { formatNumberInput } from "../../utils/currency";

interface FormattedNumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
}

export function FormattedNumberInput({
  value,
  onChange,
  inputMode = "decimal",
  ...props
}: FormattedNumberInputProps) {
  return (
    <input
      {...props}
      type="text"
      inputMode={inputMode}
      value={formatNumberInput(value)}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}