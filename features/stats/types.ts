export interface Stats {
  vit: number
  sta: number
  int: number
  str: number
}

export type CheckinLevel = 1 | 2 | 3 // 1=bien, 2=regular, 3=dificil

export type Archetype = 'warrior' | 'mage' | 'ranger' | 'healer'

export interface DecayResult {
  stats: Stats
  hoursWithoutCheckin: number
  tier: 'none' | 'subtle' | 'visible' | 'critical'
}

export interface StatsUpdate {
  stats: Stats
  streak: number
  hasStreakShield: boolean
}

// Maps archetype to which stats it boosts
// Mago: mana mapped to STA per spec (GDD inconsistency resolved)
export const ARCHETYPE_STAT_WEIGHTS: Record<Archetype, Partial<Stats>> = {
  warrior: { str: 2, vit: 1.5 },
  mage: { int: 2, sta: 1.5 },
  ranger: { str: 1.5, sta: 1.5 },
  healer: { vit: 2, sta: 1.5 },
}
