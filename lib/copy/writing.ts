// lib/copy/writing.ts
import type { CopyEntry, TemplateCopyEntry } from "./types";

// --- Writing button by time of day ---

export const WRITING_MORNING: TemplateCopyEntry = {
  A: "¿Qué decide [nombre] hoy?",
  B: "El camino se abre. ¿Qué decide [nombre]?",
  C: "[nombre]. El día empieza.",
  recommended: "B",
  vars: ["nombre"],
};

export const WRITING_MIDDAY: TemplateCopyEntry = {
  A: "El camino sigue. ¿Cómo avanza?",
  B: "El día avanza. ¿Qué decide [nombre]?",
  C: "[nombre] sigue en marcha.",
  recommended: "B",
  vars: ["nombre"],
};

export const WRITING_NIGHT: TemplateCopyEntry = {
  A: "¿Cómo termina este capítulo?",
  B: "Cae la noche. ¿Qué decide [nombre]?",
  C: "El día termina. Última decisión.",
  recommended: "B",
  vars: ["nombre"],
};

export const WRITING_PLACEHOLDER: TemplateCopyEntry = {
  A: "Tu decisión. 1-2 oraciones.",
  B: "¿Qué hace [nombre]?",
  C: "Escribí lo que decide tu personaje.",
  recommended: "B",
  vars: ["nombre"],
};

export const WRITING_CONFIRMATION: CopyEntry = {
  A: "El reino toma nota.",
  B: "El mundo escuchó.",
  C: "Decisión tomada.",
  recommended: "B",
};

// --- Turns ---

export const TURN_YOURS: CopyEntry = {
  A: "Tu turno.",
  B: "Hoy decidís vos.",
  C: "Es tu turno de escribir.",
  recommended: "B",
};

export const TURN_THEIRS: TemplateCopyEntry = {
  A: "Turno de [nombre].",
  B: "Hoy decide [nombre].",
  C: "No es tu turno.",
  recommended: "B",
  vars: ["nombre"],
};

export const TURN_THEIRS_SUBTITLE: TemplateCopyEntry = {
  A: "Leé lo que pasó ayer.",
  B: "Ayer [nombre] decidió. Así salió.",
  C: "La escena de ayer.",
  recommended: "B",
  vars: ["nombre"],
};

export const TURN_TOMORROW: CopyEntry = {
  A: "Mañana te toca.",
  B: "Tu turno es mañana.",
  C: "El mundo avanza mañana con tu turno.",
  recommended: "B",
};
