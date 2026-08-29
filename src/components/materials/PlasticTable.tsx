import { useState } from "react";
import type { Plastic } from "../../types";
import { formatVND } from "../../utils/currency";
import { StatusBadge } from "../common/StatusBadge";
import { EditIcon, TrashIcon, EyeIcon, SortIcon } from "../common/Icons";

export type PlasticSortKey = "name" | "type" | "pricePerKg" | "createdAt";

interface PlasticTableProps {
  items: Plastic[];
  sortKey: PlasticSortKey;
  sortDir: "asc" | "desc";
  onSort: (key: PlasticSortKey) => void;
  onEdit: (item: Plastic) => void;
  onDelete: (item: Plastic) => void;
  onView: (item: Plastic) => void;
}

function SortHeader({
  label,
  sortKeyName,
  activeKey,
  dir,
  onSort,
}: {
  label: string;
  sortKeyName: PlasticSortKey;
  activeKey: PlasticSortKey;
  dir: "asc" | "desc";
  onSort: (key: PlasticSortKey) => void;
}) {
  const active = activeKey === sortKeyName;
  return (
    <th>
      <button type="button" onClick={() => onSort(sortKeyName)} className={`th-sort ${active ? "active" : ""}`}>
        {label}
        <SortIcon style={{ transform: active && dir === "desc" ? "rotate(180deg)" : undefined }} />
      </button>
    </th>
  );
}

export function PlasticTable({ items, sortKey, sortDir, onSort, onEdit, onDelete, onView }: PlasticTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (items.length === 0) {
    return <p className="empty-hint py-6 text-center">Không tìm thấy loại nhựa phù hợp.</p>;
  }

  return (
    <>
      {/* Desktop table */}
      <div className="table-wrap hidden md:block">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <SortHeader label="Tên nhựa" sortKeyName="name" activeKey={sortKey} dir={sortDir} onSort={onSort} />
              <SortHeader label="Loại" sortKeyName="type" activeKey={sortKey} dir={sortDir} onSort={onSort} />
              <SortHeader label="Giá/kg" sortKeyName="pricePerKg" activeKey={sortKey} dir={sortDir} onSort={onSort} />
              <th>Màu</th>
              <th>Nhà sản xuất</th>
              <th>Trạng thái</th>
              <SortHeader label="Ngày tạo" sortKeyName="createdAt" activeKey={sortKey} dir={sortDir} onSort={onSort} />
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td className="text-text-muted">{p.id.slice(0, 8)}</td>
                <td className="font-medium text-text">{p.name}</td>
                <td>{p.type}</td>
                <td className="font-medium">{formatVND(p.pricePerKg)}/kg</td>
                <td>
                  <span className="swatch-dot" style={{ background: p.color }} />
                </td>
                <td>{p.manufacturer}</td>
                <td>
                  <StatusBadge status={p.status} />
                </td>
                <td className="text-text-secondary">{p.createdAt}</td>
                <td>
                  <div className="row-acts">
                    <button type="button" onClick={() => onView(p)} aria-label="Xem chi tiết">
                      <EyeIcon />
                    </button>
                    <button type="button" onClick={() => onEdit(p)} aria-label="Sửa">
                      <EditIcon />
                    </button>
                    <button type="button" onClick={() => onDelete(p)} aria-label="Xóa" className="danger">
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="item-list md:hidden">
        {items.map((p) => {
          const expanded = expandedId === p.id;
          return (
            <li key={p.id} className="item-card">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2 text-left"
                onClick={() => setExpandedId(expanded ? null : p.id)}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="swatch-dot shrink-0" style={{ background: p.color }} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-text">{p.name}</p>
                    <p className="text-xs text-text-secondary">
                      {p.type} · {formatVND(p.pricePerKg)}/kg
                    </p>
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </button>

              {expanded && (
                <div className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm">
                  <Row label="Nhà sản xuất" value={p.manufacturer} />
                  <Row label="Mô tả" value={p.description || "—"} />
                  <Row label="Ngày tạo" value={p.createdAt} />
                  <div className="mt-2 flex justify-end gap-2">
                    <button type="button" onClick={() => onEdit(p)} className="btn btn-ghost !px-2.5 !py-1.5 text-xs">
                      <EditIcon /> Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(p)}
                      className="btn btn-ghost !px-2.5 !py-1.5 text-xs text-danger"
                    >
                      <TrashIcon /> Xóa
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-text-muted">{label}</span>
      <span className="text-right text-text">{value}</span>
    </div>
  );
}
