import { useState } from "react";
import type { Plastic, PlasticInput } from "../../types";
import { initialPlastics } from "../../data/sampleData";
import { parseNumberInput } from "../../utils/currency";
import { requireText, requirePositiveNumber, hasErrors } from "../../utils/validation";
import { FormattedNumberInput } from "../common/FormattedNumberInput";

const PLASTIC_TYPES = ["PLA", "PETG", "ABS", "ASA", "TPU", "PC", "PA", "PVA"];
const COLORS = [
  "#171717",
  "#f8fafc",
  "#8b8b8b",
  "#dc0000",
  "#f59e0b",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
  "#92400e",
];
const BAMBU_PETG_BASIC_PRESETS = [
  { name: "Bambu Lab PETG Basic Tím", type: "PETG", color: "#a855f7" },
  { name: "Bambu Lab PETG Basic Vàng", type: "PETG", color: "#eab308" },
  { name: "Bambu Lab PETG Basic Xanh dương", type: "PETG", color: "#3b82f6" },
  { name: "Bambu Lab PETG Basic Xanh lá", type: "PETG", color: "#22c55e" },
  { name: "Bambu Lab PETG Basic Xám", type: "PETG", color: "#8b8b8b" },
  { name: "Bambu Lab PETG Basic Đen", type: "PETG", color: "#171717" },
  { name: "Bambu Lab PETG Basic Đỏ", type: "PETG", color: "#dc0000" },
  { name: "Bambu Lab PETG Basic Trắng", type: "PETG", color: "#f8fafc" },
  { name: "Bambu Lab PETG Basic Nâu", type: "PETG", color: "#92400e" },
];
const BAMBU_PLA_PRESETS = [
  { name: "Bambu Lab PLA Basic Tím", type: "PLA", color: "#a855f7" },
  { name: "Bambu Lab PLA Basic Vàng", type: "PLA", color: "#eab308" },
  { name: "Bambu Lab PLA Basic Xanh dương", type: "PLA", color: "#3b82f6" },
  { name: "Bambu Lab PLA Basic Xanh lá", type: "PLA", color: "#22c55e" },
  { name: "Bambu Lab PLA Basic Xám", type: "PLA", color: "#8b8b8b" },
  { name: "Bambu Lab PLA Basic Đen", type: "PLA", color: "#171717" },
  { name: "Bambu Lab PLA Basic Đỏ", type: "PLA", color: "#dc0000" },
  { name: "Bambu Lab PLA Basic Trắng", type: "PLA", color: "#f8fafc" },
  { name: "Bambu Lab PLA Basic Cam", type: "PLA", color: "#f59e0b" },
  { name: "Bambu Lab PLA Silk Vàng", type: "PLA", color: "#eab308" },
  { name: "Bambu Lab PLA Silk Bạc", type: "PLA", color: "#cbd5e1" },
  { name: "Bambu Lab PLA Silk Đồng", type: "PLA", color: "#b45309" },
  { name: "Bambu Lab PLA Silk Đỏ", type: "PLA", color: "#dc2626" },
  { name: "Bambu Lab PLA Silk Xanh dương", type: "PLA", color: "#2563eb" },
  { name: "Bambu Lab PLA Silk Xanh lá", type: "PLA", color: "#16a34a" },
  { name: "Bambu Lab PLA Silk Tím", type: "PLA", color: "#9333ea" },
  { name: "Bambu Lab PLA Silk Hồng", type: "PLA", color: "#ec4899" },
  { name: "Bambu Lab PLA Silk Đen", type: "PLA", color: "#171717" },
];

const EMPTY_FORM = {
  name: "",
  type: "PLA",
  pricePerKg: "",
  color: "#f59e0b",
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
  };
}

function validate(form: FormState) {
  const errors: Partial<Record<keyof FormState, string>> = {};
  errors.name = requireText(form.name, "Tên nhựa");
  errors.type = requireText(form.type, "Loại nhựa");
  const price = parseNumberInput(form.pricePerKg);
  errors.pricePerKg = requirePositiveNumber(price, "Giá/kg");
  return errors;
}

export function PlasticForm({ editing, onSubmit, onCancel }: PlasticFormProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(editing));
  const [submitted, setSubmitted] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [typeSuggestionsOpen, setTypeSuggestionsOpen] = useState(false);

  const errors = validate(form);

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const suggestedPlastics = [
    ...initialPlastics,
    ...BAMBU_PETG_BASIC_PRESETS,
    ...BAMBU_PLA_PRESETS,
  ].filter(
    (plastic) =>
      plastic.type === form.type &&
      plastic.name.toLowerCase().includes(form.name.trim().toLowerCase()),
  );
  const suggestedTypes = PLASTIC_TYPES.filter((type) =>
    type.toLowerCase().includes(form.type.trim().toLowerCase()),
  );

  const handleNameChange = (name: string) => {
    const preset = [...initialPlastics, ...BAMBU_PETG_BASIC_PRESETS, ...BAMBU_PLA_PRESETS].find(
      (item) => item.name === name,
    );
    if (preset) {
      setForm((prev) => ({ ...prev, name, type: preset.type, color: preset.color }));
      setSuggestionsOpen(false);
      return;
    }
    set("name", name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (hasErrors(errors)) return;

    onSubmit({
      name: form.name.trim(),
      type: form.type.trim(),
      pricePerKg: parseNumberInput(form.pricePerKg),
      color: form.color,
      manufacturer: editing?.manufacturer ?? "Không xác định",
      description: editing?.description ?? "",
      status: editing?.status ?? "active",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <div className="field-row">
        <label className="field grow relative">
          <span>Tên</span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => {
              handleNameChange(e.target.value);
              setSuggestionsOpen(true);
            }}
            onFocus={() => setSuggestionsOpen(true)}
            onBlur={() => setSuggestionsOpen(false)}
            placeholder="Gõ để tìm nhựa mẫu, hoặc tự nhập"
            className={`input-field ${submitted && errors.name ? "input-error" : ""}`}
          />
          {suggestionsOpen && suggestedPlastics.length > 0 && (
            <ul className="absolute top-full z-10 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-line bg-surface py-1 shadow-lg">
              {suggestedPlastics.map((plastic) => (
                <li key={plastic.name}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleNameChange(plastic.name)}
                    className="w-full px-3 py-2 text-left text-sm text-text hover:bg-surface-2"
                  >
                    {plastic.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {submitted && errors.name && <small className="field-error">{errors.name}</small>}
        </label>

        <label className="field relative">
          <span>Loại</span>
          <input
            type="text"
            value={form.type}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, type: event.target.value, name: "" }));
              setSuggestionsOpen(false);
              setTypeSuggestionsOpen(true);
            }}
            onFocus={() => setTypeSuggestionsOpen(true)}
            onBlur={() => setTypeSuggestionsOpen(false)}
            placeholder="Chọn hoặc nhập loại"
            className={`input-field ${submitted && errors.type ? "input-error" : ""}`}
          />
          {typeSuggestionsOpen && suggestedTypes.length > 0 && (
            <ul className="absolute top-full z-10 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-line bg-surface py-1 shadow-lg">
              {suggestedTypes.map((type) => (
                <li key={type}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setForm((prev) => ({ ...prev, type, name: "" }));
                      setTypeSuggestionsOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-text hover:bg-surface-2"
                  >
                    {type}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {submitted && errors.type && <small className="field-error">{errors.type}</small>}
        </label>
        <label className="field">
          <span>Giá / kg</span>
          <FormattedNumberInput
            value={form.pricePerKg}
            onChange={(value) => set("pricePerKg", value)}
            placeholder="350000"
            className={`input-field ${submitted && errors.pricePerKg ? "input-error" : ""}`}
          />
          {submitted && errors.pricePerKg && (
            <small className="field-error">{errors.pricePerKg}</small>
          )}
        </label>
      </div>

      <fieldset className="border-0 p-0">
        <legend className="field-label">Màu</legend>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => set("color", color)}
              aria-label={`Chọn màu ${color}`}
              aria-pressed={form.color === color}
              className={`h-7 w-7 rounded-full border-2 shadow-sm ${form.color === color ? "border-text ring-2 ring-accent-muted" : "border-line"}`}
              style={{ backgroundColor: color }}
            />
          ))}
          <input
            type="color"
            value={form.color}
            onChange={(event) => set("color", event.target.value)}
            aria-label="Chọn màu tùy chỉnh"
            className="h-8 w-10 cursor-pointer rounded border border-line bg-surface p-1"
          />
        </div>
      </fieldset>

      <div className="mt-1 flex gap-2">
        {editing && (
          <button type="button" onClick={onCancel} className="btn btn-ghost">
            Hủy
          </button>
        )}
        <button type="submit" className="btn btn-primary">
          {editing ? "Lưu thay đổi" : "Thêm"}
        </button>
      </div>
    </form>
  );
}
