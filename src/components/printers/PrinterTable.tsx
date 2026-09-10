import type { Printer } from "../../types";
import { formatVND, formatNumber } from "../../utils/currency";
import { EditIcon, TrashIcon } from "../common/Icons";

interface PrinterTableProps {
  items: Printer[];
  canManage: boolean;
  onEdit: (item: Printer) => void;
  onDelete: (item: Printer) => void;
}

export function PrinterTable({ items, canManage, onEdit, onDelete }: PrinterTableProps) {
  if (items.length === 0) {
    return <p className="empty-hint py-6 text-center">Chưa có máy in nào.</p>;
  }

  return (
    <ul className="item-list">
      {items.map((p) => (
        <li key={p.id} className="item-card">
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 truncate font-semibold text-text">{p.name}</p>
            {canManage && (
              <div className="row-acts">
                <button type="button" onClick={() => onEdit(p)} aria-label="Sửa">
                  <EditIcon />
                </button>
                <button type="button" onClick={() => onDelete(p)} aria-label="Xóa" className="danger">
                  <TrashIcon />
                </button>
              </div>
            )}
          </div>
          <p className="mt-1 text-xs text-text-secondary">
            {p.powerKw} kW · {formatVND(p.purchasePrice)} · {formatNumber(p.lifetimeHours)}h
          </p>
        </li>
      ))}
    </ul>
  );
}
