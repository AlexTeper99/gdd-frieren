// lib/copy/rituals.ts
import type { CopyEntry, TemplateCopyEntry } from "./types";

// --- Notifications ---

export const NOTIFICATION_RITUAL: TemplateCopyEntry = {
  A: "[nombre], [ritual] espera. [lugar], [hora].",
  B: "[nombre]. [ritual]. [lugar], [hora].",
  C: "[ritual] espera. [lugar], [hora].",
  recommended: "B",
  vars: ["nombre", "ritual", "lugar", "hora"],
};

export const NOTIFICATION_PERMISSION: CopyEntry = {
  A: "Cada ritual tiene su hora. Activá notificaciones.",
  B: "Los rituales llegan a su hora. Necesitan notificaciones.",
  C: "Sin notificaciones no hay señal. Activar.",
  recommended: "B",
};

// --- Tap UI: Pill display ---

export const PILL_COMPLETED = "✓";
export const PILL_PENDING = "○";

// --- Tap UI: Feedback ---

export const TAP_FEEDBACK: TemplateCopyEntry = {
  A: "[stat] +[n]",
  B: "[stat] +[n] · Racha [days]d",
  C: "+[n] [stat]",
  recommended: "B",
  vars: ["stat", "n", "days"],
};

export const TAP_DAY_COMPLETE: CopyEntry = {
  A: "Rituales completos.",
  B: "Día completo.",
  C: "Todo registrado.",
  recommended: "B",
};
