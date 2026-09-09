export interface GcodeMetadata {
  printDurationMinutes?: number;
  filamentWeightGrams?: number;
}

function parseDuration(value: string): number | undefined {
  const seconds = Number(value.trim());
  if (Number.isFinite(seconds) && seconds >= 0) return Math.round(seconds / 60);

  const hours = Number(value.match(/(\d+(?:\.\d+)?)\s*h/i)?.[1] ?? 0);
  const minutes = Number(value.match(/(\d+(?:\.\d+)?)\s*m(?!s)/i)?.[1] ?? 0);
  const duration = hours * 60 + minutes;
  return duration > 0 ? Math.round(duration) : undefined;
}

function parseFirstNumber(value: string): number | undefined {
  const match = value.replace(",", ".").match(/\d+(?:\.\d+)?/);
  if (!match) return undefined;
  const number = Number(match[0]);
  return Number.isFinite(number) && number > 0 ? number : undefined;
}

/** Extract slicer-provided estimates from G-code comments without interpreting machine commands. */
export function parseGcodeMetadata(content: string): GcodeMetadata {
  const metadata: GcodeMetadata = {};
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    if (metadata.printDurationMinutes === undefined) {
      const timeMatch = line.match(/^\s*;\s*(?:TIME|estimated printing time[^:=]*)\s*[:=]\s*(.+)$/i);
      const duration = timeMatch ? parseDuration(timeMatch[1]) : undefined;
      if (duration !== undefined) metadata.printDurationMinutes = duration;
    }

    if (metadata.filamentWeightGrams === undefined) {
      const weightMatch = line.match(/^\s*;\s*(?:total )?filament (?:used )?weight\s*\[g\]\s*[:=]\s*(.+)$/i)
        ?? line.match(/^\s*;\s*filament used\s*\[g\]\s*[:=]\s*(.+)$/i);
      const weight = weightMatch ? parseFirstNumber(weightMatch[1]) : undefined;
      if (weight !== undefined) metadata.filamentWeightGrams = weight;
    }
  }

  return metadata;
}