// lib/copy/onboarding.ts
import type { CopyEntry } from "./types";

// --- Screen 1: La llegada ---

export const SCREEN1_OPENING: CopyEntry = {
  A: "Toda historia empieza con una decisión.",
  B: "Cada decisión construye a quien sos.",
  C: "El camino empieza cuando decidís quién ser.",
  recommended: "B",
};

export const SCREEN1_BUTTON: CopyEntry = {
  A: "Empezar",
  B: "Decidir",
  C: "Entrar",
  recommended: "B",
};

// --- Screen 2: Identidad y personaje ---

export const SCREEN2_IDENTITY_QUESTION: CopyEntry = {
  A: "¿Quién querés ser?",
  B: "¿Quién decidís ser?",
  C: "¿En quién te estás convirtiendo?",
  recommended: "B",
};

export const SCREEN2_IDENTITY_HELPER: CopyEntry = {
  A: "Quién, no qué.",
  B: "Pensalo. No hay respuesta incorrecta.",
  C: "La identidad guía todo lo demás.",
  recommended: "B",
};

export const SCREEN2_IDENTITY_PLACEHOLDER: CopyEntry = {
  A: "Soy alguien que cuida lo que come.",
  B: "Soy alguien que cuida cómo vive.",
  C: "Soy alguien que se mueve todos los días.",
  recommended: "B",
};

export const SCREEN2_NAME_QUESTION: CopyEntry = {
  A: "Nombrá a tu personaje.",
  B: "¿Cómo se llama?",
  C: "Tu personaje necesita un nombre.",
  recommended: "B",
};

export const SCREEN2_NAME_HELPER: CopyEntry = {
  A: "Puede ser tu nombre. Puede ser otro.",
  B: "Real o inventado.",
  C: "El nombre es el primer acto de identidad.",
  recommended: "B",
};

export const SCREEN2_BUTTON: CopyEntry = {
  A: "Siguiente",
  B: "Continuar",
  C: "Avanzar",
  recommended: "B",
};

// --- Screen 3: El arquetipo ---

export const SCREEN3_TITLE: CopyEntry = {
  A: "Elegí tu clase.",
  B: "Tu arquetipo.",
  C: "¿Qué tipo de personaje sos?",
  recommended: "B",
};

export const ARCHETYPE_GUERRERO: CopyEntry = {
  A: "Disciplina física. Lo que entrenás, lo controlás.",
  B: "Tu fuerza es tu cuerpo. Lo que entrenás, responde.",
  C: "Construís con el cuerpo. Tu disciplina es física.",
  recommended: "B",
};

export const ARCHETYPE_MAGO: CopyEntry = {
  A: "Disciplina mental. Lo que ordenás, se aclara.",
  B: "Mente clara, decisiones claras.",
  C: "Construís con la mente. Tu disciplina es mental.",
  recommended: "B",
};

export const ARCHETYPE_RANGER: CopyEntry = {
  A: "Disciplina flexible. Lo que no te frena, te fortalece.",
  B: "Ningún día es igual. Esa es tu ventaja.",
  C: "Construís en movimiento. Tu disciplina es adaptación.",
  recommended: "B",
};

export const ARCHETYPE_CURANDERO: CopyEntry = {
  A: "Disciplina interna. Lo que cuidás, crece.",
  B: "Lo que cuidás por dentro se nota por fuera.",
  C: "Construís desde adentro. Tu disciplina es cuidado.",
  recommended: "B",
};

// --- Archetype stat suggestions (narrative-only, no multipliers) ---

import type { StatKey } from "./stats";

export const ARCHETYPE_STATS: Record<string, StatKey[]> = {
  guerrero: ["str", "vit"],
  mago: ["int", "sta"],
  ranger: ["vit", "str", "int", "sta"], // balance
  curandero: ["vit", "sta"],
};

// --- Screen 4: Misión del arco y rituales ---

export const SCREEN4_TITLE: CopyEntry = {
  A: "Tu primer arco.",
  B: "Misión del arco.",
  C: "¿Cuál es la misión?",
  recommended: "B",
};

export const SCREEN4_SUBTITLE: CopyEntry = {
  A: "Un área por arco.",
  B: "Elegí una sola área para este primer arco.",
  C: "Todo el arco gira alrededor de esto.",
  recommended: "B",
};

export const SCREEN4_LABEL_WHAT: CopyEntry = {
  A: "El ritual. Concreto.",
  B: "¿Qué vas a hacer?",
  C: "La acción.",
  recommended: "B",
};

export const SCREEN4_PLACEHOLDER_WHAT = "Preparar mi desayuno";

export const SCREEN4_LABEL_WHEN: CopyEntry = {
  A: "Hora exacta.",
  B: "¿A qué hora?",
  C: "Cuándo.",
  recommended: "B",
};

export const SCREEN4_PLACEHOLDER_WHEN = "7:30";

export const SCREEN4_LABEL_WHERE: CopyEntry = {
  A: "Lugar específico.",
  B: "¿Dónde?",
  C: "El lugar.",
  recommended: "B",
};

export const SCREEN4_PLACEHOLDER_WHERE = "Mi cocina";

export const SCREEN4_LABEL_CONTINGENCY: CopyEntry = {
  A: "Si ese día no se puede...",
  B: "Plan alternativo.",
  C: "¿Y si no podés?",
  recommended: "B",
};

export const SCREEN4_HELPER_CONTINGENCY: CopyEntry = {
  A: "El ritual no se rompe. Se adapta.",
  B: "Mismo rumbo, distinto camino.",
  C: "Mejor un plan B que ningún plan.",
  recommended: "B",
};

export const SCREEN4_PLACEHOLDER_CONTINGENCY = "Desayuno simple, pero real.";

export const SCREEN4_ADD_RITUAL: CopyEntry = {
  A: "Agregar ritual",
  B: "Otro ritual",
  C: "+ Ritual",
  recommended: "B",
};

export const SCREEN4_LIMIT = "Hasta 3 rituales por arco.";

// --- Screen 5: Invitar ---

export const SCREEN5_TITLE: CopyEntry = {
  A: "Tu compañero de viaje.",
  B: "¿Quién camina con vos?",
  C: "Invitá a la otra persona.",
  recommended: "B",
};

export const SCREEN5_SUBTITLE: CopyEntry = {
  A: "La historia se escribe de a dos.",
  B: "Cuando los dos confirmen, nace el mundo.",
  C: "El mundo se genera cuando los dos entren.",
  recommended: "B",
};

export const SCREEN5_LABEL_EMAIL: CopyEntry = {
  A: "Su email.",
  B: "Email.",
  C: "Dirección de email.",
  recommended: "B",
};

export const SCREEN5_BUTTON: CopyEntry = {
  A: "Enviar invitación",
  B: "Invitar",
  C: "Enviar",
  recommended: "B",
};

export const SCREEN5_SKIP: CopyEntry = {
  A: "Seguir solo",
  B: "Empezar solo",
  C: "Sin compañero por ahora",
  recommended: "B",
};
