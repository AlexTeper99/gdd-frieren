export interface WorldState {
  realmName: string
  npcs: string[]
  zones: string[]
  currentState: 'calm' | 'unsettled' | 'threatened' | 'critical'
}
