import { CalcIcon } from "../common/Icons";
import { useData } from "../../context/DataContext";

export function Header() {
  const { currentUser, logout } = useData();
  const displayName = currentUser?.user_metadata.name ?? currentUser?.email;

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-contrast">
          <CalcIcon width={20} height={20} />
        </div>
        <div>
          <p className="text-base font-bold leading-tight text-text">3D Print Cost</p>
          <p className="text-xs leading-tight text-text-muted">Quản lý & tính giá nhựa in 3D</p>
        </div>
        {currentUser && (
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-text-secondary sm:inline">{displayName}</span>
            <button type="button" className="btn btn-ghost header-logout" onClick={() => void logout()}>Đăng xuất</button>
          </div>
        )}
      </div>
    </header>
  );
}
