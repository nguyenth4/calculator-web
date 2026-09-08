/** Pure form-state helpers for the calculator page, kept separate from UI components
 *  so that Calculator.tsx only exports a component (better fast-refresh behaviour). */

import { parseNumberInput } from "./currency";
import { requireNonNegativeNumber, requirePositiveInteger } from "./validation";

export interface CalculatorFormState {
  materials: MaterialLineFormState[];
  printerId: string;
  /** Thời gian in, giờ / 1 sản phẩm */
  hours: string;
  /** Phần phút của thời gian in / 1 sản phẩm */
  minutes: string;
  electricity: string;
  /** Thời gian xử lý kỹ thuật, giờ cho cả lô */
  technicalHours: string;
  /** Phần phút của thời gian xử lý kỹ thuật cho cả lô */
  technicalMinutes: string;
  /** Đơn giá công xử lý kỹ thuật, đ/giờ */
  technicalRate: string;
  /** Số lượng sản phẩm trong lô in */
  quantity: string;
  /** Chi phí khác cho cả lô, đ */
  otherCost: string;
  /** Dự phòng in hỏng, % */
  risk: string;
  margin: string;
}

export interface MaterialLineFormState {
  id: string;
  plasticId: string;
  /** Khối lượng nhựa, gram / 1 sản phẩm */
  weight: string;
}

export const DEFAULT_FORM_STATE: CalculatorFormState = {
  materials: [{ id: crypto.randomUUID(), plasticId: "", weight: "" }],
  printerId: "",
  hours: "",
  minutes: "0",
  electricity: "3500",
  technicalHours: "0",
  technicalMinutes: "0",
  technicalRate: "0",
  quantity: "1",
  otherCost: "0",
  risk: "0",
  margin: "20",
};

export function validateCalculatorForm(
  form: CalculatorFormState,
): Partial<Record<keyof CalculatorFormState, string>> {
  const errors: Partial<Record<keyof CalculatorFormState, string>> = {};

  if (form.materials.length === 0) errors.materials = "Vui lòng thêm ít nhất một loại nhựa.";
  if (form.materials.some((material) => !material.plasticId || parseNumberInput(material.weight) <= 0)) {
    errors.materials = "Chọn nhựa và nhập khối lượng lớn hơn 0 cho mỗi dòng.";
  }
  if (!form.printerId) errors.printerId = "Vui lòng chọn máy in.";

  const hours = parseNumberInput(form.hours) || 0;
  const minutes = parseNumberInput(form.minutes);
  const validMinutes = Number.isInteger(minutes) && minutes >= 0 && minutes < 60;
  errors.minutes = validMinutes ? undefined : "Phút phải là số nguyên từ 0 đến 59.";
  errors.hours = hours + (validMinutes ? minutes / 60 : 0) > 0
    ? undefined
    : "Thời gian in phải lớn hơn 0.";

  const electricity = parseNumberInput(form.electricity);
  errors.electricity = requireNonNegativeNumber(electricity, "Chi phí điện");

  const technicalHours = parseNumberInput(form.technicalHours);
  errors.technicalHours = requireNonNegativeNumber(technicalHours, "Thời gian xử lý kỹ thuật");
  const technicalMinutes = parseNumberInput(form.technicalMinutes);
  errors.technicalMinutes = Number.isInteger(technicalMinutes) && technicalMinutes >= 0 && technicalMinutes < 60
    ? undefined
    : "Phút phải là số nguyên từ 0 đến 59.";

  const technicalRate = parseNumberInput(form.technicalRate);
  errors.technicalRate = requireNonNegativeNumber(technicalRate, "Đơn giá công/giờ");

  const quantity = parseNumberInput(form.quantity);
  errors.quantity =
    form.quantity === "" ? undefined : requirePositiveInteger(quantity, "Số lượng");

  const otherCost = parseNumberInput(form.otherCost);
  errors.otherCost = requireNonNegativeNumber(otherCost, "Chi phí khác");

  const risk = parseNumberInput(form.risk);
  errors.risk = requireNonNegativeNumber(risk, "Dự phòng in hỏng");

  if (form.margin !== "") {
    const margin = parseNumberInput(form.margin);
    errors.margin = requireNonNegativeNumber(margin, "Biên lợi nhuận");
  }

  return errors;
}
