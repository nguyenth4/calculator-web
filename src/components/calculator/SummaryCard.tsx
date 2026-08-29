import type { CalculatorResult } from "../../utils/calculator";
import { formatVND } from "../../utils/currency";

interface SummaryCardProps {
  result: CalculatorResult | null;
  weight: number;
  hours: number;
}

export function SummaryCard({ result, weight, hours }: SummaryCardProps) {
  const hasResult = result !== null && weight > 0 && hours > 0;

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
              <span className="label">Giá vốn / sản phẩm</span>
              <strong className="price-big">
                {formatVND(result.totalCostPerUnit)}
              </strong>
            </div>

            {result.suggestedPrice !== null && (
              <div className="price-second">
                <span className="label">Giá bán đề xuất / sản phẩm</span>
                <strong>{formatVND(result.suggestedPrice)}</strong>
              </div>
            )}

            <div className="breakdown">
              <h2 className="section-label">Chi tiết chi phí / sản phẩm</h2>
              <ul className="flex flex-col gap-2">
                <BreakdownRow
                  label="Chi phí nhựa"
                  value={result.plasticCost}
                  total={result.subtotalCost}
                />
                <BreakdownRow
                  label="Chi phí điện"
                  value={result.electricityCost}
                  total={result.subtotalCost}
                />
                <BreakdownRow
                  label="Khấu hao máy"
                  value={result.depreciationCost}
                  total={result.subtotalCost}
                />
                <BreakdownRow
                  label="Tiền công kỹ thuật"
                  value={result.laborCost}
                  total={result.subtotalCost}
                />
                {result.otherCostPerUnit > 0 && (
                  <BreakdownRow
                    label="Chi phí khác"
                    value={result.otherCostPerUnit}
                    total={result.subtotalCost}
                  />
                )}
                {result.riskCost > 0 && (
                  <BreakdownRow
                    label="Dự phòng in hỏng"
                    value={result.riskCost}
                    total={result.subtotalCost}
                  />
                )}
              </ul>

              <div className="totals">
                <div className="total-row">
                  <span>Khối lượng nhựa</span>
                  <strong>{weight.toLocaleString("vi-VN")} g</strong>
                </div>
                <div className="total-row">
                  <span>Thời gian in</span>
                  <strong>{hours.toLocaleString("vi-VN")} giờ</strong>
                </div>
                <div className="total-row">
                  <span>Số lượng</span>
                  <strong>{result.quantity.toLocaleString("vi-VN")}</strong>
                </div>
                <div className="total-row border-t border-line pt-2 mt-1">
                  <span className="font-semibold text-text">
                    GIÁ VỐN / SẢN PHẨM
                  </span>
                  <strong className="text-accent">
                    {formatVND(result.totalCostPerUnit)}
                  </strong>
                </div>
                {result.suggestedPrice !== null && (
                  <div className="total-row">
                    <span className="font-semibold text-text">
                      Giá bán đề xuất / sản phẩm
                    </span>
                    <strong className="text-ok">
                      {formatVND(result.suggestedPrice)}
                    </strong>
                  </div>
                )}
                <div className="total-row">
                  <span className="font-semibold text-text">Giá vốn cả lô</span>
                  <strong className="text-accent">
                    {formatVND(result.batchCost)}
                  </strong>
                </div>
                {result.batchPrice !== null && (
                  <div className="total-row">
                    <span className="font-semibold text-text">
                      Giá bán cả lô
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
}: {
  label: string;
  value: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <li>
      <div className="bd-head">
        <span>{label}</span>
        <span className="pct">
          {formatVND(value)} <span className="text-text-muted">({pct}%)</span>
        </span>
      </div>
      <div className="bar">
        <i style={{ width: `${pct}%` }} />
      </div>
    </li>
  );
}
