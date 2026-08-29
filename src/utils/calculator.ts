/** Pure pricing calculation logic — kept independent from any UI code. */

import { roundUpTo500 } from "./currency";

export interface CalculatorInput {
  /** Giá nhựa, đ/kg */
  pricePerKg: number;
  /** Khối lượng nhựa sử dụng, gram / 1 sản phẩm */
  weightGram: number;
  /** Công suất máy in, kW */
  powerKw: number;
  /** Thời gian in, giờ / 1 sản phẩm */
  printHours: number;
  /** Giá điện, đ/kWh */
  electricityPricePerKwh: number;
  /** Giá mua máy in, đ */
  purchasePrice: number;
  /** Tuổi thọ máy in, giờ */
  lifetimeHours: number;
  /** Thời gian xử lý kỹ thuật (thiết kế, setup, hoàn thiện...), giờ / 1 sản phẩm */
  technicalHours: number;
  /** Đơn giá công xử lý kỹ thuật, đ/giờ */
  technicalRatePerHour: number;
  /** Số lượng sản phẩm trong lô in */
  quantity: number;
  /** Chi phí khác cho cả lô (đóng gói, phụ kiện...), đ — sẽ chia đều theo số lượng */
  otherCost: number;
  /** Dự phòng in hỏng, % trên giá vốn trước dự phòng */
  riskPercent: number;
  /** Biên lợi nhuận mong muốn, % (tuỳ chọn) */
  marginPercent?: number;
}

export interface CalculatorResult {
  /** Chi phí nhựa / sản phẩm */
  plasticCost: number;
  /** Chi phí điện / sản phẩm */
  electricityCost: number;
  /** Khấu hao máy / sản phẩm */
  depreciationCost: number;
  /** Tiền công xử lý kỹ thuật / sản phẩm */
  laborCost: number;
  /** Chi phí khác / sản phẩm (đã chia theo số lượng) */
  otherCostPerUnit: number;
  /** Dự phòng in hỏng / sản phẩm */
  riskCost: number;
  /** Giá vốn / sản phẩm trước khi làm tròn */
  subtotalCost: number;
  /** Giá vốn / sản phẩm, đã làm tròn lên bội số 500đ */
  totalCostPerUnit: number;
  /** Giá bán đề xuất / sản phẩm, đã làm tròn lên bội số 500đ */
  suggestedPrice: number | null;
  /** Số lượng sản phẩm trong lô */
  quantity: number;
  /** Giá vốn cả lô (totalCostPerUnit x quantity) */
  batchCost: number;
  /** Giá bán cả lô (suggestedPrice x quantity) */
  batchPrice: number | null;
}

/**
 * Tính toán chi phí in 3D cho 1 sản phẩm (và cả lô), theo mô hình:
 *
 * Chi phí nhựa        = Khối lượng (g) x Giá nhựa (đ/kg) / 1000
 * Chi phí điện        = Công suất (kW) x Thời gian in (giờ) x Giá điện (đ/kWh)
 * Khấu hao máy        = (Giá mua máy / Tuổi thọ máy theo giờ) x Thời gian in (giờ)
 * Tiền công kỹ thuật  = Thời gian xử lý kỹ thuật (giờ) x Đơn giá công (đ/giờ)
 * Chi phí khác/SP     = Chi phí khác cả lô / Số lượng
 * Giá vốn trước DP    = Nhựa + Điện + Khấu hao + Công kỹ thuật + Chi phí khác/SP
 * Dự phòng in hỏng    = Giá vốn trước DP x % dự phòng
 * Giá vốn/sản phẩm    = làm tròn lên 500đ của (Giá vốn trước DP + Dự phòng in hỏng)
 * Giá bán đề xuất     = làm tròn lên 500đ của (Giá vốn/sản phẩm x (1 + % biên lợi nhuận))
 */
export function calculatePrintCost(input: CalculatorInput): CalculatorResult {
  const safe = (value: number) => (Number.isFinite(value) && value > 0 ? value : 0);
  const safeNonNeg = (value: number) => (Number.isFinite(value) && value >= 0 ? value : 0);

  const quantity = safe(input.quantity) || 1;

  const plasticCost = (safe(input.weightGram) * safe(input.pricePerKg)) / 1000;
  const electricityCost =
    safe(input.powerKw) * safe(input.printHours) * safeNonNeg(input.electricityPricePerKwh);
  const depreciationCost = safe(input.lifetimeHours) > 0
    ? (safeNonNeg(input.purchasePrice) / input.lifetimeHours) * safe(input.printHours)
    : 0;
  const laborCost = safeNonNeg(input.technicalHours) * safeNonNeg(input.technicalRatePerHour);
  const otherCostPerUnit = safeNonNeg(input.otherCost) / quantity;

  const subtotalCost = plasticCost + electricityCost + depreciationCost + laborCost + otherCostPerUnit;

  const riskCost = subtotalCost * (safeNonNeg(input.riskPercent) / 100);

  const totalCostPerUnit = roundUpTo500(subtotalCost + riskCost);

  const suggestedPrice =
    input.marginPercent !== undefined && input.marginPercent !== null && input.marginPercent > 0
      ? roundUpTo500(totalCostPerUnit * (1 + input.marginPercent / 100))
      : null;

  const batchCost = totalCostPerUnit * quantity;
  const batchPrice = suggestedPrice !== null ? suggestedPrice * quantity : null;

  return {
    plasticCost,
    electricityCost,
    depreciationCost,
    laborCost,
    otherCostPerUnit,
    riskCost,
    subtotalCost,
    totalCostPerUnit,
    suggestedPrice,
    quantity,
    batchCost,
    batchPrice,
  };
}
