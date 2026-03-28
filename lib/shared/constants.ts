// lib/shared/constants.ts

// --- Days ---
export const DAYS = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"] as const;
export type DayOfWeek = (typeof DAYS)[number];

// --- HP ---
export const HP_MAX = 100;
export const HP_PER_RITUAL = 5;
export const HP_BONUS_STREAK = 7;
export const HP_STREAK_THRESHOLD = 7;
export const HP_PENALTY = 10;
export const HP_RESET_ON_ZERO = 30;

// --- Archetype Icons ---
export const ARCHETYPE_ICONS: Record<string, string> = {
  paladin: "⚔️",
  mago: "✨",
  guerrero: "🛡️",
  sacerdote: "☮️",
};

// --- Timezone ---
export const USER_TIMEZONE = "America/Argentina/Buenos_Aires";

export function getLocalDate(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: USER_TIMEZONE });
}

export function getLocalDay(): DayOfWeek {
  const dayName = new Date().toLocaleDateString("en-US", {
    timeZone: USER_TIMEZONE,
    weekday: "short",
  });
  const map: Record<string, DayOfWeek> = {
    Sun: "dom",
    Mon: "lun",
    Tue: "mar",
    Wed: "mie",
    Thu: "jue",
    Fri: "vie",
    Sat: "sab",
  };
  return map[dayName] ?? "lun";
}

export function getLocalDayIndex(): number {
  const day = new Date().toLocaleDateString("en-US", {
    timeZone: USER_TIMEZONE,
    weekday: "short",
  });
  const map: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  return map[day] ?? 1;
}
