// lib/copy/stats.ts

export const STAT_NAMES = {
  vit: { short: "VIT", long: "Vitalidad" },
  str: { short: "STR", long: "Fuerza" },
  int: { short: "INT", long: "Inteligencia" },
  sta: { short: "STA", long: "Stamina" },
  poder: { short: "Poder", long: "Poder" },
} as const;

export type StatKey = keyof typeof STAT_NAMES;

/** Display format templates for stats in UI */
export const STAT_FORMATS = {
  /** Stat bar display: "VIT 85" */
  bar: (stat: string, value: number) => `${stat} ${value}`,
  /** Post-ritual change: "VIT +3" */
  change: (stat: string, delta: number) => `${stat} +${delta}`,
  /** Poder display: "Poder 72" */
  poder: (value: number) => `Poder ${value}`,
  /** Racha display: "Racha 5d" */
  racha: (days: number) => `Racha ${days}d`,
} as const;
