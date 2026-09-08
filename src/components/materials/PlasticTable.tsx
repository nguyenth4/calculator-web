import type { Plastic } from "../../types";
import { formatVND } from "../../utils/currency";
import { EditIcon, TrashIcon } from "../common/Icons";

interface PlasticTableProps {
  items: Plastic[];
  onEdit: (item: Plastic) => void;
  onDelete: (item: Plastic) => void;
}

export function PlasticTable({ items, onEdit, onDelete }: PlasticTableProps) {
  if (items.length === 0) {
    return <p className="empty-hint py-6 text-center">Chưa có loại nhựa nào.</p>;
  }

  return (
    <ul className="item-list">
      {items.map((p) => (
        <li key={p.id} className="item-card">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="swatch-dot shrink-0" style={{ background: p.color }} />
              <div className="min-w-0">
                <p className="truncate font-semibold text-text">{p.name}</p>
                <p className="text-xs text-text-secondary">{p.type} · {formatVND(p.pricePerKg)}/kg</p>
              </div>
            </div>
            <div className="row-acts">
              <button type="button" onClick={() => onEdit(p)} aria-label="Sửa">
                <EditIcon />
              </button>
              <button type="button" onClick={() => onDelete(p)} aria-label="Xóa" className="danger">
                <TrashIcon />
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
