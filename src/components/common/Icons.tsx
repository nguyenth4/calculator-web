import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function CalcIcon(props: IconProps) {
  return (
    <svg width={20} height={20} {...base} {...props}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

export function MaterialIcon(props: IconProps) {
  return (
    <svg width={20} height={20} {...base} {...props}>
      <circle cx="12" cy="11" r="8" />
      <circle cx="12" cy="11" r="2.5" />
      <path d="M17.5 16.2c1.4 1 2.1 2.2 2.1 3.8" />
    </svg>
  );
}

export function PrinterIcon(props: IconProps) {
  return (
    <svg width={20} height={20} {...base} {...props}>
      <rect x="4" y="4" width="16" height="16" rx="1.5" />
      <line x1="7" y1="9" x2="17" y2="9" />
      <path d="M10.5 9v2h3V9" />
      <line x1="8" y1="13.5" x2="16" y2="13.5" />
    </svg>
  );
}

export function EditIcon(props: IconProps) {
  return (
    <svg width={16} height={16} {...base} {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg width={16} height={16} {...base} {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <svg width={16} height={16} {...base} {...props}>
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg width={16} height={16} {...base} {...props}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg width={18} height={18} {...base} {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg width={16} height={16} {...base} {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg width={16} height={16} {...base} {...props}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg width={16} height={16} {...base} {...props}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function SortIcon(props: IconProps) {
  return (
    <svg width={13} height={13} {...base} {...props}>
      <polyline points="7 15 12 20 17 15" />
      <polyline points="7 9 12 4 17 9" />
    </svg>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <svg width={16} height={16} {...base} {...props}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <svg width={16} height={16} {...base} {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function EmptyBoxIcon(props: IconProps) {
  return (
    <svg width={28} height={28} {...base} strokeWidth={1.6} {...props}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
