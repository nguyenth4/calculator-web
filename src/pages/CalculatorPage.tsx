import { useMemo, useState } from "react";
import { useData } from "../context/DataContext";
import { Calculator } from "../components/calculator/Calculator";
import { SummaryCard } from "../components/calculator/SummaryCard";
import { calculatePrintCost, type CalculatorResult } from "../utils/calculator";
import {
  DEFAULT_FORM_STATE,
  validateCalculatorForm,
  type CalculatorFormState,
} from "../utils/calculatorForm";
import { parseNumberInput } from "../utils/currency";
import { hasErrors } from "../utils/validation";

export function CalculatorPage() {
  const { plastics, printers, settings, calculatorDraft, updateCalculatorDraft } = useData();
  const createDefaultForm = (): CalculatorFormState => ({
    ...DEFAULT_FORM_STATE,
    materials: [{ id: crypto.randomUUID(), plasticId: "", weight: "" }],
    printerId: settings.defaultPrinterId,
    electricity: String(settings.electricityPricePerKwh),
    technicalRate: String(settings.technicalRatePerHour),
    risk: String(settings.riskPercent),
    margin: String(settings.profitPercent),
  });
  const [form, setForm] = useState<CalculatorFormState>(() => calculatorDraft ?? createDefaultForm());
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => validateCalculatorForm(form), [form]);
  const isValid = !hasErrors(errors);

  const selectedPrinter = printers.find((p) => p.id === form.printerId);

  const totalWeight = form.materials.reduce(
    (total, material) => total + (parseNumberInput(material.weight) || 0),
    0,
  );
  const hours = (parseNumberInput(form.hours) || 0) + (parseNumberInput(form.minutes) || 0) / 60;
  const technicalHours = (parseNumberInput(form.technicalHours) || 0) + (parseNumberInput(form.technicalMinutes) || 0) / 60;
  const materialDetails = form.materials.flatMap((material) => {
    const plastic = plastics.find((item) => item.id === material.plasticId);
    const weight = parseNumberInput(material.weight) || 0;
    if (!plastic || weight <= 0) return [];

    return [{
      id: material.id,
      name: plastic.name,
      color: plastic.color,
      weight,
      cost: (weight * plastic.pricePerKg) / 1000 / (parseNumberInput(form.quantity) || 1),
    }];
  });

  const result: CalculatorResult | null = useMemo(() => {
    if (!selectedPrinter || form.materials.length === 0 || totalWeight <= 0 || hours <= 0) return null;

    const plasticCosts = form.materials.map((material) => {
      const plastic = plastics.find((item) => item.id === material.plasticId);
      return plastic ? ((parseNumberInput(material.weight) || 0) * plastic.pricePerKg) / 1000 : 0;
    });

    return calculatePrintCost({
      plasticCosts,
      powerKw: selectedPrinter.powerKw,
      purchasePrice: selectedPrinter.purchasePrice,
      lifetimeHours: selectedPrinter.lifetimeHours,
      printHours: hours,
      electricityPricePerKwh: parseNumberInput(form.electricity) || 0,
      technicalHours,
      technicalRatePerHour: parseNumberInput(form.technicalRate) || 0,
      quantity: parseNumberInput(form.quantity) || 1,
      otherCost: settings.advancedCostsEnabled ? parseNumberInput(form.otherCost) || 0 : 0,
      riskPercent: parseNumberInput(form.risk) || 0,
      marginPercent: form.margin === "" ? undefined : parseNumberInput(form.margin) || 0,
      profitMethod: settings.profitMethod,
    });
  }, [
    selectedPrinter,
    form.materials,
    plastics,
    totalWeight,
    hours,
    form.electricity,
    technicalHours,
    form.technicalRate,
    form.quantity,
    form.otherCost,
    form.risk,
    form.margin,
    settings.advancedCostsEnabled,
    settings.profitMethod,
  ]);

  const handleReset = () => {
    const nextForm = createDefaultForm();
    setForm(nextForm);
    updateCalculatorDraft(nextForm);
    setSubmitted(false);
  };

  const handleFormChange = (nextForm: CalculatorFormState) => {
    setForm(nextForm);
    updateCalculatorDraft(nextForm);
  };

  const handleCalculate = () => {
    setSubmitted(true);
  };

  return (
    <div className="calculator-page">
      <div className="section-head">
        <h1>Tính giá nhựa</h1>
      </div>

      <div className="layout">
        <div className="col-input">
          <Calculator
            value={form}
            onChange={handleFormChange}
            errors={submitted ? errors : {}}
            advancedCostsEnabled={settings.advancedCostsEnabled}
          />

          <div className="mt-3 flex gap-2">
            <button type="button" onClick={handleCalculate} className="btn btn-primary flex-1 sm:flex-none">
              Tính toán
            </button>
            <button type="button" onClick={handleReset} className="btn btn-ghost">
              Đặt lại
            </button>
          </div>

          {submitted && !isValid && (
            <div className="error-box mt-3" role="alert">
              Vui lòng kiểm tra lại các trường bị lỗi ở trên trước khi tính toán.
            </div>
          )}
        </div>

        <div className="col-result">
          <SummaryCard
            result={result}
            weight={totalWeight}
            hours={hours}
            profitMethod={settings.profitMethod}
            profitPercent={parseNumberInput(form.margin) || 0}
            materials={materialDetails}
          />
        </div>
      </div>
    </div>
  );
}
