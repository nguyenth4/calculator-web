import { Modal } from "./Modal";
import { AlertIcon } from "./Icons";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Xóa",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} title={title} onClose={onCancel} maxWidthClassName="max-w-sm">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-muted text-danger">
          <AlertIcon />
        </div>
        <p className="text-sm leading-relaxed text-text-secondary">{message}</p>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn btn-ghost">
          Hủy
        </button>
        <button type="button" onClick={onConfirm} className="btn btn-danger">
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
