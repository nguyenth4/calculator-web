import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { initialPlastics, initialPrinters } from "../data/sampleData";
import { supabase } from "../lib/supabase";
import type { CalculatorFormState } from "../utils/calculatorForm";
import type {
  CalculatorSettings,
  Plastic,
  PlasticInput,
  Printer,
  PrinterInput,
  SavedProduct,
} from "../types";

const DEFAULT_SETTINGS: CalculatorSettings = {
  defaultPrinterId: "",
  electricityPricePerKwh: 4000,
  technicalRatePerHour: 10000,
  riskPercent: 15,
  profitMethod: "markup",
  profitPercent: 50,
  advancedCostsEnabled: false,
};

type PlasticRow = {
  id: string;
  name: string;
  type: string;
  price_per_kg: number;
  color: string;
  manufacturer: string;
  description: string;
  status: Plastic["status"];
  created_at: string;
};

type PrinterRow = {
  id: string;
  name: string;
  power_kw: number;
  purchase_price: number;
  lifetime_hours: number;
  created_at: string;
};

type ProductRow = {
  id: string;
  name: string;
  user_id: string;
  total_weight: number;
  print_hours: number;
  quantity: number;
  cost_per_unit: number;
  suggested_price: number | null;
  created_at: string;
};

type SettingsRow = {
  default_printer_id: string | null;
  electricity_price_per_kwh: number;
  technical_rate_per_hour: number;
  risk_percent: number;
  profit_method: CalculatorSettings["profitMethod"];
  profit_percent: number;
  advanced_costs_enabled: boolean;
};

type ProfileRow = {
  role: "admin" | "customer";
  seeded_at: string | null;
};

function toPlastic(row: PlasticRow): Plastic {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    pricePerKg: Number(row.price_per_kg),
    color: row.color,
    manufacturer: row.manufacturer,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
  };
}

function toPrinter(row: PrinterRow): Printer {
  return {
    id: row.id,
    name: row.name,
    powerKw: Number(row.power_kw),
    purchasePrice: Number(row.purchase_price),
    lifetimeHours: Number(row.lifetime_hours),
    createdAt: row.created_at,
  };
}

function toProduct(row: ProductRow): SavedProduct {
  return {
    id: row.id,
    name: row.name,
    userId: row.user_id,
    totalWeight: Number(row.total_weight),
    printHours: Number(row.print_hours),
    quantity: row.quantity,
    costPerUnit: Number(row.cost_per_unit),
    suggestedPrice: row.suggested_price === null ? null : Number(row.suggested_price),
    createdAt: row.created_at,
  };
}

function toSettings(row: SettingsRow): CalculatorSettings {
  return {
    defaultPrinterId: row.default_printer_id ?? "",
    electricityPricePerKwh: Number(row.electricity_price_per_kwh),
    technicalRatePerHour: Number(row.technical_rate_per_hour),
    riskPercent: Number(row.risk_percent),
    profitMethod: row.profit_method,
    profitPercent: Number(row.profit_percent),
    advancedCostsEnabled: row.advanced_costs_enabled,
  };
}

function errorMessage(error: { message: string } | null) {
  return error?.message ? { error: error.message } : {};
}

interface DataContextValue {
  plastics: Plastic[];
  printers: Printer[];
  settings: CalculatorSettings;
  calculatorDraft: CalculatorFormState | null;
  currentUser: User | null;
  isAdmin: boolean;
  products: SavedProduct[];
  isLoading: boolean;
  addPlastic: (input: PlasticInput) => Promise<Plastic | null>;
  updatePlastic: (id: string, input: PlasticInput) => Promise<void>;
  removePlastic: (id: string) => Promise<void>;
  addPrinter: (input: PrinterInput) => Promise<Printer | null>;
  updatePrinter: (id: string, input: PrinterInput) => Promise<void>;
  removePrinter: (id: string) => Promise<void>;
  updateSettings: (settings: CalculatorSettings) => Promise<void>;
  updateCalculatorDraft: (form: CalculatorFormState) => void;
  register: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  saveProduct: (product: Omit<SavedProduct, "id" | "userId" | "createdAt">) => Promise<{ error?: string }>;
  removeProduct: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [plastics, setPlastics] = useState<Plastic[]>([]);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [settings, setSettings] = useState<CalculatorSettings>(DEFAULT_SETTINGS);
  const [calculatorDraft, setCalculatorDraft] = useState<CalculatorFormState | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState<SavedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = async (userId: string) => {
    const [plasticResponse, printerResponse, productResponse, settingsResponse, profileResponse] = await Promise.all([
      supabase.from("plastics").select("*").order("created_at", { ascending: false }),
      supabase.from("printers").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("calculator_settings").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("profiles").select("role, seeded_at").eq("id", userId).maybeSingle(),
    ]);

    if (plasticResponse.error || printerResponse.error || productResponse.error || settingsResponse.error || profileResponse.error) return;

    const loadedPlastics = (plasticResponse.data as PlasticRow[]).map(toPlastic);
    const loadedPrinters = (printerResponse.data as PrinterRow[]).map(toPrinter);
    setPlastics(loadedPlastics);
    setPrinters(loadedPrinters);
    setProducts((productResponse.data as ProductRow[]).map(toProduct));
    setSettings(settingsResponse.data ? toSettings(settingsResponse.data as SettingsRow) : DEFAULT_SETTINGS);

    const profile = profileResponse.data as ProfileRow | null;
    setIsAdmin(profile?.role === "admin");
    if (!profile?.seeded_at) {
      const plasticSeed = initialPlastics.map(({ id: _id, createdAt: _createdAt, pricePerKg, ...item }) => ({
        ...item,
        user_id: userId,
        price_per_kg: pricePerKg,
      }));
      const printerSeed = initialPrinters.map(({
        id: _id,
        createdAt: _createdAt,
        powerKw,
        purchasePrice,
        lifetimeHours,
        ...item
      }) => ({
        ...item,
        user_id: userId,
        power_kw: powerKw,
        purchase_price: purchasePrice,
        lifetime_hours: lifetimeHours,
      }));
      const [seededPlastics, seededPrinters] = await Promise.all([
        supabase.from("plastics").insert(plasticSeed).select(),
        supabase.from("printers").insert(printerSeed).select(),
      ]);
      if (seededPlastics.data) setPlastics((seededPlastics.data as PlasticRow[]).map(toPlastic));
      if (seededPrinters.data) setPrinters((seededPrinters.data as PrinterRow[]).map(toPrinter));
      await supabase.from("profiles").upsert({ id: userId, seeded_at: new Date().toISOString() });
    }
  };

  useEffect(() => {
    let active = true;
    const syncSession = async (user: User | null) => {
      if (!active) return;
      setCurrentUser(user);
      if (!user) {
        setPlastics([]);
        setPrinters([]);
        setProducts([]);
        setSettings(DEFAULT_SETTINGS);
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      await loadUserData(user.id);
      if (active) setIsLoading(false);
    };

    void supabase.auth.getUser().then(({ data }) => syncSession(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncSession(session?.user ?? null);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const addPlastic = async (input: PlasticInput) => {
    if (!currentUser) return null;
    const { data, error } = await supabase.from("plastics").insert({
      user_id: currentUser.id,
      name: input.name,
      type: input.type,
      price_per_kg: input.pricePerKg,
      color: input.color,
      manufacturer: input.manufacturer,
      description: input.description,
      status: input.status,
    }).select().single();
    if (error || !data) return null;
    const item = toPlastic(data as PlasticRow);
    setPlastics((items) => [item, ...items]);
    return item;
  };

  const updatePlastic = async (id: string, input: PlasticInput) => {
    const { data } = await supabase.from("plastics").update({
      name: input.name,
      type: input.type,
      price_per_kg: input.pricePerKg,
      color: input.color,
      manufacturer: input.manufacturer,
      description: input.description,
      status: input.status,
    }).eq("id", id).select().single();
    if (data) {
      const item = toPlastic(data as PlasticRow);
      setPlastics((items) => items.map((plastic) => plastic.id === id ? item : plastic));
    }
  };

  const removePlastic = async (id: string) => {
    const { error } = await supabase.from("plastics").delete().eq("id", id);
    if (!error) setPlastics((items) => items.filter((plastic) => plastic.id !== id));
  };

  const addPrinter = async (input: PrinterInput) => {
    if (!currentUser || !isAdmin) return null;
    const { data, error } = await supabase.from("printers").insert({
      user_id: currentUser.id,
      name: input.name,
      power_kw: input.powerKw,
      purchase_price: input.purchasePrice,
      lifetime_hours: input.lifetimeHours,
    }).select().single();
    if (error || !data) return null;
    const item = toPrinter(data as PrinterRow);
    setPrinters((items) => [item, ...items]);
    return item;
  };

  const updatePrinter = async (id: string, input: PrinterInput) => {
    if (!isAdmin) return;
    const { data } = await supabase.from("printers").update({
      name: input.name,
      power_kw: input.powerKw,
      purchase_price: input.purchasePrice,
      lifetime_hours: input.lifetimeHours,
    }).eq("id", id).select().single();
    if (data) {
      const item = toPrinter(data as PrinterRow);
      setPrinters((items) => items.map((printer) => printer.id === id ? item : printer));
    }
  };

  const removePrinter = async (id: string) => {
    if (!isAdmin) return;
    const { error } = await supabase.from("printers").delete().eq("id", id);
    if (!error) {
      setPrinters((items) => items.filter((printer) => printer.id !== id));
      if (settings.defaultPrinterId === id) await updateSettings({ ...settings, defaultPrinterId: "" });
    }
  };

  const updateSettings = async (next: CalculatorSettings) => {
    if (!currentUser) return;
    const normalized = {
      ...next,
      defaultPrinterId: printers.some((printer) => printer.id === next.defaultPrinterId) ? next.defaultPrinterId : "",
    };
    const { error } = await supabase.from("calculator_settings").upsert({
      user_id: currentUser.id,
      default_printer_id: normalized.defaultPrinterId || null,
      electricity_price_per_kwh: normalized.electricityPricePerKwh,
      technical_rate_per_hour: normalized.technicalRatePerHour,
      risk_percent: normalized.riskPercent,
      profit_method: normalized.profitMethod,
      profit_percent: normalized.profitPercent,
      advanced_costs_enabled: normalized.advancedCostsEnabled,
    });
    if (!error) setSettings(normalized);
  };

  const updateCalculatorDraft = (form: CalculatorFormState) => setCalculatorDraft(form);

  const register = async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: name.trim() } },
    });
    if (error) return errorMessage(error);
    if (!data.session) return { error: "Hãy kiểm tra email để xác nhận tài khoản trước khi đăng nhập." };
    return {};
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return errorMessage(error);
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const saveProduct = async (product: Omit<SavedProduct, "id" | "userId" | "createdAt">) => {
    if (!currentUser) return { error: "Vui lòng đăng nhập trước khi lưu sản phẩm." };
    const { data, error } = await supabase.from("products").insert({
      user_id: currentUser.id,
      name: product.name,
      total_weight: product.totalWeight,
      print_hours: product.printHours,
      quantity: product.quantity,
      cost_per_unit: product.costPerUnit,
      suggested_price: product.suggestedPrice,
    }).select().single();
    if (error || !data) return errorMessage(error);
    setProducts((items) => [toProduct(data as ProductRow), ...items]);
    return {};
  };

  const removeProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) setProducts((items) => items.filter((product) => product.id !== id));
  };

  const value: DataContextValue = {
    plastics,
    printers,
    settings,
    calculatorDraft,
    currentUser,
    isAdmin,
    products,
    isLoading,
    addPlastic,
    updatePlastic,
    removePlastic,
    addPrinter,
    updatePrinter,
    removePrinter,
    updateSettings,
    updateCalculatorDraft,
    register,
    login,
    logout,
    saveProduct,
    removeProduct,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
