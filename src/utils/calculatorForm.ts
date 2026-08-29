/** Pure form-state helpers for the calculator page, kept separate from UI components
 *  so that Calculator.tsx only exports a component (better fast-refresh behaviour). */

import { parseNumberInput } from "./currency";
import { requirePositiveNumber, requireNonNegativeNumber, requirePositiveInteger } from "./validation";

export interface CalculatorFormState {
  plasticId: string;
  printerId: string;
  /** Khối lượng nhựa, gram / 1 sản phẩm */
  weight: string;
  /** Thời gian in, giờ / 1 sản phẩm */
  hours: string;
  electricity: string;
  /** Thời gian xử lý kỹ thuật, giờ / 1 sản phẩm */
  technicalHours: string;
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

export const DEFAULT_FORM_STATE: CalculatorFormState = {
  plasticId: "",
  printerId: "",
  weight: "",
  hours: "",
  electricity: "3500",
  technicalHours: "0",
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

  if (!form.plasticId) errors.plasticId = "Vui lòng chọn loại nhựa.";
  if (!form.printerId) errors.printerId = "Vui lòng chọn máy in.";

  const weight = parseNumberInput(form.weight);
  errors.weight = form.weight === "" ? undefined : requirePositiveNumber(weight, "Khối lượng nhựa");

  const hours = parseNumberInput(form.hours);
  errors.hours = form.hours === "" ? undefined : requirePositiveNumber(hours, "Thời gian in");

  const electricity = parseNumberInput(form.electricity);
  errors.electricity = requireNonNegativeNumber(electricity, "Chi phí điện");

  const technicalHours = parseNumberInput(form.technicalHours);
  errors.technicalHours = requireNonNegativeNumber(technicalHours, "Thời gian xử lý kỹ thuật");

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
