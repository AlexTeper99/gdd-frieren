// lib/copy/glossary.ts

/** Words that must NEVER appear in UI copy */
export const PROHIBITED_WORDS = [
  "objetivo",
  "meta",
  "progreso",
  "productividad",
  "recordatorio",
  "completar",
  "logro",
  "achievement",
  "check-in",
  "hábito",
] as const;

/** Internal term → UI term mapping */
export const GLOSSARY = {
  conducta: "Ritual",
  objetivo_mensual: "Misión del arco",
  tap_conducta: "Registrar",
  pacto_semanal: "Pacto",
  streak: "Racha",
  weekly_boss: "Boss semanal",
  monthly_arc: "Arco",
  stats_primarios: "VIT / STR / INT / STA",
  stat_derivado: "Poder",
  day_level: null, // invisible to user
} as const;
