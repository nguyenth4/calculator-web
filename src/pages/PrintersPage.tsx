import { useState } from "react";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import type { Printer, PrinterInput } from "../types";
import { PrinterForm } from "../components/printers/PrinterForm";
import { PrinterTable } from "../components/printers/PrinterTable";
import { ConfirmDialog } from "../components/common/ConfirmDialog";

export function PrintersPage() {
  const { printers, addPrinter, updatePrinter, removePrinter } = useData();
  const { showToast } = useToast();

  const [editing, setEditing] = useState<Printer | null>(null);
  const [deleting, setDeleting] = useState<Printer | null>(null);

  const handleSubmit = (input: PrinterInput) => {
    if (editing) {
      updatePrinter(editing.id, input);
      showToast("Đã cập nhật máy in thành công.");
      setEditing(null);
    } else {
      addPrinter(input);
      showToast("Đã thêm máy in mới thành công.");
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleting) return;
    removePrinter(deleting.id);
    showToast("Đã xóa máy in.");
    if (editing?.id === deleting.id) setEditing(null);
    setDeleting(null);
  };

  return (
    <div>
      <div className="section-head">
        <h1>Thư viện máy in</h1>
        <a
          href="https://www.youtube.com/results?search_query=3d+printer+wattage"
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-accent hover:underline"
        >
          Hướng dẫn
        </a>
      </div>

      <div className="block mb-4">
        <PrinterForm
          key={editing?.id ?? "new"}
          editing={editing}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      </div>

      <div className="card overflow-hidden">
        <PrinterTable items={printers} onEdit={setEditing} onDelete={setDeleting} />
      </div>

      <ConfirmDialog
        open={deleting !== null}
        title="Xóa máy in"
        message={`Bạn có chắc muốn xóa "${deleting?.name}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
