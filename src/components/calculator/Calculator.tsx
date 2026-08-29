import { useMemo, useState } from "react";
import { useData } from "../../context/DataContext";
import type { Plastic, Printer } from "../../types";
import { formatNumber } from "../../utils/currency";
import type { CalculatorFormState } from "../../utils/calculatorForm";
import { MaterialIcon, PrinterIcon, EmptyBoxIcon } from "../common/Icons";
import { Link } from "react-router-dom";

interface CalculatorProps {
  value: CalculatorFormState;
  onChange: (next: CalculatorFormState) => void;
  onReset: () => void;
  errors: Partial<Record<keyof CalculatorFormState, string>>;
  selectedPlastic: Plastic | undefined;
  selectedPrinter: Printer | undefined;
}

export function Calculator({
  value,
  onChange,
  onReset,
  errors,
  selectedPlastic,
  selectedPrinter,
}: CalculatorProps) {
  const { plastics, printers } = useData();
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const activePlastics = useMemo(
    () => plastics.filter((p) => p.status === "active"),
    [plastics],
  );
  const availablePrinters = printers;

  const set = <K extends keyof CalculatorFormState>(
    key: K,
    val: CalculatorFormState[K],
  ) => {
    onChange({ ...value, [key]: val });
  };

  const markTouched = (key: string) =>
    setTouched((prev) => new Set(prev).add(key));
  const shouldShowError = (key: string) =>
    touched.has(key) || touched.has("__submit");

  return (
    <div className="flex flex-col gap-4">
      {/* Máy in */}
      <div className="block">
        <div className="block-head">
          <h2 className="section-label">
            <PrinterIcon className="text-accent" /> Máy in
          </h2>
        </div>

        {availablePrinters.length === 0 ? (
          <EmptyState
            text="Chưa có máy in nào — thêm máy để tính khấu hao & tiền điện."
            linkTo="/printers"
            linkLabel="Thêm máy in đầu tiên"
          />
        ) : (
          <label className="field">
            <span>Chọn máy in</span>
            <select
              value={value.printerId}
              onChange={(e) => set("printerId", e.target.value)}
              onBlur={() => markTouched("printerId")}
              className={`input-field ${shouldShowError("printerId") && errors.printerId ? "input-error" : ""}`}
            >
              <option value="">— Chọn máy in —</option>
              {availablePrinters.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {formatNumber(p.purchasePrice)}đ
                </option>
              ))}
            </select>
            {shouldShowError("printerId") && errors.printerId && (
              <small className="field-error">{errors.printerId}</small>
            )}
          </label>
        )}

        {selectedPrinter && (
          <div className="mt-2 grid grid-cols-3 gap-2 rounded-lg bg-surface-2 p-3 text-xs text-text-secondary">
            <Stat
              label="Công suất"
              value={`${selectedPrinter.powerKw} kW`}
            />
            <Stat
              label="Giá mua"
              value={`${formatNumber(selectedPrinter.purchasePrice)}đ`}
            />
            <Stat
              label="Tuổi thọ"
              value={`${formatNumber(selectedPrinter.lifetimeHours)} giờ`}
            />
          </div>
        )}
      </div>

      {/* Nhựa */}
      <div className="block">
        <div className="block-head">
          <h2 className="section-label">
            <MaterialIcon className="text-accent" /> Nhựa
          </h2>
        </div>

        {activePlastics.length === 0 ? (
          <EmptyState
            text="Chưa có loại nhựa nào. Giá nhựa chiếm phần lớn giá vốn nên không thể bỏ qua."
            linkTo="/materials"
            linkLabel="Thêm loại nhựa đầu tiên"
          />
        ) : (
          <label className="field">
            <span>Chọn loại nhựa</span>
            <select
              value={value.plasticId}
              onChange={(e) => set("plasticId", e.target.value)}
              onBlur={() => markTouched("plasticId")}
              className={`input-field ${shouldShowError("plasticId") && errors.plasticId ? "input-error" : ""}`}
            >
              <option value="">— Chọn loại nhựa —</option>
              {activePlastics.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.type}) · {formatNumber(p.pricePerKg)}đ/kg
                </option>
              ))}
            </select>
            {shouldShowError("plasticId") && errors.plasticId && (
              <small className="field-error">{errors.plasticId}</small>
            )}
          </label>
        )}

        <label className="field">
          <span>Khối lượng nhựa / 1 sản phẩm (gram)</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            placeholder="Ví dụ: 100"
            value={value.weight}
            onChange={(e) => set("weight", e.target.value)}
            onBlur={() => markTouched("weight")}
            className={`input-field ${shouldShowError("weight") && errors.weight ? "input-error" : ""}`}
          />
          {shouldShowError("weight") && errors.weight && (
            <small className="field-error">{errors.weight}</small>
          )}
        </label>

        {selectedPlastic && (
          <div className="mt-1 flex items-center gap-2 text-xs text-text-secondary">
            <span
              className="h-3 w-3 rounded-full border border-line"
              style={{ background: selectedPlastic.color }}
            />
            <span>
              {selectedPlastic.manufacturer} ·{" "}
              {formatNumber(selectedPlastic.pricePerKg)}đ/kg
            </span>
          </div>
        )}
      </div>

      {/* Thông số in */}
      <div className="block">
        <div className="block-head">
          <h2 className="section-label">Thông số in &amp; chi phí</h2>
        </div>

        <div className="field-row">
          <label className="field">
            <span>Thời gian in / 1 sản phẩm (giờ)</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              placeholder="Ví dụ: 5"
              value={value.hours}
              onChange={(e) => set("hours", e.target.value)}
              onBlur={() => markTouched("hours")}
              className={`input-field ${shouldShowError("hours") && errors.hours ? "input-error" : ""}`}
            />
            {shouldShowError("hours") && errors.hours && (
              <small className="field-error">{errors.hours}</small>
            )}
          </label>

          <label className="field">
            <span>Giá điện (đ/kWh)</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              value={value.electricity}
              onChange={(e) => set("electricity", e.target.value)}
              onBlur={() => markTouched("electricity")}
              className={`input-field ${shouldShowError("electricity") && errors.electricity ? "input-error" : ""}`}
            />
            {shouldShowError("electricity") && errors.electricity && (
              <small className="field-error">{errors.electricity}</small>
            )}
          </label>
        </div>

        <div className="field-row">
          <label className="field">
            <span>Thời gian xử lý kỹ thuật / 1 sản phẩm (giờ)</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              placeholder="Thiết kế, setup, hoàn thiện..."
              value={value.technicalHours}
              onChange={(e) => set("technicalHours", e.target.value)}
              onBlur={() => markTouched("technicalHours")}
              className={`input-field ${shouldShowError("technicalHours") && errors.technicalHours ? "input-error" : ""}`}
            />
            {shouldShowError("technicalHours") && errors.technicalHours && (
              <small className="field-error">{errors.technicalHours}</small>
            )}
          </label>

          <label className="field">
            <span>Đơn giá công/giờ (đ)</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              placeholder="Ví dụ: 50000"
              value={value.technicalRate}
              onChange={(e) => set("technicalRate", e.target.value)}
              onBlur={() => markTouched("technicalRate")}
              className={`input-field ${shouldShowError("technicalRate") && errors.technicalRate ? "input-error" : ""}`}
            />
            {shouldShowError("technicalRate") && errors.technicalRate && (
              <small className="field-error">{errors.technicalRate}</small>
            )}
          </label>
        </div>

        <div className="field-row">
          <label className="field">
            <span>Số lượng sản phẩm / lô</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              step="1"
              placeholder="1"
              value={value.quantity}
              onChange={(e) => set("quantity", e.target.value)}
              onBlur={() => markTouched("quantity")}
              className={`input-field ${shouldShowError("quantity") && errors.quantity ? "input-error" : ""}`}
            />
            {shouldShowError("quantity") && errors.quantity && (
              <small className="field-error">{errors.quantity}</small>
            )}
          </label>

          <label className="field">
            <span>Dự phòng in hỏng (%)</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              placeholder="Ví dụ: 5"
              value={value.risk}
              onChange={(e) => set("risk", e.target.value)}
              onBlur={() => markTouched("risk")}
              className={`input-field ${shouldShowError("risk") && errors.risk ? "input-error" : ""}`}
            />
            {shouldShowError("risk") && errors.risk && (
              <small className="field-error">{errors.risk}</small>
            )}
          </label>
        </div>

        <div className="field-row">
          <label className="field">
            <span>Chi phí khác (đ, cho cả lô)</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              placeholder="Đóng gói, phụ kiện..."
              value={value.otherCost}
              onChange={(e) => set("otherCost", e.target.value)}
              onBlur={() => markTouched("otherCost")}
              className={`input-field ${shouldShowError("otherCost") && errors.otherCost ? "input-error" : ""}`}
            />
            {shouldShowError("otherCost") && errors.otherCost && (
              <small className="field-error">{errors.otherCost}</small>
            )}
            <small className="text-text-muted">
              Sẽ được chia đều cho số lượng sản phẩm.
            </small>
          </label>

          <label className="field">
            <span>Biên lợi nhuận (%)</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              placeholder="Ví dụ: 20"
              value={value.margin}
              onChange={(e) => set("margin", e.target.value)}
              onBlur={() => markTouched("margin")}
              className={`input-field ${shouldShowError("margin") && errors.margin ? "input-error" : ""}`}
            />
            {shouldShowError("margin") && errors.margin && (
              <small className="field-error">{errors.margin}</small>
            )}
            <small className="text-text-muted">
              Để trống nếu chỉ cần xem giá vốn.
            </small>
          </label>
        </div>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="btn btn-ghost self-start"
      >
        Đặt lại
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-text-muted">
        {label}
      </div>
      <div className="font-medium text-text">{value}</div>
    </div>
  );
}

function EmptyState({
  text,
  linkTo,
  linkLabel,
}: {
  text: string;
  linkTo: string;
  linkLabel: string;
}) {
  return (
    <div className="empty-state">
      <div className="text-empty-icon">
        <EmptyBoxIcon />
      </div>
      <p>{text}</p>
      <Link to={linkTo} className="btn btn-primary">
        {linkLabel}
      </Link>
    </div>
  );
}
