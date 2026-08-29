import { useState } from "react";
import type { Printer, PrinterInput } from "../../types";
import { initialPrinters } from "../../data/sampleData";
import { parseNumberInput } from "../../utils/currency";
import { requireText, requirePositiveNumber, hasErrors } from "../../utils/validation";

const EMPTY_FORM = {
  name: "",
  powerKw: "",
  lifetimeHours: "",
  purchasePrice: "",
};

type FormState = typeof EMPTY_FORM;

interface PrinterFormProps {
  editing: Printer | null;
  onSubmit: (input: PrinterInput) => void;
  onCancel: () => void;
}

function toFormState(printer: Printer | null): FormState {
  if (!printer) return EMPTY_FORM;
  return {
    name: printer.name,
    powerKw: String(printer.powerKw),
    lifetimeHours: String(printer.lifetimeHours),
    purchasePrice: String(printer.purchasePrice),
  };
}

function validate(form: FormState) {
  const errors: Partial<Record<keyof FormState, string>> = {};
  errors.name = requireText(form.name, "Tên máy");
  errors.powerKw = requirePositiveNumber(parseNumberInput(form.powerKw), "Công suất");
  errors.lifetimeHours = requirePositiveNumber(
    parseNumberInput(form.lifetimeHours),
    "Tuổi thọ máy",
  );
  errors.purchasePrice = requirePositiveNumber(
    parseNumberInput(form.purchasePrice),
    "Giá mua máy",
  );
  return errors;
}

export function PrinterForm({ editing, onSubmit, onCancel }: PrinterFormProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(editing));
  const [submitted, setSubmitted] = useState(false);

  const errors = validate(form);

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  // Khi tên máy khớp với một máy có sẵn trong dữ liệu mẫu, tự điền công suất
  // và tuổi thọ (KHÔNG tự điền giá mua vì mỗi người mua giá khác nhau).
  const handleNameChange = (value: string) => {
    const preset = initialPrinters.find(
      (p) => p.name.trim().toLowerCase() === value.trim().toLowerCase(),
    );
    if (preset) {
      setForm((prev) => ({
        ...prev,
        name: value,
        powerKw: String(preset.powerKw),
        lifetimeHours: String(preset.lifetimeHours),
      }));
    } else {
      set("name", value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (hasErrors(errors)) return;

    onSubmit({
      name: form.name.trim(),
      powerKw: parseNumberInput(form.powerKw),
      purchasePrice: parseNumberInput(form.purchasePrice),
      lifetimeHours: parseNumberInput(form.lifetimeHours),
    });

    if (!editing) {
      setForm(EMPTY_FORM);
      setSubmitted(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <label className="field">
        <span>Tên máy</span>
        <input
          type="text"
          list="printer-presets"
          value={form.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Ví dụ: Bambu Lab A1"
          className={`input-field ${submitted && errors.name ? "input-error" : ""}`}
        />
        <datalist id="printer-presets">
          {initialPrinters.map((p) => (
            <option key={p.id} value={p.name} />
          ))}
        </datalist>
        {submitted && errors.name && <small className="field-error">{errors.name}</small>}
      </label>

      <div className="field-row">
        <label className="field">
          <span>Công suất (kW)</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={form.powerKw}
            onChange={(e) => set("powerKw", e.target.value)}
            placeholder="0.095"
            className={`input-field ${submitted && errors.powerKw ? "input-error" : ""}`}
          />
          <small className="field-hint">
            Công suất trung bình khi in, không phải công suất tối đa trên tem máy.
          </small>
          {submitted && errors.powerKw && (
            <small className="field-error">{errors.powerKw}</small>
          )}
        </label>

        <label className="field">
          <span>Tuổi thọ dự kiến (giờ)</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={form.lifetimeHours}
            onChange={(e) => set("lifetimeHours", e.target.value)}
            placeholder="4000"
            className={`input-field ${submitted && errors.lifetimeHours ? "input-error" : ""}`}
          />
          <small className="field-hint">Chỉ là số ước tính, có thể chỉnh lại theo thực tế.</small>
          {submitted && errors.lifetimeHours && (
            <small className="field-error">{errors.lifetimeHours}</small>
          )}
        </label>

        <label className="field">
          <span>Giá mua máy (đ)</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={form.purchasePrice}
            onChange={(e) => set("purchasePrice", e.target.value)}
            placeholder="Nhập giá bạn đã mua"
            className={`input-field ${submitted && errors.purchasePrice ? "input-error" : ""}`}
          />
          {submitted && errors.purchasePrice && (
            <small className="field-error">{errors.purchasePrice}</small>
          )}
        </label>
      </div>

      <div className="mt-1 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn btn-ghost">
          Hủy
        </button>
        <button type="submit" className="btn btn-primary">
          {editing ? "Lưu thay đổi" : "Thêm máy in"}
        </button>
      </div>
    </form>
  );
}
