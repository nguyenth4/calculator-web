import { useMemo, useState } from "react";
import { useData } from "../../context/DataContext";
import { formatNumber, formatVND, parseNumberInput } from "../../utils/currency";
import type { CalculatorFormState, MaterialLineFormState } from "../../utils/calculatorForm";
import { MaterialIcon, PrinterIcon, EmptyBoxIcon } from "../common/Icons";
import { FormattedNumberInput } from "../common/FormattedNumberInput";
import { Link } from "react-router-dom";

interface CalculatorProps {
  value: CalculatorFormState;
  onChange: (next: CalculatorFormState) => void;
  errors: Partial<Record<keyof CalculatorFormState, string>>;
}

export function Calculator({
  value,
  onChange,
  errors,
}: CalculatorProps) {
  const { plastics, printers } = useData();
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const activePlastics = useMemo(
    () => plastics.filter((p) => p.status === "active"),
    [plastics],
  );
  const availablePrinters = printers;
  const materialWeight = value.materials.reduce(
    (total, material) => total + (parseNumberInput(material.weight) || 0),
    0,
  );
  const materialCost = value.materials.reduce((total, material) => {
    const plastic = activePlastics.find((item) => item.id === material.plasticId);
    return total + (plastic ? (parseNumberInput(material.weight) || 0) * plastic.pricePerKg / 1000 : 0);
  }, 0);

  const set = <K extends keyof CalculatorFormState>(
    key: K,
    val: CalculatorFormState[K],
  ) => {
    onChange({ ...value, [key]: val });
  };

  const updateMaterial = (id: string, patch: Partial<MaterialLineFormState>) => {
    set("materials", value.materials.map((material) =>
      material.id === id ? { ...material, ...patch } : material,
    ));
  };

  const addMaterial = () => {
    set("materials", [...value.materials, { id: crypto.randomUUID(), plasticId: "", weight: "" }]);
  };

  const removeMaterial = (id: string) => {
    set("materials", value.materials.filter((material) => material.id !== id));
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
          <div className="field-row calculator-printer-row">
            <label className="field">
              <span>Máy in</span>
              <select
                value={value.printerId}
                onChange={(e) => set("printerId", e.target.value)}
                onBlur={() => markTouched("printerId")}
                className={`input-field ${shouldShowError("printerId") && errors.printerId ? "input-error" : ""}`}
              >
                <option value="">— Chọn máy in —</option>
                {availablePrinters.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {shouldShowError("printerId") && errors.printerId && (
                <small className="field-error">{errors.printerId}</small>
              )}
            </label>
            <label className="field">
              <span>Nhập từ G-code <InfoHint text="Chọn tệp G-code để lưu cùng lần tính giá. Thời gian in và vật liệu vẫn được nhập theo dữ liệu slicer." /></span>
              <input type="file" accept=".gcode,.g" className="input-field gcode-input" />
              <a className="field-hint gcode-guide" href="https://wiki.bambulab.com/en/software/bambu-studio/quick-start" target="_blank" rel="noreferrer">
                Cách xuất G-code từ slicer ↗
              </a>
            </label>
          </div>
        )}
      </div>

      {/* Thông số in */}
      <div className="block">
        <div className="block-head">
          <h2 className="section-label">Thông số in</h2>
        </div>

        <div className="field-row calculator-print-settings">
          <label className="field">
            <span>Thời gian in</span>
            <TimeInputs
              hours={value.hours}
              minutes={value.minutes}
              onHoursChange={(hours) => set("hours", hours)}
              onMinutesChange={(minutes) => set("minutes", minutes)}
              onBlur={() => {
                markTouched("hours");
                markTouched("minutes");
              }}
              hasError={shouldShowError("hours") && Boolean(errors.hours)}
            />
            {shouldShowError("hours") && errors.hours && <small className="field-error">{errors.hours}</small>}
            {shouldShowError("minutes") && errors.minutes && <small className="field-error">{errors.minutes}</small>}
          </label>
          <label className="field">
            <span>Thời gian xử lý kỹ thuật <InfoHint text="Tổng thời gian thiết kế, setup và hoàn thiện cho cả khay." /></span>
            <TimeInputs
              hours={value.technicalHours}
              minutes={value.technicalMinutes}
              onHoursChange={(hours) => set("technicalHours", hours)}
              onMinutesChange={(minutes) => set("technicalMinutes", minutes)}
              onBlur={() => {
                markTouched("technicalHours");
                markTouched("technicalMinutes");
              }}
              hasError={shouldShowError("technicalHours") && Boolean(errors.technicalHours)}
            />
            {shouldShowError("technicalHours") && errors.technicalHours && <small className="field-error">{errors.technicalHours}</small>}
            {shouldShowError("technicalMinutes") && errors.technicalMinutes && <small className="field-error">{errors.technicalMinutes}</small>}
          </label>
          <label className="field">
            <span>Số lượng <InfoHint text="Số sản phẩm trong cùng một khay in." /></span>
            <FormattedNumberInput
              inputMode="numeric"
              placeholder="1"
              value={value.quantity}
              onChange={(number) => set("quantity", number)}
              onBlur={() => markTouched("quantity")}
              className={`input-field ${shouldShowError("quantity") && errors.quantity ? "input-error" : ""}`}
            />
            {shouldShowError("quantity") && errors.quantity && <small className="field-error">{errors.quantity}</small>}
          </label>
        </div>
      </div>

      {/* Nhựa */}
      <div className="block material-block">
        <div className="block-head">
          <h2 className="section-label">
            <MaterialIcon className="text-accent" /> Nhựa
          </h2>
          {materialWeight > 0 && (
            <span className="material-total">
              {formatNumber(materialWeight)} g · {formatVND(materialCost)}
            </span>
          )}
        </div>

        {activePlastics.length === 0 ? (
          <EmptyState
            text="Chưa có loại nhựa nào. Giá nhựa chiếm phần lớn giá vốn nên không thể bỏ qua."
            linkTo="/materials"
            linkLabel="Thêm loại nhựa đầu tiên"
          />
        ) : (
          <div className="flex flex-col gap-2">
            {value.materials.map((material) => {
              const selectedPlastic = activePlastics.find((plastic) => plastic.id === material.plasticId);
              const lineCost = selectedPlastic
                ? (parseNumberInput(material.weight) || 0) * selectedPlastic.pricePerKg / 1000
                : 0;
              return (
                <div key={material.id} className="material-row">
                  <label className="field material-plastic-field">
                    <span className="sr-only">Loại nhựa</span>
                    {selectedPlastic && (
                      <i
                        className="material-swatch"
                        style={{ background: selectedPlastic.color }}
                        aria-label={`Màu ${selectedPlastic.color}`}
                      />
                    )}
                    <select
                      value={material.plasticId}
                      onChange={(event) => updateMaterial(material.id, { plasticId: event.target.value })}
                      onBlur={() => markTouched("materials")}
                      className={`input-field ${shouldShowError("materials") && errors.materials ? "input-error" : ""}`}
                    >
                      <option value="">— Chọn loại nhựa —</option>
                      {activePlastics.map((plastic) => (
                        <option key={plastic.id} value={plastic.id}>
                          {plastic.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field material-weight-field">
                    <span className="sr-only">Gram</span>
                    <FormattedNumberInput
                      placeholder="100"
                      value={material.weight}
                      onChange={(weight) => updateMaterial(material.id, { weight })}
                      onBlur={() => markTouched("materials")}
                      className={`input-field ${shouldShowError("materials") && errors.materials ? "input-error" : ""}`}
                    />
                  </label>
                  {value.materials.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMaterial(material.id)}
                      className="btn btn-ghost material-remove"
                      aria-label="Xóa loại nhựa"
                    >
                      ×
                    </button>
                  )}
                  <span className="material-line-cost">{formatVND(lineCost)}</span>
                </div>
              );
            })}
            {shouldShowError("materials") && errors.materials && (
              <small className="field-error">{errors.materials}</small>
            )}
            <button type="button" onClick={addMaterial} className="btn btn-ghost material-add self-start">
              + Thêm loại nhựa
            </button>
          </div>
        )}
      </div>

      {/* Chi phí khác */}
      <div className="block">
        <div className="block-head">
          <h2 className="section-label">Chi phí khác</h2>
        </div>

        <label className="field">
            <span>Chi phí khác <InfoHint text="Tổng các khoản như đóng gói và phụ kiện cho cả khay; chi phí được chia đều theo số lượng." /></span>
            <FormattedNumberInput
              value={value.otherCost}
              onChange={(number) => set("otherCost", number)}
              onBlur={() => markTouched("otherCost")}
              className={`input-field ${shouldShowError("otherCost") && errors.otherCost ? "input-error" : ""}`}
            />
            {shouldShowError("otherCost") && errors.otherCost && (
              <small className="field-error">{errors.otherCost}</small>
            )}
        </label>
      </div>

    </div>
  );
}

function TimeInputs({
  hours,
  minutes,
  onHoursChange,
  onMinutesChange,
  onBlur,
  hasError,
}: {
  hours: string;
  minutes: string;
  onHoursChange: (value: string) => void;
  onMinutesChange: (value: string) => void;
  onBlur: () => void;
  hasError: boolean;
}) {
  return (
    <div className="time-inputs">
      <label>
        <FormattedNumberInput inputMode="numeric" value={hours} onChange={onHoursChange} onBlur={onBlur} className={`input-field ${hasError ? "input-error" : ""}`} />
        <span>giờ</span>
      </label>
      <label>
        <FormattedNumberInput inputMode="numeric" value={minutes} onChange={onMinutesChange} onBlur={onBlur} className="input-field" />
        <span>phút</span>
      </label>
    </div>
  );
}

function InfoHint({ text }: { text: string }) {
  return <span className="inline-info" title={text} aria-label={text}>i</span>;
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
