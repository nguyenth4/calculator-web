export type ItemStatus = "active" | "inactive";

export interface Plastic {
  id: string;
  name: string;
  type: string;
  pricePerKg: number;
  color: string;
  manufacturer: string;
  description: string;
  status: ItemStatus;
  createdAt: string;
}

export interface Printer {
  id: string;
  name: string;
  powerKw: number;
  purchasePrice: number;
  lifetimeHours: number;
  createdAt: string;
}

export type ProfitMethod = "markup" | "margin";

export interface CalculatorSettings {
  defaultPrinterId: string;
  electricityPricePerKwh: number;
  technicalRatePerHour: number;
  riskPercent: number;
  profitMethod: ProfitMethod;
  profitPercent: number;
  advancedCostsEnabled: boolean;
}

export interface LocalUser {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface SavedProduct {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  totalWeight: number;
  printHours: number;
  quantity: number;
  costPerUnit: number;
  suggestedPrice: number | null;
}

export type PlasticInput = Omit<Plastic, "id" | "createdAt">;
export type PrinterInput = Omit<Printer, "id" | "createdAt">;
