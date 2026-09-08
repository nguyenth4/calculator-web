import { useEffect, useState } from "react";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import type { CalculatorSettings } from "../types";
import { FormattedNumberInput } from "../components/common/FormattedNumberInput";
import { parseNumberInput } from "../utils/currency";

function numberValue(value: number) {
  return value > 0 ? String(value) : "0";
}

export function SettingsPage() {
  const { printers, settings, updateSettings } = useData();
  const { showToast } = useToast();
  const [form, setForm] = useState<CalculatorSettings>(settings);

  useEffect(() => setForm(settings), [settings]);

  const set = <K extends keyof CalculatorSettings>(key: K, value: CalculatorSettings[K]) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const save = (event: React.FormEvent) => {
    event.preventDefault();
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
                className="input-field"
              />
            </label>
            <label className="field">
              <span>Lương giờ (đ)</span>
              <FormattedNumberInput
                value={numberValue(form.technicalRatePerHour)}
                onChange={(value) => set("technicalRatePerHour", parseNumberInput(value) || 0)}
                className="input-field"
              />
              <small className="field-hint">Đơn giá mặc định cho xử lý kỹ thuật.</small>
            </label>
            <label className="field">
              <span>Số sản phẩm bán/tháng</span>
              <FormattedNumberInput
                value={numberValue(form.monthlySalesQuantity)}
                onChange={(value) => set("monthlySalesQuantity", parseNumberInput(value) || 0)}
                className="input-field"
              />
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
                className="input-field"
              />
            </label>
            <label className="field">
              <span>Cách tính lợi nhuận</span>
              <select
                className="input-field"
                value={form.profitMethod}
                onChange={(event) => set("profitMethod", event.target.value as CalculatorSettings["profitMethod"])}
              >
                <option value="markup">Markup - lãi trên giá vốn</option>
                <option value="margin">Margin - lãi trên giá bán</option>
              </select>
            </label>
            <label className="field">
              <span>Tỷ lệ lợi nhuận (%)</span>
              <FormattedNumberInput
                value={numberValue(form.profitPercent)}
                onChange={(value) => set("profitPercent", parseNumberInput(value) || 0)}
                className="input-field"
              />
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