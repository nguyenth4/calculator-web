import { createContext, useContext, useState, type ReactNode } from "react";
import { initialPlastics, initialPrinters } from "../data/sampleData";
import type { CalculatorFormState } from "../utils/calculatorForm";
import type {
  CalculatorSettings,
  Plastic,
  PlasticInput,
  Printer,
  PrinterInput,
} from "../types";

const STORAGE_KEY_PLASTICS = "p3d.plastics";
const STORAGE_KEY_PRINTERS = "p3d.printers";
const STORAGE_KEY_SETTINGS = "p3d.calculator-settings";

const DEFAULT_SETTINGS: CalculatorSettings = {
  defaultPrinterId: "printer-a1",
  electricityPricePerKwh: 4000,
  technicalRatePerHour: 10000,
  riskPercent: 15,
  profitMethod: "markup",
  profitPercent: 50,
  advancedCostsEnabled: false,
};

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

function loadSettings(): CalculatorSettings {
  const stored = loadFromStorage<unknown>(STORAGE_KEY_SETTINGS, null);
  if (typeof stored !== "object" || stored === null) return DEFAULT_SETTINGS;

  const value = stored as Partial<CalculatorSettings>;
  return {
    defaultPrinterId: typeof value.defaultPrinterId === "string" ? value.defaultPrinterId : DEFAULT_SETTINGS.defaultPrinterId,
    electricityPricePerKwh: typeof value.electricityPricePerKwh === "number" && value.electricityPricePerKwh >= 0
      ? value.electricityPricePerKwh : DEFAULT_SETTINGS.electricityPricePerKwh,
    technicalRatePerHour: typeof value.technicalRatePerHour === "number" && value.technicalRatePerHour >= 0
      ? value.technicalRatePerHour : DEFAULT_SETTINGS.technicalRatePerHour,
    riskPercent: typeof value.riskPercent === "number" && value.riskPercent >= 0 && value.riskPercent <= 100
      ? value.riskPercent : DEFAULT_SETTINGS.riskPercent,
    profitMethod: value.profitMethod === "margin" || value.profitMethod === "markup"
      ? value.profitMethod : DEFAULT_SETTINGS.profitMethod,
    profitPercent: typeof value.profitPercent === "number" && value.profitPercent >= 0
      ? value.profitPercent : DEFAULT_SETTINGS.profitPercent,
    advancedCostsEnabled: typeof value.advancedCostsEnabled === "boolean"
      ? value.advancedCostsEnabled : DEFAULT_SETTINGS.advancedCostsEnabled,
  };
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

interface DataContextValue {
  plastics: Plastic[];
  printers: Printer[];
  settings: CalculatorSettings;
  calculatorDraft: CalculatorFormState | null;
  addPlastic: (input: PlasticInput) => Plastic;
  updatePlastic: (id: string, input: PlasticInput) => void;
  removePlastic: (id: string) => void;
  addPrinter: (input: PrinterInput) => Printer;
  updatePrinter: (id: string, input: PrinterInput) => void;
  removePrinter: (id: string) => void;
  updateSettings: (settings: CalculatorSettings) => void;
  updateCalculatorDraft: (form: CalculatorFormState) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [plastics, setPlastics] = useState<Plastic[]>(() =>
    loadFromStorage(STORAGE_KEY_PLASTICS, initialPlastics),
  );
  const [printers, setPrinters] = useState<Printer[]>(loadPrinters);
  const [settings, setSettings] = useState<CalculatorSettings>(loadSettings);
  const [calculatorDraft, setCalculatorDraft] = useState<CalculatorFormState | null>(null);

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
    if (settings.defaultPrinterId === id) {
      updateSettings({ ...settings, defaultPrinterId: "" });
    }
  };

  const updateSettings = (next: CalculatorSettings) => {
    const normalized = {
      ...next,
      defaultPrinterId: printers.some((printer) => printer.id === next.defaultPrinterId) ? next.defaultPrinterId : "",
    };
    setSettings(normalized);
    saveToStorage(STORAGE_KEY_SETTINGS, normalized);
  };

  const updateCalculatorDraft = (form: CalculatorFormState) => {
    setCalculatorDraft(form);
  };

  const value: DataContextValue = {
    plastics,
    printers,
    settings,
    calculatorDraft,
    addPlastic,
    updatePlastic,
    removePlastic,
    addPrinter,
    updatePrinter,
    removePrinter,
    updateSettings,
    updateCalculatorDraft,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
