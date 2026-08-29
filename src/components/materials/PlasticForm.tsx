import { useState } from "react";
import type { ItemStatus, Plastic, PlasticInput } from "../../types";
import { parseNumberInput } from "../../utils/currency";
import { requireText, requirePositiveNumber, hasErrors } from "../../utils/validation";

const PLASTIC_TYPES = ["PLA", "PETG", "ABS", "ASA", "TPU", "PC", "PA", "PVA"];

const EMPTY_FORM = {
  name: "",
  type: "PLA",
  pricePerKg: "",
  color: "#2563eb",
  manufacturer: "",
  description: "",
  status: "active" as ItemStatus,
};

type FormState = typeof EMPTY_FORM;

interface PlasticFormProps {
  editing: Plastic | null;
  onSubmit: (input: PlasticInput) => void;
  onCancel: () => void;
}

function toFormState(plastic: Plastic | null): FormState {
  if (!plastic) return EMPTY_FORM;
  return {
    name: plastic.name,
    type: plastic.type,
    pricePerKg: String(plastic.pricePerKg),
    color: plastic.color,
    manufacturer: plastic.manufacturer,
    description: plastic.description,
    status: plastic.status,
  };
}

function validate(form: FormState) {
  const errors: Partial<Record<keyof FormState, string>> = {};
  errors.name = requireText(form.name, "Tên nhựa");
  errors.type = requireText(form.type, "Loại nhựa");
  errors.manufacturer = requireText(form.manufacturer, "Nhà sản xuất");
  const price = parseNumberInput(form.pricePerKg);
  errors.pricePerKg = requirePositiveNumber(price, "Giá/kg");
  return errors;
}

export function PlasticForm({ editing, onSubmit, onCancel }: PlasticFormProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(editing));
  const [submitted, setSubmitted] = useState(false);

  const errors = validate(form);

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (hasErrors(errors)) return;

    onSubmit({
      name: form.name.trim(),
      type: form.type.trim(),
      pricePerKg: parseNumberInput(form.pricePerKg),
      color: form.color,
      manufacturer: form.manufacturer.trim(),
      description: form.description.trim(),
      status: form.status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="field-row">
        <label className="field grow">
          <span>Tên nhựa</span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Ví dụ: PLA Basic"
            className={`input-field ${submitted && errors.name ? "input-error" : ""}`}
          />
          {submitted && errors.name && <small className="field-error">{errors.name}</small>}
        </label>

        <label className="field">
          <span>Loại nhựa</span>
          <input
            type="text"
            list="plastic-type-options"
            value={form.type}
            onChange={(e) => set("type", e.target.value)}
            placeholder="PLA"
            className={`input-field ${submitted && errors.type ? "input-error" : ""}`}
          />
          <datalist id="plastic-type-options">
            {PLASTIC_TYPES.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
          {submitted && errors.type && <small className="field-error">{errors.type}</small>}
        </label>
      </div>

      <div className="field-row">
        <label className="field">
          <span>Giá / kg (đ)</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={form.pricePerKg}
            onChange={(e) => set("pricePerKg", e.target.value)}
            placeholder="350000"
            className={`input-field ${submitted && errors.pricePerKg ? "input-error" : ""}`}
          />
          {submitted && errors.pricePerKg && (
            <small className="field-error">{errors.pricePerKg}</small>
          )}
        </label>

        <label className="field">
          <span>Màu</span>
          <input
            type="color"
            value={form.color}
            onChange={(e) => set("color", e.target.value)}
            className="input-field h-[42px] cursor-pointer p-1"
          />
        </label>

        <label className="field">
          <span>Trạng thái</span>
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value as FormState["status"])}
            className="input-field"
          >
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </label>
      </div>

      <label className="field">
        <span>Nhà sản xuất</span>
        <input
          type="text"
          value={form.manufacturer}
          onChange={(e) => set("manufacturer", e.target.value)}
          placeholder="Ví dụ: eSUN"
          className={`input-field ${submitted && errors.manufacturer ? "input-error" : ""}`}
        />
        {submitted && errors.manufacturer && (
          <small className="field-error">{errors.manufacturer}</small>
        )}
      </label>

      <label className="field">
        <span>Mô tả</span>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Đặc tính, ứng dụng phù hợp..."
          rows={3}
          className="input-field resize-none"
        />
      </label>

      <div className="mt-1 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn btn-ghost">
          Hủy
        </button>
        <button type="submit" className="btn btn-primary">
          {editing ? "Lưu thay đổi" : "Thêm nhựa"}
        </button>
      </div>
    </form>
  );
}
