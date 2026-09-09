import { describe, expect, it } from "vitest";
import { calculatePrintCost } from "./calculator";

const baseInput = {
  plasticCosts: [30000],
  powerKw: 0.095,
  purchasePrice: 10590000,
  lifetimeHours: 4000,
  printHours: 14,
  electricityPricePerKwh: 4000,
  technicalHours: 0,
  technicalRatePerHour: 0,
  quantity: 1,
  otherCost: 0,
  riskPercent: 15,
  marginPercent: 50,
};

describe("calculatePrintCost", () => {
  it("matches the Inkiri pricing example", () => {
    const result = calculatePrintCost({ ...baseInput, profitMethod: "markup" });

    expect(result.electricityCost).toBe(5500);
    expect(result.depreciationCost).toBe(37000);
    expect(result.riskCost).toBe(11000);
    expect(result.totalCostPerUnit).toBe(83500);
    expect(result.suggestedPrice).toBe(125500);
  });

  it("sums multiple material costs and allocates batch costs per unit", () => {
    const result = calculatePrintCost({
      ...baseInput,
      plasticCosts: [12000, 8000],
      printHours: 1,
      electricityPricePerKwh: 0,
      purchasePrice: 0,
      quantity: 4,
      riskPercent: 0,
      marginPercent: 0,
    });

    expect(result.plasticCost).toBe(5000);
    expect(result.totalCostPerUnit).toBe(5000);
    expect(result.batchCost).toBe(20000);
  });

  it("rounds electricity up and depreciation and risk to the nearest 500", () => {
    const result = calculatePrintCost({
      ...baseInput,
      plasticCosts: [0],
      powerKw: 0.1,
      printHours: 1,
      electricityPricePerKwh: 3200,
      purchasePrice: 4900000,
      lifetimeHours: 10000,
      riskPercent: 10,
      marginPercent: 0,
    });

    expect(result.electricityCost).toBe(500);
    expect(result.depreciationCost).toBe(500);
    expect(result.riskCost).toBe(0);
  });

  it("uses the selected markup or margin pricing formula", () => {
    const markup = calculatePrintCost({
      ...baseInput,
      plasticCosts: [10000],
      powerKw: 0,
      purchasePrice: 0,
      riskPercent: 0,
      marginPercent: 25,
      profitMethod: "markup",
    });
    const margin = calculatePrintCost({
      ...baseInput,
      plasticCosts: [10000],
      powerKw: 0,
      purchasePrice: 0,
      riskPercent: 0,
      marginPercent: 25,
      profitMethod: "margin",
    });

    expect(markup.suggestedPrice).toBe(12500);
    expect(margin.suggestedPrice).toBe(13500);
  });

  it("falls back to markup when margin is 100 percent or more", () => {
    const result = calculatePrintCost({
      ...baseInput,
      plasticCosts: [10000],
      powerKw: 0,
      purchasePrice: 0,
      riskPercent: 0,
      marginPercent: 100,
      profitMethod: "margin",
    });

    expect(result.suggestedPrice).toBe(20000);
  });
});