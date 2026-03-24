// lib/copy/errors.ts
import type { CopyEntry } from "./types";

export const ERROR_CONNECTION: CopyEntry = {
  A: "Sin conexión. Revisá tu señal.",
  B: "El mundo no responde. Revisá tu conexión.",
  C: "Conexión perdida. Sin señal no hay camino.",
  recommended: "B",
};

export const ERROR_SAVE: CopyEntry = {
  A: "No se pudo guardar. Intentá de nuevo.",
  B: "El registro falló. Intentá otra vez.",
  C: "Algo falló. Volvé a intentar.",
  recommended: "B",
};

export const ERROR_AUTH_LINK: CopyEntry = {
  A: "El enlace expiró. Pedí uno nuevo.",
  B: "Enlace inválido o expirado. Pedí otro.",
  C: "Este enlace ya no sirve. Generá uno nuevo.",
  recommended: "B",
};

export const ERROR_AI_GENERATION: CopyEntry = {
  A: "La narrativa no se pudo generar. Intentá en unos minutos.",
  B: "El mundo no pudo responder. Intentá de nuevo.",
  C: "La historia se trabó. Volvé a intentar.",
  recommended: "B",
};

export const ERROR_RETRY_BUTTON = "Reintentar";
export const ERROR_NEW_LINK_BUTTON = "Pedir nuevo enlace";

// --- Validation errors ---

export const VALIDATION_NAME_EMPTY: CopyEntry = {
  A: "Tu personaje necesita un nombre.",
  B: "Falta el nombre.",
  C: "Sin nombre no hay personaje.",
  recommended: "B",
};

export const VALIDATION_IDENTITY_EMPTY: CopyEntry = {
  A: "Escribí quién decidís ser.",
  B: "La identidad no puede estar vacía.",
  C: "Necesitás una identidad para empezar.",
  recommended: "B",
};

export const VALIDATION_RITUAL_NO_TIME: CopyEntry = {
  A: "El ritual necesita una hora.",
  B: "¿A qué hora? Sin hora no hay señal.",
  C: "Falta la hora del ritual.",
  recommended: "B",
};

export const VALIDATION_RITUAL_NO_PLACE: CopyEntry = {
  A: "¿Dónde? El lugar activa la señal.",
  B: "Falta el lugar.",
  C: "El ritual necesita un lugar.",
  recommended: "B",
};

export const VALIDATION_EMAIL: CopyEntry = {
  A: "Revisá el email.",
  B: "Email inválido.",
  C: "Ese email no parece correcto.",
  recommended: "B",
};
