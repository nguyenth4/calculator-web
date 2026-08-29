import { useMemo, useState } from "react";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import type { Plastic, PlasticInput } from "../types";
import { PlasticForm } from "../components/materials/PlasticForm";
import { PlasticTable, type PlasticSortKey } from "../components/materials/PlasticTable";
import { SearchBar } from "../components/common/SearchBar";
import { Pagination } from "../components/common/Pagination";
import { Modal } from "../components/common/Modal";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { PlusIcon } from "../components/common/Icons";
import { formatVND } from "../utils/currency";

const PAGE_SIZE = 6;

export function MaterialsPage() {
  const { plastics, addPlastic, updatePlastic, removePlastic } = useData();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortKey, setSortKey] = useState<PlasticSortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Plastic | null>(null);
  const [viewing, setViewing] = useState<Plastic | null>(null);
  const [deleting, setDeleting] = useState<Plastic | null>(null);

  const types = useMemo(() => Array.from(new Set(plastics.map((p) => p.type))).sort(), [plastics]);

  const filtered = useMemo(() => {
    let list = plastics.filter((p) => {
      const matchesSearch =
        search.trim() === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.manufacturer.toLowerCase().includes(search.toLowerCase());
      const matchesType = !typeFilter || p.type === typeFilter;
      const matchesStatus = !statusFilter || p.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });

    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "pricePerKg") cmp = a.pricePerKg - b.pricePerKg;
      else cmp = String(a[sortKey]).localeCompare(String(b[sortKey]));
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [plastics, search, typeFilter, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSort = (key: PlasticSortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const openAddForm = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEditForm = (item: Plastic) => {
    setEditing(item);
    setFormOpen(true);
  };

  const handleSubmit = (input: PlasticInput) => {
    if (editing) {
      updatePlastic(editing.id, input);
      showToast("Đã cập nhật loại nhựa thành công.");
    } else {
      addPlastic(input);
      showToast("Đã thêm loại nhựa mới thành công.");
      setPage(1);
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleting) return;
    removePlastic(deleting.id);
    showToast("Đã xóa loại nhựa.");
    setDeleting(null);
  };

  return (
    <div>
      <div className="section-head">
        <h1>Quản lý loại nhựa</h1>
        <button type="button" onClick={openAddForm} className="btn btn-primary">
          <PlusIcon /> Thêm loại nhựa
        </button>
      </div>

      <div className="filter-bar">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Tìm theo tên, nhà sản xuất..." />
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="input-field w-auto flex-none"
        >
          <option value="">Tất cả loại</option>
          {types.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-field w-auto flex-none"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Ngừng hoạt động</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <PlasticTable
          items={pageItems}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          onEdit={openEditForm}
          onDelete={setDeleting}
          onView={setViewing}
        />
        <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
      </div>

      <Modal open={formOpen} title={editing ? "Sửa loại nhựa" : "Thêm loại nhựa"} onClose={() => setFormOpen(false)}>
        <PlasticForm key={editing?.id ?? "new"} editing={editing} onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} />
      </Modal>

      <Modal open={viewing !== null} title="Chi tiết loại nhựa" onClose={() => setViewing(null)} maxWidthClassName="max-w-md">
        {viewing && (
          <div className="flex flex-col gap-2.5 text-sm">
            <div className="flex items-center gap-2.5">
              <span className="swatch-dot" style={{ background: viewing.color }} />
              <span className="text-base font-semibold text-text">{viewing.name}</span>
            </div>
            <DetailRow label="Loại nhựa" value={viewing.type} />
            <DetailRow label="Giá/kg" value={`${formatVND(viewing.pricePerKg)}/kg`} />
            <DetailRow label="Nhà sản xuất" value={viewing.manufacturer} />
            <DetailRow label="Mô tả" value={viewing.description || "—"} />
            <DetailRow label="Ngày tạo" value={viewing.createdAt} />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Xóa loại nhựa"
        message={`Bạn có chắc muốn xóa "${deleting?.name}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-line pb-2 last:border-none last:pb-0">
      <span className="text-text-muted">{label}</span>
      <span className="text-right font-medium text-text">{value}</span>
    </div>
  );
}
