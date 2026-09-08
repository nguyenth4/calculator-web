/** Pure pricing calculation logic — kept independent from any UI code. */

import { roundToNearest500, roundUpTo500 } from "./currency";
import type { ProfitMethod } from "../types";

export interface CalculatorInput {
  /** Chi phí của từng loại nhựa cho cả lô in, đ */
  plasticCosts: number[];
  /** Công suất máy in, kW */
  powerKw: number;
  /** Thời gian in cho cả lô, giờ */
  printHours: number;
  /** Giá điện, đ/kWh */
  electricityPricePerKwh: number;
  /** Giá mua máy in, đ */
  purchasePrice: number;
  /** Tuổi thọ máy in, giờ */
  lifetimeHours: number;
  /** Thời gian xử lý kỹ thuật (thiết kế, setup, hoàn thiện...) cho cả lô, giờ */
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
  /** Markup tính trên giá vốn, margin tính trên giá bán */
  profitMethod?: ProfitMethod;
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
  /** Tỷ lệ dự phòng in hỏng đã áp dụng, % */
  riskPercent: number;
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
 * Tính toán chi phí in 3D theo lô, rồi phân bổ về một sản phẩm, theo mô hình:
 *
 * Chi phí nhựa lô     = tổng(Khối lượng (g) x Giá nhựa (đ/kg) / 1000)
 * Chi phí điện lô     = làm tròn lên 500đ của (Công suất x Thời gian in x Giá điện)
 * Khấu hao máy lô     = làm tròn gần nhất đến 500đ của ((Giá mua máy / Tuổi thọ) x Thời gian in)
 * Tiền công kỹ thuật  = Thời gian xử lý kỹ thuật lô (giờ) x Đơn giá công (đ/giờ)
 * Giá vốn trước DP lô = Nhựa + Điện + Khấu hao + Công kỹ thuật + Chi phí khác lô
 * Dự phòng in hỏng lô = làm tròn gần nhất đến 500đ của (Giá vốn trước DP lô x % dự phòng)
 * Giá vốn/sản phẩm    = làm tròn lên 500đ của ((Giá vốn lô + Dự phòng lô) / Số lượng)
 * Giá bán đề xuất     = làm tròn lên 500đ của (Giá vốn/sản phẩm x (1 + % biên lợi nhuận))
 */
export function calculatePrintCost(input: CalculatorInput): CalculatorResult {
  const safe = (value: number) => (Number.isFinite(value) && value > 0 ? value : 0);
  const safeNonNeg = (value: number) => (Number.isFinite(value) && value >= 0 ? value : 0);

  const quantity = safe(input.quantity) || 1;

  const plasticCostBatch = input.plasticCosts.reduce((total, cost) => total + safe(cost), 0);
  const electricityCostBatch = roundUpTo500(
    safe(input.powerKw) * safe(input.printHours) * safeNonNeg(input.electricityPricePerKwh),
  );
  const depreciationCostBatch = safe(input.lifetimeHours) > 0
    ? roundToNearest500((safeNonNeg(input.purchasePrice) / input.lifetimeHours) * safe(input.printHours))
    : 0;
  const laborCostBatch = safeNonNeg(input.technicalHours) * safeNonNeg(input.technicalRatePerHour);
  const otherCostBatch = safeNonNeg(input.otherCost);

  const subtotalBatchCost = plasticCostBatch + electricityCostBatch + depreciationCostBatch + laborCostBatch + otherCostBatch;
  const riskPercent = safeNonNeg(input.riskPercent);
  const riskBatchCost = roundToNearest500(subtotalBatchCost * (riskPercent / 100));
  const totalCostPerUnit = roundUpTo500((subtotalBatchCost + riskBatchCost) / quantity);

  const plasticCost = plasticCostBatch / quantity;
  const electricityCost = electricityCostBatch / quantity;
  const depreciationCost = depreciationCostBatch / quantity;
  const laborCost = laborCostBatch / quantity;
  const otherCostPerUnit = otherCostBatch / quantity;
  const subtotalCost = subtotalBatchCost / quantity;
  const riskCost = riskBatchCost / quantity;

  const profitPercent = safeNonNeg(input.marginPercent ?? 0);
  const priceMultiplier = input.profitMethod === "margin" && profitPercent < 100
    ? 1 / (1 - profitPercent / 100)
    : 1 + profitPercent / 100;
  const suggestedPrice = profitPercent > 0
    ? roundUpTo500(totalCostPerUnit * priceMultiplier)
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
    riskPercent,
    subtotalCost,
    totalCostPerUnit,
    suggestedPrice,
    quantity,
    batchCost,
    batchPrice,
  };
}
