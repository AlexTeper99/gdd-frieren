// lib/copy/empty-states.ts
import type { CopyEntry, TemplateCopyEntry } from "./types";

export const EMPTY_HISTORY: CopyEntry = {
  A: "Sin escenas todavía. La primera se escribe hoy.",
  B: "Tu historia todavía no empezó. Escribí tu primera decisión.",
  C: "El historial se llena con cada decisión.",
  recommended: "B",
};

export const EMPTY_RITUALS_DONE: CopyEntry = {
  A: "Día completo.",
  B: "Rituales del día, completos.",
  C: "Todo registrado.",
  recommended: "B",
};

export const EMPTY_NO_PACT: CopyEntry = {
  A: "Sin pacto esta semana.",
  B: "Sin pacto activo. El domingo se firma uno nuevo.",
  C: "El pacto se renueva el domingo.",
  recommended: "B",
};

export const EMPTY_BOSS_LOCKED: CopyEntry = {
  A: "El boss sigue ahí. La puerta sigue cerrada.",
  B: "Boss bloqueado. Necesitás más poder.",
  C: "Todavía no. La puerta no se abre.",
  recommended: "B",
};

export const EMPTY_WAITING_PARTNER: CopyEntry = {
  A: "Tu compañero todavía no entró.",
  B: "Esperando. El mundo nace cuando los dos confirmen.",
  C: "Falta la otra persona.",
  recommended: "B",
};

export const EMPTY_NOT_YOUR_TURN: TemplateCopyEntry = {
  A: "Hoy no escribís. Leé lo que pasó.",
  B: "Hoy decide [nombre]. Mañana te toca.",
  C: "Tu turno es mañana.",
  recommended: "B",
  vars: ["nombre"],
};

export const EMPTY_NO_SCENE: CopyEntry = {
  A: "Todavía no hay escena.",
  B: "La primera escena se genera con tu primera decisión.",
  C: "Escribí tu primera decisión para que el mundo arranque.",
  recommended: "B",
};

export const EMPTY_INITIAL_STATS: CopyEntry = {
  A: "Los stats empiezan en 50. Cada ritual los mueve.",
  B: "Punto de partida. Los rituales hacen el resto.",
  C: "Stats iniciales. Todo puede cambiar.",
  recommended: "B",
};
