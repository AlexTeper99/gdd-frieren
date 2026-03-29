import type { TriggerType, PlayerContext, NarrativeContext } from '@/lib/prompts'

// --- Player context factories ---

export const PLAYER_HIGH_HP: PlayerContext = {
  nombre: 'Kael',
  arquetipo: 'guerrero',
  identidad: 'Soy alguien que cuida cómo vive.',
  hp: 90,
  rituales: [
    { nombre: 'Cocinar algo casero', racha: 14 },
    { nombre: 'Caminar 30 minutos', racha: 7 },
  ],
}

export const PLAYER_LOW_HP: PlayerContext = {
  nombre: 'Kael',
  arquetipo: 'guerrero',
  identidad: 'Soy alguien que cuida cómo vive.',
  hp: 20,
  rituales: [
    { nombre: 'Cocinar algo casero', racha: 0 },
    { nombre: 'Caminar 30 minutos', racha: 1 },
  ],
}

export const PLAYER_2: PlayerContext = {
  nombre: 'Lyra',
  arquetipo: 'mago',
  identidad: 'Soy alguien que construye con la mente.',
  hp: 75,
  rituales: [
    { nombre: 'Leer 20 páginas', racha: 10 },
    { nombre: 'Meditar 10 minutos', racha: 5 },
  ],
}

// --- Context factory ---

export function makeNarrativeContext(overrides: {
  trigger: TriggerType
  jugadorActivo?: PlayerContext
  otroJugador?: PlayerContext | null
  textoJugador?: string | null
  resumen?: string | null
}): NarrativeContext {
  return {
    trigger: overrides.trigger,
    jugadorActivo: overrides.jugadorActivo ?? PLAYER_HIGH_HP,
    otroJugador: overrides.otroJugador ?? PLAYER_2,
    textoJugador: overrides.textoJugador ?? null,
    resumen: overrides.resumen ?? null,
    worldState: null,
    entradasRecientes: [],
  }
}
