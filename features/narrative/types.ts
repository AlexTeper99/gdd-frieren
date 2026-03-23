import type { Stats, Archetype, CheckinLevel } from '../stats/types'

export type NarrativeTrigger =
  | 'daily'
  | 'weekly_close'
  | 'bond'
  | 'arc_close'
  | 'arc_open'

export interface CharacterContext {
  name: string
  archetype: Archetype
  stats: Stats
  streak: number
  checkinToday: CheckinLevel | null
  freeNote: string | null
  conducts: string[]
}

export interface NarrativeContext {
  trigger: NarrativeTrigger
  identityP1: string
  identityP2: string | null
  character1: CharacterContext
  character2: CharacterContext | null
  arc: {
    area: string
    description: string
    currentWeek: number
    totalWeeks: number
  }
  pact: {
    textP1: string | null
    textP2: string | null
    narrativeText: string | null
  } | null
  recentScenes: string[]
  worldState: {
    realmName: string
    currentState: string
  }
}
