export const TRIGGERS = [
  'daily',
  'boss_semanal',
  'vinculo',
  'weekly_close',
  'arc_close',
  'arc_open',
  'recovery',
] as const

export type TriggerType = (typeof TRIGGERS)[number]

export interface StatProfile {
  vit: number
  sta: number
  int: number
  str: number
  streak: number
  poder: number
}

export interface PlayerContext {
  nombre: string
  arquetipo: 'Guerrero' | 'Mago' | 'Ranger' | 'Curandero'
  stats: StatProfile
  habito_hoy: 'bien' | 'regular' | 'dificil'
  decision_escrita?: string
}

export interface GameContext {
  personaje_1: PlayerContext
  personaje_2: PlayerContext
  identidad_p1: string
  identidad_p2: string
  objetivo_arco: {
    area: string
    semana_actual: number
    semana_total: number
    tipo_dia: 'normal' | 'decision' | 'boss_semanal' | 'arc_close'
  }
  pacto_semana: {
    texto_p1_raw: string
    texto_p2_raw: string
    texto_narrativo: string
  }
  weekly_boss: {
    desbloqueado: boolean
    completado: boolean
    descripcion: string
  }
  historial: string[]
  world_state: {
    reino: string
    npcs_conocidos: string[]
    zonas: string[]
    decisiones_pasadas_relevantes: string[]
    estado_actual: string
  }
  trigger: TriggerType
}
