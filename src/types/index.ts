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
  monthlySalesQuantity: number;
  riskPercent: number;
  profitMethod: ProfitMethod;
  profitPercent: number;
  advancedCostsEnabled: boolean;
}

export type PlasticInput = Omit<Plastic, "id" | "createdAt">;
export type PrinterInput = Omit<Printer, "id" | "createdAt">;
