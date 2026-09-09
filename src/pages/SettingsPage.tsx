import { useEffect, useState } from "react";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import type { CalculatorSettings } from "../types";
import { FormattedNumberInput } from "../components/common/FormattedNumberInput";
import { parseNumberInput } from "../utils/currency";
import { hasErrors, requireNonNegativeNumber } from "../utils/validation";

function numberValue(value: number) {
  return value > 0 ? String(value) : "0";
}

export function SettingsPage() {
  const { printers, settings, updateSettings } = useData();
  const { showToast } = useToast();
  const [form, setForm] = useState<CalculatorSettings>(settings);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  useEffect(() => setForm(settings), [settings]);

  const set = <K extends keyof CalculatorSettings>(key: K, value: CalculatorSettings[K]) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const validate = (): Record<string, string | undefined> => ({
    electricityPricePerKwh: requireNonNegativeNumber(form.electricityPricePerKwh, "Giá điện"),
    technicalRatePerHour: requireNonNegativeNumber(form.technicalRatePerHour, "Lương giờ"),
    riskPercent: form.riskPercent >= 0 && form.riskPercent <= 100
      ? undefined : "Dự phòng in hỏng phải trong khoảng từ 0 đến 100%.",
    profitPercent: requireNonNegativeNumber(form.profitPercent, "Tỷ lệ lợi nhuận"),
    profitMethod: form.profitMethod === "margin" && form.profitPercent >= 100
      ? "Margin phải nhỏ hơn 100%." : undefined,
  });

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;
    updateSettings(form);
    showToast("Đã lưu cài đặt tính giá.");
  };

  return (
    <div className="settings-page animate-fade-in">
      <div className="section-head">
        <h1>Cài đặt</h1>
        <p>Thiết lập các giá trị mặc định dùng khi tính giá.</p>
      </div>

      <form className="settings-form" onSubmit={save}>
        <section className="block">
          <h2 className="block-title">Máy mặc định</h2>
          <label className="field">
            <span>Máy dùng khi tính giá đơn máy</span>
            <select
              className="input-field"
              value={form.defaultPrinterId}
              onChange={(event) => set("defaultPrinterId", event.target.value)}
            >
              <option value="">Không chọn sẵn</option>
              {printers.map((printer) => (
                <option key={printer.id} value={printer.id}>{printer.name}</option>
              ))}
            </select>
            <small className="field-hint">Quản lý danh sách máy ở trang Máy in.</small>
          </label>
        </section>

        <section className="block">
          <h2 className="block-title">Chi phí</h2>
          <div className="settings-grid">
            <label className="field">
              <span>Giá điện (đ/kWh)</span>
              <FormattedNumberInput
                value={numberValue(form.electricityPricePerKwh)}
                onChange={(value) => set("electricityPricePerKwh", parseNumberInput(value) || 0)}
                className={`input-field ${errors.electricityPricePerKwh ? "input-error" : ""}`}
              />
              {errors.electricityPricePerKwh && <small className="field-error">{errors.electricityPricePerKwh}</small>}
            </label>
            <label className="field">
              <span>Lương giờ (đ)</span>
              <FormattedNumberInput
                value={numberValue(form.technicalRatePerHour)}
                onChange={(value) => set("technicalRatePerHour", parseNumberInput(value) || 0)}
                className={`input-field ${errors.technicalRatePerHour ? "input-error" : ""}`}
              />
              {errors.technicalRatePerHour && <small className="field-error">{errors.technicalRatePerHour}</small>}
              <small className="field-hint">Đơn giá mặc định cho xử lý kỹ thuật.</small>
            </label>
          </div>
        </section>

        <section className="block settings-toggle-block">
          <h2 className="block-title">Chi phí nâng cao</h2>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={form.advancedCostsEnabled}
              onChange={(event) => set("advancedCostsEnabled", event.target.checked)}
            />
            <span>
              <strong>Bật chi phí nâng cao khi tính giá</strong>
              <small>Cho phép bổ sung chi phí khác theo từng lô in.</small>
            </span>
          </label>
        </section>

        <section className="block">
          <h2 className="block-title">Biên</h2>
          <div className="settings-grid">
            <label className="field">
              <span>Dự phòng in hỏng (%)</span>
              <FormattedNumberInput
                value={numberValue(form.riskPercent)}
                onChange={(value) => set("riskPercent", parseNumberInput(value) || 0)}
                className={`input-field ${errors.riskPercent ? "input-error" : ""}`}
              />
              {errors.riskPercent && <small className="field-error">{errors.riskPercent}</small>}
            </label>
            <label className="field">
              <span>Cách tính lợi nhuận</span>
              <select
                className={`input-field ${errors.profitMethod ? "input-error" : ""}`}
                value={form.profitMethod}
                onChange={(event) => set("profitMethod", event.target.value as CalculatorSettings["profitMethod"])}
              >
                <option value="markup">Markup - lãi trên giá vốn</option>
                <option value="margin">Margin - lãi trên giá bán</option>
              </select>
              {errors.profitMethod && <small className="field-error">{errors.profitMethod}</small>}
            </label>
            <label className="field">
              <span>Tỷ lệ lợi nhuận (%)</span>
              <FormattedNumberInput
                value={numberValue(form.profitPercent)}
                onChange={(value) => set("profitPercent", parseNumberInput(value) || 0)}
                className={`input-field ${errors.profitPercent ? "input-error" : ""}`}
              />
              {errors.profitPercent && <small className="field-error">{errors.profitPercent}</small>}
            </label>
          </div>
        </section>

        <div className="settings-actions">
          <button type="submit" className="btn btn-primary">Lưu cài đặt</button>
        </div>
      </form>
    </div>
  );
}