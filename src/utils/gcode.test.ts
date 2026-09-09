import { describe, expect, it } from "vitest";
import { parseGcodeMetadata } from "./gcode";

describe("parseGcodeMetadata", () => {
  it("extracts seconds-based time and filament weight", () => {
    const metadata = parseGcodeMetadata("; TIME:7265\n; filament used [g] = 48.32");

    expect(metadata).toEqual({ printDurationMinutes: 121, filamentWeightGrams: 48.32 });
  });

  it("extracts human-readable slicer duration", () => {
    const metadata = parseGcodeMetadata("; estimated printing time = 2h 15m\n; total filament weight [g] = 25");

    expect(metadata).toEqual({ printDurationMinutes: 135, filamentWeightGrams: 25 });
  });

  it("returns no metadata for an unsupported file", () => {
    expect(parseGcodeMetadata("G28\nG1 X10 Y10")).toEqual({});
  });
});