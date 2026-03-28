import { BASE_PROMPT } from "./base";
import { PROLOGO_MODULE } from "./modules/prologo";
import { DIARIO_MODULE } from "./modules/diario";
import type { TriggerType } from "./types";

const MODULES: Record<TriggerType, string> = {
  prologo: PROLOGO_MODULE,
  diario: DIARIO_MODULE,
};

export function buildSystemPrompt(trigger: TriggerType): string {
  return BASE_PROMPT + "\n\n" + MODULES[trigger];
}

export type { TriggerType, NarrativeContext, PlayerContext } from "./types";
