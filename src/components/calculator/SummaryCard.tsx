import type { CalculatorResult } from "../../utils/calculator";
import { formatVND } from "../../utils/currency";

interface SummaryCardProps {
  result: CalculatorResult | null;
  weight: number;
  hours: number;
  profitMethod: "markup" | "margin";
  profitPercent: number;
  materials: MaterialCostDetail[];
}

interface MaterialCostDetail {
  id: string;
  name: string;
  color: string;
  weight: number;
  cost: number;
}

export function SummaryCard({ result, weight, hours, profitMethod, profitPercent, materials }: SummaryCardProps) {
  const hasResult = result !== null && weight > 0 && hours > 0;
  const profitLabel = profitMethod === "margin" ? "margin" : "markup";
  const suggestedPriceFormula = profitMethod === "margin"
    ? `Giá bán đề xuất đang dùng margin ${profitPercent}%: giá bán được tính để lợi nhuận chiếm ${profitPercent}% giá bán, rồi làm tròn lên bội số 500đ.`
    : `Giá bán đề xuất đang dùng markup ${profitPercent}%: cộng ${profitPercent}% trên giá vốn đã gồm dự phòng rủi ro. Xem Cài đặt để đổi cách tính.`;

  return (
    <div className="result-card">
      <div className="result-inner">
        <div className="result-head">
          <h2 className="section-label !mb-0">Chi tiết giá</h2>
        </div>

        {!hasResult ? (
          <p className="empty-hint">
            Chọn nhựa, máy in và nhập khối lượng, thời gian in để xem giá.
          </p>
        ) : (
          <>
            <div className="price-main">
              <span className="label-with-help">
                Giá vốn / sản phẩm
                <FormulaHelp formula="Giá vốn trên mỗi sản phẩm. Luôn làm tròn lên bội số 500đ." />
              </span>
              <strong className="price-big">
                {formatVND(result.totalCostPerUnit)}
              </strong>
            </div>

            {result.suggestedPrice !== null && (
              <div className="price-second">
                <span className="label-with-help">
                  Giá bán đề xuất ({profitPercent}% {profitLabel})
                  <FormulaHelp formula={suggestedPriceFormula} />
                </span>
                <strong>{formatVND(result.suggestedPrice)}</strong>
              </div>
            )}

            <div className="breakdown">
              <h2 className="section-label">Chi tiết giá vốn</h2>
              <ul className="flex flex-col gap-2">
                <BreakdownRow
                  label="Vật liệu"
                  value={result.plasticCost}
                  total={result.subtotalCost}
                  formula="Tổng (khối lượng nhựa (g) x giá nhựa (đ/kg) / 1.000) của cả lô, rồi chia số lượng."
                >
                  {materials.map((material) => (
                    <div className="material-cost-detail" key={material.id}>
                      <span>{material.name} {material.color} · {material.weight.toLocaleString("vi-VN")}g</span>
                      <strong>{formatVND(material.cost)}</strong>
                    </div>
                  ))}
                </BreakdownRow>
                <BreakdownRow
                  label="Chi phí điện"
                  value={result.electricityCost}
                  total={result.subtotalCost}
                  formula="Công suất máy (kW) x thời gian in (giờ) x giá điện (đ/kWh). Làm tròn lên 500đ cho cả lô, rồi chia số lượng."
                />
                <BreakdownRow
                  label="Khấu hao máy"
                  value={result.depreciationCost}
                  total={result.subtotalCost}
                  formula="Chi phí hao mòn máy in phân bổ cho lần in này: (giá máy / tổng số giờ máy chạy được trong suốt vòng đời) x số giờ in của cả khay, rồi chia số lượng sản phẩm. Làm tròn về bội số 500đ gần nhất cho cả khay."
                />
                <BreakdownRow
                  label="Tiền công kỹ thuật"
                  value={result.laborCost}
                  total={result.subtotalCost}
                  formula="Thời gian xử lý kỹ thuật (giờ) x đơn giá công (đ/giờ) của cả lô, rồi chia số lượng."
                />
                {result.otherCostPerUnit > 0 && (
                  <BreakdownRow
                    label="Chi phí khác"
                    value={result.otherCostPerUnit}
                    total={result.subtotalCost}
                    formula="Chi phí đóng gói, phụ kiện và các chi phí khác của cả lô, chia đều theo số lượng."
                  />
                )}
                {result.riskCost > 0 && (
                  <BreakdownRow
                    label="Dự phòng rủi ro"
                    value={result.riskCost}
                    total={result.subtotalCost}
                    percentage={result.riskPercent}
                    formula="Giá vốn trước dự phòng x tỷ lệ dự phòng in hỏng, làm tròn về bội số 500đ gần nhất cho cả lô, rồi chia số lượng."
                  />
                )}
              </ul>

              <div className="totals">
                <div className="total-row border-t border-line pt-2 mt-1">
                  <span className="font-semibold text-text">Giá vốn cả khay</span>
                  <strong className="text-accent">
                    {formatVND(result.batchCost)}
                  </strong>
                </div>
                {result.batchPrice !== null && (
                  <div className="total-row">
                    <span className="font-semibold text-text">
                      Lợi nhuận
                    </span>
                    <strong className="text-ok">
                      {formatVND(result.batchPrice - result.batchCost)}
                    </strong>
                  </div>
                )}
                {result.batchPrice !== null && (
                  <div className="total-row">
                    <span className="font-semibold text-text">
                      Giá bán cả khay
                    </span>
                    <strong className="text-ok">
                      {formatVND(result.batchPrice)}
                    </strong>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  total,
  percentage,
  formula,
  children,
}: {
  label: string;
  value: number;
  total: number;
  percentage?: number;
  formula: string;
  children?: React.ReactNode;
}) {
  const pct = percentage ?? (total > 0 ? Math.round((value / total) * 100) : 0);
  return (
    <li>
      <div className="bd-head">
        <span className="bd-label">
          {label}
          <FormulaHelp formula={formula} label={label} />
        </span>
        <span className="pct">
          {pct}% <span className="text-text-muted">· {formatVND(value)}</span>
        </span>
      </div>
      <div className="bar">
        <i style={{ width: `${pct}%` }} />
      </div>
      {children}
    </li>
  );
}

function FormulaHelp({ formula, label }: { formula: string; label?: string }) {
  return (
    <button
      type="button"
      className="formula-help"
      aria-label={`Công thức${label ? ` ${label}` : ""}: ${formula}`}
      data-tooltip={formula}
    >
      i
    </button>
  );
}
