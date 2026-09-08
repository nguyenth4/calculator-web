import { NavLink } from "react-router-dom";
import { CalcIcon, MaterialIcon, PrinterIcon, SettingsIcon } from "../common/Icons";

const tabs = [
  { to: "/", label: "Tính giá", Icon: CalcIcon },
  { to: "/materials", label: "Nhựa", Icon: MaterialIcon },
  { to: "/printers", label: "Máy in", Icon: PrinterIcon },
  { to: "/settings", label: "Cài đặt", Icon: SettingsIcon },
];

export function NavTabs() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 flex border-t border-line bg-surface/95 backdrop-blur-sm
        md:sticky md:top-[65px] md:border-b md:border-t-0"
      aria-label="Điều hướng chính"
    >
      <div className="mx-auto flex w-full max-w-6xl md:px-6">
        {tabs.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors
              md:flex-row md:flex-none md:gap-1.5 md:px-5 md:py-4 md:text-sm ${
                isActive ? "text-accent" : "text-text-secondary hover:text-text"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon />
                <span>{label}</span>
                {isActive && (
                  <span className="absolute inset-x-0 -top-px hidden h-0.5 rounded-full bg-accent md:block" />
                )}
                {isActive && (
                  <span className="absolute inset-x-1/4 top-0 h-0.5 rounded-full bg-accent md:hidden" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
