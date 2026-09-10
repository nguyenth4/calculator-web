import { useMemo, useState } from "react";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { formatVND } from "../utils/currency";
import { EmptyBoxIcon, TrashIcon } from "../components/common/Icons";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import type { SavedProduct } from "../types";

export function ProductsPage() {
  const { currentUser, products, removeProduct } = useData();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<SavedProduct | null>(null);

  const items = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return products.filter((product) =>
      product.userId === currentUser?.id && (!keyword || product.name.toLowerCase().includes(keyword)),
    );
  }, [currentUser?.id, products, search]);

  const handleDelete = async () => {
    if (!deleting) return;
    await removeProduct(deleting.id);
    setDeleting(null);
    showToast("Đã xóa sản phẩm đã lưu.");
  };

  return (
    <div className="products-page">
      <div className="section-head">
        <div>
          <h1>Sản phẩm đã lưu</h1>
          <p className="page-subtitle">{items.length} sản phẩm</p>
        </div>
      </div>

      <div className="block product-filter">
        <label className="field">
          <span>Tìm sản phẩm</span>
          <input
            className="input-field"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tên sản phẩm"
          />
        </label>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <span className="text-empty-icon"><EmptyBoxIcon /></span>
          <p>{search ? "Không tìm thấy sản phẩm phù hợp." : "Chưa có sản phẩm nào được lưu từ trang Tính giá."}</p>
        </div>
      ) : (
        <ul className="item-list">
          {items.map((product) => (
            <li className="item-card product-card" key={product.id}>
              <div className="product-main">
                <strong>{product.name}</strong>
                <span>{product.createdAt} · {product.quantity} sản phẩm · {product.totalWeight.toLocaleString("vi-VN")}g · {product.printHours.toLocaleString("vi-VN")} giờ</span>
              </div>
              <div className="product-price">
                <span>Giá vốn</span>
                <strong>{formatVND(product.costPerUnit)}</strong>
              </div>
              <div className="product-price">
                <span>Giá bán đề xuất</span>
                <strong>{product.suggestedPrice === null ? "Chưa đặt" : formatVND(product.suggestedPrice)}</strong>
              </div>
              <button type="button" className="product-delete" aria-label={`Xóa ${product.name}`} onClick={() => setDeleting(product)}>
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Xóa sản phẩm"
        message={`Bạn có chắc muốn xóa "${deleting?.name}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
