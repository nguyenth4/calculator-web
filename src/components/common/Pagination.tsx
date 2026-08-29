import { ChevronLeftIcon, ChevronRightIcon } from "./Icons";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize: number;
}

export function Pagination({ page, totalPages, onPageChange, totalItems, pageSize }: PaginationProps) {
  if (totalItems === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 text-sm">
      <span className="text-text-secondary">
        Hiển thị <strong className="text-text">{from}-{to}</strong> trong{" "}
        <strong className="text-text">{totalItems}</strong> kết quả
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Trang trước"
          className="btn-page"
        >
          <ChevronLeftIcon />
        </button>
        <span className="px-2 text-text-secondary">
          Trang {page}/{totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Trang sau"
          className="btn-page"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
}
