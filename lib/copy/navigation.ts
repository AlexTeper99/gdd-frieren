// lib/copy/navigation.ts
import type { CopyEntry, TemplateCopyEntry } from "./types";

// --- Nav tabs ---

export const NAV_HISTORY: CopyEntry = {
  A: "Capítulos",
  B: "Historial",
  C: "Historia",
  recommended: "B",
};

export const NAV_WORLD: CopyEntry = {
  A: "El Mundo",
  B: "Mundo",
  C: "El Mundo",
  recommended: "B",
};

export const NAV_US: CopyEntry = {
  A: "Nosotros",
  B: "Nosotros",
  C: "El equipo",
  recommended: "B",
};

// --- Nosotros screen ---

export const NOSOTROS_TITLE: TemplateCopyEntry = {
  A: "Esta semana en [reino]...",
  B: "[reino]. Semana [n].",
  C: "Semana [n] en [reino].",
  recommended: "B",
  vars: ["reino", "n"],
};

export const NOSOTROS_PACT_LABEL = "Pacto activo";
export const NOSOTROS_BOSS_LABEL = "Boss semanal";
export const NOSOTROS_BOSS_UNLOCKED = "desbloqueado";
export const NOSOTROS_BOSS_LOCKED = "bloqueado";

export const NOSOTROS_ARC: TemplateCopyEntry = {
  A: "Arco: [nombre] — semana [n] de [total]",
  B: "Arco: [nombre] — semana [n] de [total]",
  C: "Arco: [nombre] — semana [n] de [total]",
  recommended: "B",
  vars: ["nombre", "n", "total"],
};

export const NOSOTROS_STREAK: TemplateCopyEntry = {
  A: "[nombre] · [n]d · [stat]%",
  B: "[nombre] · [n]d · [stat]%",
  C: "[nombre] · [n]d · [stat]%",
  recommended: "B",
  vars: ["nombre", "n", "stat"],
};

export const NOSOTROS_PODER: TemplateCopyEntry = {
  A: "Poder: [n]",
  B: "Poder: [n]",
  C: "Poder: [n]",
  recommended: "B",
  vars: ["n"],
};

// --- Arc close ---

export const ARC_CLOSE_QUESTION: CopyEntry = {
  A: "El arco termina. ¿Qué viene después?",
  B: "Un arco se cierra. ¿Qué querés descubrir en el siguiente?",
  C: "Nuevo arco. ¿En qué dirección?",
  recommended: "B",
};

export const ARC_CLOSE_PLACEHOLDER: CopyEntry = {
  A: "Escribí libre.",
  B: "Lo que quieras explorar.",
  C: "La dirección del próximo arco.",
  recommended: "B",
};

// --- Deferred (Phase 6) ---

export const DEFERRED_LOADING_1: CopyEntry = {
  A: "Nombrando el reino...",
  B: "Un reino toma forma...",
  C: "El mundo se despierta...",
  recommended: "B",
};

export const DEFERRED_LOADING_2: CopyEntry = {
  A: "Dando vida a los primeros habitantes...",
  B: "Nacen los primeros habitantes...",
  C: "Alguien más vive ahí ahora...",
  recommended: "B",
};

export const DEFERRED_LOADING_3: CopyEntry = {
  A: "Escribiendo el primer capítulo...",
  B: "La historia empieza a escribirse...",
  C: "El primer capítulo se escribe solo...",
  recommended: "B",
};

export const DEFERRED_TAGLINE: CopyEntry = {
  A: "Ni vos sabés cómo termina.",
  B: "Nadie sabe cómo termina.",
  C: "El final todavía no existe.",
  recommended: "B",
};

export const DEFERRED_START_BUTTON: CopyEntry = {
  A: "Comenzar",
  B: "Entrar al mundo",
  C: "Empezar",
  recommended: "B",
};
