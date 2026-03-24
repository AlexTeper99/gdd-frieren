// lib/copy/sunday.ts
import type { CopyEntry, TemplateCopyEntry } from "./types";

// --- Step labels ---

export const SUNDAY_STEP_1: CopyEntry = {
  A: "Cierre semanal",
  B: "Lo que pasó esta semana",
  C: "Cierre de la semana",
  recommended: "B",
};

export const SUNDAY_STEP_2: CopyEntry = {
  A: "Boss semanal",
  B: "El boss",
  C: "Boss de la semana",
  recommended: "B",
};

export const SUNDAY_STEP_3: CopyEntry = {
  A: "Nuevo pacto",
  B: "El pacto",
  C: "Pacto de la semana",
  recommended: "B",
};

export const SUNDAY_STEP_4: CopyEntry = {
  A: "Firma",
  B: "Sellar",
  C: "La firma",
  recommended: "B",
};

// --- Pact questions ---

export const PACT_Q1: CopyEntry = {
  A: "¿Qué se viene difícil esta semana?",
  B: "¿Qué puede complicar tus rituales?",
  C: "Obstáculos de la semana.",
  recommended: "B",
};

export const PACT_Q2: CopyEntry = {
  A: "¿Cómo lo enfrentás?",
  B: "¿Cuál es el plan?",
  C: "Tu estrategia para esos obstáculos.",
  recommended: "B",
};

export const PACT_Q3: CopyEntry = {
  A: "¿Qué necesitás del otro?",
  B: "¿Cómo se cubren esta semana?",
  C: "¿Cómo se ayudan?",
  recommended: "B",
};

export const PACT_Q4: CopyEntry = {
  A: "¿Suman algo nuevo?",
  B: "¿Quieren agregar algo esta semana?",
  C: "Algo extra.",
  recommended: "B",
};

// --- Signature ---

export const PACT_SIGN_BUTTON: CopyEntry = {
  A: "Firmar",
  B: "Sellar pacto",
  C: "Firmar pacto",
  recommended: "B",
};

export const PACT_SIGNED: CopyEntry = {
  A: "Pacto sellado.",
  B: "Sellado hasta el domingo.",
  C: "Pacto activo.",
  recommended: "B",
};

export const PACT_WAITING: TemplateCopyEntry = {
  A: "Esperando a [nombre].",
  B: "Falta la firma de [nombre].",
  C: "[nombre] todavía no firmó.",
  recommended: "B",
  vars: ["nombre"],
};
