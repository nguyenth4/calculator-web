import { createContext, useContext, useState, type ReactNode } from "react";
import { initialPlastics, initialPrinters } from "../data/sampleData";
import type { Plastic, PlasticInput, Printer, PrinterInput } from "../types";

const STORAGE_KEY_PLASTICS = "p3d.plastics";
const STORAGE_KEY_PRINTERS = "p3d.printers";

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Bỏ qua lỗi ghi (ví dụ: chế độ ẩn danh hết quota) — dữ liệu vẫn dùng được trong phiên hiện tại.
  }
}

// Dữ liệu máy in cũ dùng schema `costPerHour`, không có `purchasePrice`/`lifetimeHours`
// nên không thể suy ra được — nếu phát hiện schema cũ/không hợp lệ thì bỏ và dùng dữ liệu mẫu.
function isValidPrinter(value: unknown): value is Printer {
  if (typeof value !== "object" || value === null) return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.id === "string" &&
    typeof p.powerKw === "number" &&
    typeof p.purchasePrice === "number" &&
    typeof p.lifetimeHours === "number"
  );
}

function loadPrinters(): Printer[] {
  const stored = loadFromStorage<unknown>(STORAGE_KEY_PRINTERS, null);
  if (Array.isArray(stored) && stored.every(isValidPrinter)) {
    return stored;
  }
  return initialPrinters;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

interface DataContextValue {
  plastics: Plastic[];
  printers: Printer[];
  addPlastic: (input: PlasticInput) => Plastic;
  updatePlastic: (id: string, input: PlasticInput) => void;
  removePlastic: (id: string) => void;
  addPrinter: (input: PrinterInput) => Printer;
  updatePrinter: (id: string, input: PrinterInput) => void;
  removePrinter: (id: string) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [plastics, setPlastics] = useState<Plastic[]>(() =>
    loadFromStorage(STORAGE_KEY_PLASTICS, initialPlastics),
  );
  const [printers, setPrinters] = useState<Printer[]>(loadPrinters);

  const persistPlastics = (next: Plastic[]) => {
    setPlastics(next);
    saveToStorage(STORAGE_KEY_PLASTICS, next);
  };

  const persistPrinters = (next: Printer[]) => {
    setPrinters(next);
    saveToStorage(STORAGE_KEY_PRINTERS, next);
  };

  const addPlastic = (input: PlasticInput): Plastic => {
    const item: Plastic = { ...input, id: crypto.randomUUID(), createdAt: today() };
    persistPlastics([item, ...plastics]);
    return item;
  };

  const updatePlastic = (id: string, input: PlasticInput) => {
    persistPlastics(plastics.map((p) => (p.id === id ? { ...p, ...input } : p)));
  };

  const removePlastic = (id: string) => {
    persistPlastics(plastics.filter((p) => p.id !== id));
  };

  const addPrinter = (input: PrinterInput): Printer => {
    const item: Printer = { ...input, id: crypto.randomUUID(), createdAt: today() };
    persistPrinters([item, ...printers]);
    return item;
  };

  const updatePrinter = (id: string, input: PrinterInput) => {
    persistPrinters(printers.map((p) => (p.id === id ? { ...p, ...input } : p)));
  };

  const removePrinter = (id: string) => {
    persistPrinters(printers.filter((p) => p.id !== id));
  };

  const value: DataContextValue = {
    plastics,
    printers,
    addPlastic,
    updatePlastic,
    removePlastic,
    addPrinter,
    updatePrinter,
    removePrinter,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
