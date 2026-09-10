import { useState } from "react";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import type { Plastic, PlasticInput } from "../types";
import { PlasticForm } from "../components/materials/PlasticForm";
import { PlasticTable } from "../components/materials/PlasticTable";
import { ConfirmDialog } from "../components/common/ConfirmDialog";

export function MaterialsPage() {
  const { plastics, addPlastic, updatePlastic, removePlastic } = useData();
  const { showToast } = useToast();

  const [editing, setEditing] = useState<Plastic | null>(null);
  const [deleting, setDeleting] = useState<Plastic | null>(null);

  const handleSubmit = async (input: PlasticInput) => {
    if (editing) {
      await updatePlastic(editing.id, input);
      showToast("Đã cập nhật loại nhựa thành công.");
    } else {
      await addPlastic(input);
      showToast("Đã thêm loại nhựa mới thành công.");
    }
    setEditing(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleting) return;
    await removePlastic(deleting.id);
    showToast("Đã xóa loại nhựa.");
    setDeleting(null);
  };

  return (
    <div>
      <div className="section-head">
        <h1>Thư viện nhựa</h1>
        <a
          href="https://inkiri.vn/huong-dan/chi-phi-nhua-in-3d/"
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-accent hover:underline"
        >
          Hướng dẫn
        </a>
      </div>

      <div className="block mb-4">
        <PlasticForm
          key={editing?.id ?? "new"}
          editing={editing}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      </div>

      <div className="card p-3">
        <PlasticTable
          items={plastics}
          onEdit={setEditing}
          onDelete={setDeleting}
        />
      </div>

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
