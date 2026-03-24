export type CopyVariant = "A" | "B" | "C";

export interface CopyEntry {
  A: string;
  B: string;
  C: string;
  recommended: CopyVariant;
}

export interface TemplateCopyEntry {
  A: string;
  B: string;
  C: string;
  recommended: CopyVariant;
  vars: string[];
}

export function getCopy(entry: CopyEntry): string {
  return entry[entry.recommended];
}

export function getVariant(entry: CopyEntry, variant: CopyVariant): string {
  return entry[variant];
}

export function fillTemplate(
  entry: TemplateCopyEntry,
  values: Record<string, string>,
  variant?: CopyVariant
): string {
  let text = variant ? entry[variant] : entry[entry.recommended];
  for (const [key, value] of Object.entries(values)) {
    text = text.replaceAll(`[${key}]`, value);
  }
  return text;
}
