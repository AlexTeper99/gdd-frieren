import type { GameContext, StatProfile, TriggerType } from '@/lib/prompts'

// --- 5 canonical stat profiles ---

export const STATS_ALL_HIGH: StatProfile = {
  vit: 85, sta: 90, int: 80, str: 85, streak: 7, poder: 88,
}

export const STATS_MIXED: StatProfile = {
  vit: 85, sta: 70, int: 60, str: 40, streak: 6, poder: 62,
}

export const STATS_REGULAR: StatProfile = {
  vit: 55, sta: 60, int: 50, str: 55, streak: 3, poder: 52,
}

export const STATS_LOW: StatProfile = {
  vit: 25, sta: 30, int: 20, str: 35, streak: 0, poder: 22,
}

export const STATS_CRITICAL: StatProfile = {
  vit: 15, sta: 10, int: 20, str: 15, streak: 0, poder: 12,
}

export const ALL_STAT_PROFILES = {
  all_high: STATS_ALL_HIGH,
  mixed: STATS_MIXED,
  regular: STATS_REGULAR,
  low: STATS_LOW,
  critical: STATS_CRITICAL,
} as const

// --- Decision types ---

export const DECISIONS = {
  safe: 'Kael decide rodear la montaña. El camino más largo pero más seguro.',
  risky: 'Kael se lanza al bosque oscuro. Confía en que está listo para lo que venga.',
  neutral: 'Kael sigue caminando por el sendero principal. Un paso más.',
} as const

// --- Context factory ---

export function makeGameContext(overrides: {
  trigger: TriggerType
  p1Stats?: StatProfile
  p2Stats?: StatProfile
  decision?: string
  decision_p2?: string
}): GameContext {
  return {
    personaje_1: {
      nombre: 'Kael',
      arquetipo: 'Guerrero',
      stats: overrides.p1Stats ?? STATS_REGULAR,
      habito_hoy: statsToHabito(overrides.p1Stats ?? STATS_REGULAR),
      decision_escrita: overrides.decision ?? DECISIONS.neutral,
    },
    personaje_2: {
      nombre: 'Lyra',
      arquetipo: 'Mago',
      stats: overrides.p2Stats ?? STATS_REGULAR,
      habito_hoy: statsToHabito(overrides.p2Stats ?? STATS_REGULAR),
      decision_escrita: overrides.decision_p2,
    },
    identidad_p1: 'Soy alguien que cuida cómo vive.',
    identidad_p2: 'Soy alguien que construye con la mente.',
    objetivo_arco: {
      area: 'alimentación',
      semana_actual: 2,
      semana_total: 4,
      tipo_dia: overrides.trigger === 'boss_semanal' ? 'boss_semanal' : 'normal',
    },
    pacto_semana: {
      texto_p1_raw: 'No salteo el desayuno. Si viajo, adapto.',
      texto_p2_raw: 'Duermo antes de las 23:00 de lunes a viernes.',
      texto_narrativo: 'El juramento de la semana quedó sellado bajo el cielo de Valdris.',
    },
    weekly_boss: {
      desbloqueado: (overrides.p1Stats?.poder ?? 52) > 50,
      completado: false,
      descripcion: 'La criatura del paso norte',
    },
    historial: [
      'Kael tomó el camino corto ayer. Llegó exhausto pero entero.',
      'Lyra estudió el mapa al fuego. Encontró una ruta alternativa.',
      'El herbolario les vendió provisiones. La niebla se levantó al mediodía.',
    ],
    world_state: {
      reino: 'Valdris',
      npcs_conocidos: ['Herbolario de la colina', 'Lyra'],
      zonas: ['Bosque del Este', 'Paso Norte', 'Colina del herbolario'],
      decisiones_pasadas_relevantes: [
        'Eligieron el camino largo la semana pasada — les dio tiempo.',
      ],
      estado_actual: 'La niebla se retiró pero el paso norte sigue cerrado.',
    },
    trigger: overrides.trigger,
  }
}

function statsToHabito(stats: StatProfile): 'bien' | 'regular' | 'dificil' {
  if (stats.poder >= 70) return 'bien'
  if (stats.poder >= 40) return 'regular'
  return 'dificil'
}
