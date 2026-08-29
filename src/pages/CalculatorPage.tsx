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
  const { plastics, printers } = useData();
  const [form, setForm] = useState<CalculatorFormState>(DEFAULT_FORM_STATE);
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => validateCalculatorForm(form), [form]);
  const isValid = !hasErrors(errors);

  const selectedPlastic = plastics.find((p) => p.id === form.plasticId);
  const selectedPrinter = printers.find((p) => p.id === form.printerId);

  const weight = parseNumberInput(form.weight) || 0;
  const hours = parseNumberInput(form.hours) || 0;

  const result: CalculatorResult | null = useMemo(() => {
    if (!selectedPlastic || !selectedPrinter || weight <= 0 || hours <= 0) return null;

    return calculatePrintCost({
      pricePerKg: selectedPlastic.pricePerKg,
      weightGram: weight,
      powerKw: selectedPrinter.powerKw,
      purchasePrice: selectedPrinter.purchasePrice,
      lifetimeHours: selectedPrinter.lifetimeHours,
      printHours: hours,
      electricityPricePerKwh: parseNumberInput(form.electricity) || 0,
      technicalHours: parseNumberInput(form.technicalHours) || 0,
      technicalRatePerHour: parseNumberInput(form.technicalRate) || 0,
      quantity: parseNumberInput(form.quantity) || 1,
      otherCost: parseNumberInput(form.otherCost) || 0,
      riskPercent: parseNumberInput(form.risk) || 0,
      marginPercent: form.margin === "" ? undefined : parseNumberInput(form.margin) || 0,
    });
  }, [
    selectedPlastic,
    selectedPrinter,
    weight,
    hours,
    form.electricity,
    form.technicalHours,
    form.technicalRate,
    form.quantity,
    form.otherCost,
    form.risk,
    form.margin,
  ]);

  const handleReset = () => {
    setForm(DEFAULT_FORM_STATE);
    setSubmitted(false);
  };

  const handleCalculate = () => {
    setSubmitted(true);
  };

  return (
    <div>
      <div className="section-head">
        <h1>Tính giá nhựa</h1>
      </div>

      <div className="layout">
        <div className="col-input">
          <Calculator
            value={form}
            onChange={setForm}
            onReset={handleReset}
            errors={submitted ? errors : {}}
            selectedPlastic={selectedPlastic}
            selectedPrinter={selectedPrinter}
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
          <SummaryCard result={result} weight={weight} hours={hours} />
        </div>
      </div>
    </div>
  );
}
