import { BASE_PROMPT } from './base'
import { DAILY_MODULE } from './modules/daily'
import { BOSS_SEMANAL_MODULE } from './modules/boss-semanal'
import { VINCULO_MODULE } from './modules/vinculo'
import { WEEKLY_CLOSE_MODULE } from './modules/weekly-close'
import { ARC_CLOSE_MODULE } from './modules/arc-close'
import { ARC_OPEN_MODULE } from './modules/arc-open'
import { RECOVERY_MODULE } from './modules/recovery'
import type { TriggerType } from './types'

const TRIGGER_MODULES: Record<TriggerType, string> = {
  daily: DAILY_MODULE,
  boss_semanal: BOSS_SEMANAL_MODULE,
  vinculo: VINCULO_MODULE,
  weekly_close: WEEKLY_CLOSE_MODULE,
  arc_close: ARC_CLOSE_MODULE,
  arc_open: ARC_OPEN_MODULE,
  recovery: RECOVERY_MODULE,
}

export function buildSystemPrompt(trigger: TriggerType): string {
  const module = TRIGGER_MODULES[trigger]
  return `${BASE_PROMPT}\n\n${module}`
}

export { type TriggerType, type GameContext, type StatProfile, type PlayerContext, TRIGGERS } from './types'
export { BASE_PROMPT } from './base'
