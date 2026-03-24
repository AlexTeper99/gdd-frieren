// @vitest-environment node

import { describe, it, expect } from 'vitest'
import Anthropic from '@anthropic-ai/sdk'
import { buildSystemPrompt } from '@/lib/prompts'
import type { TriggerType } from '@/lib/prompts'
import {
  ALL_STAT_PROFILES,
  DECISIONS,
  makeGameContext,
} from './fixtures'

const client = new Anthropic()
const MODEL = 'claude-sonnet-4-20250514'

async function generateNarrative(
  trigger: TriggerType,
  p1StatsKey: keyof typeof ALL_STAT_PROFILES,
  decisionKey: keyof typeof DECISIONS,
  extraOverrides?: { decision_p2?: string; p2Stats?: (typeof ALL_STAT_PROFILES)[keyof typeof ALL_STAT_PROFILES] },
): Promise<string> {
  const systemPrompt = buildSystemPrompt(trigger)
  const context = makeGameContext({
    trigger,
    p1Stats: ALL_STAT_PROFILES[p1StatsKey],
    decision: DECISIONS[decisionKey],
    ...extraOverrides,
  })

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: JSON.stringify(context),
      },
    ],
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Expected text response')
  return block.text
}

const FORBIDDEN_PATTERNS = [
  /\b(VIT|STA|INT|STR|stat|stats|porcentaje|racha|streak|nivel|level|poder)\b/i,
  /\b(fallaste|fallaron|débil|decepcionante|decepcionó|vergüenza)\b/i,
  /\b(app|aplicación|usuario|jugador|pantalla|botón|notificación)\b/i,
  /\b(elegido|profecía|espada luminosa|destino escrito|ancestral poder)\b/i,
]

function assertNoForbiddenPatterns(text: string) {
  for (const pattern of FORBIDDEN_PATTERNS) {
    expect(text).not.toMatch(pattern)
  }
}

function assertHasSensoryDetail(text: string) {
  const sensoryWords = /\b(frío|calor|niebla|luz|oscur|sombra|silencio|viento|fuego|olor|peso|húmed|sec|polvo|lluvia|nieve|amanecer|anochecer|crepúsculo)\b/i
  expect(text).toMatch(sensoryWords)
}

function assertIsSpanish(text: string) {
  const spanishMarkers = /\b(el|la|los|las|de|del|en|que|por|con|sin|pero|como|más|su|sus)\b/
  expect(text).toMatch(spanishMarkers)
}

describe('Narrative output — daily trigger', { timeout: 30_000 }, () => {
  it('high stats + risky decision → epic without unearned difficulty', async () => {
    const text = await generateNarrative('daily', 'all_high', 'risky')

    assertNoForbiddenPatterns(text)
    assertHasSensoryDetail(text)
    assertIsSpanish(text)

    expect(text).not.toMatch(/\b(no pudo|no alcanzó|no llegó|falló|fallaron)\b/i)
  })

  it('low stats + risky decision → consequence with world deterioration', async () => {
    const text = await generateNarrative('daily', 'low', 'risky')

    assertNoForbiddenPatterns(text)
    assertIsSpanish(text)

    expect(text).not.toMatch(/\b(limpio|fácil|sin esfuerzo|sin problema)\b/i)
  })

  it('regular stats + safe decision → success but harder', async () => {
    const text = await generateNarrative('daily', 'regular', 'safe')

    assertNoForbiddenPatterns(text)
    assertIsSpanish(text)
  })

  it('critical stats → world resists, no epic', async () => {
    const text = await generateNarrative('daily', 'critical', 'risky')

    assertNoForbiddenPatterns(text)
    assertIsSpanish(text)
  })
})

describe('Narrative output — boss_semanal trigger', { timeout: 30_000 }, () => {
  it('compatible decisions → fused narrative', async () => {
    const text = await generateNarrative('boss_semanal', 'all_high', 'risky', {
      decision_p2: 'Lyra flanquea por la izquierda. Busca un punto ciego.',
      p2Stats: ALL_STAT_PROFILES.all_high,
    })

    assertNoForbiddenPatterns(text)
    assertIsSpanish(text)

    expect(text).toMatch(/Kael/i)
    expect(text).toMatch(/Lyra/i)
  })
})

describe('Narrative output — vinculo trigger', { timeout: 30_000 }, () => {
  it('produces intimate scene without action', async () => {
    const text = await generateNarrative('vinculo', 'all_high', 'neutral')

    assertNoForbiddenPatterns(text)
    assertIsSpanish(text)

    expect(text).not.toMatch(/\b(atacó|luchó|combate|batalla|enemigo|criatura)\b/i)

    expect(text).toMatch(/Kael/i)
    expect(text).toMatch(/Lyra/i)
  })
})

describe('Narrative output — recovery trigger', { timeout: 30_000 }, () => {
  it('mentions concrete loss but dignified return', async () => {
    const text = await generateNarrative('recovery', 'critical', 'neutral')

    assertNoForbiddenPatterns(text)
    assertIsSpanish(text)

    expect(text).not.toMatch(/\b(abandonó|rindió|cobarde|débil)\b/i)
  })
})

describe('Narrative output — arc_close trigger', { timeout: 30_000 }, () => {
  it('good month → sense of earned growth', async () => {
    const text = await generateNarrative('arc_close', 'all_high', 'neutral')

    assertNoForbiddenPatterns(text)
    assertIsSpanish(text)
  })
})

describe('Narrative output — cross-trigger invariants', { timeout: 60_000 }, () => {
  const triggers: TriggerType[] = ['daily', 'weekly_close', 'arc_open']

  for (const trigger of triggers) {
    it(`${trigger}: never mentions stats or game mechanics`, async () => {
      const text = await generateNarrative(trigger, 'mixed', 'safe')
      assertNoForbiddenPatterns(text)
    })

    it(`${trigger}: always in Spanish`, async () => {
      const text = await generateNarrative(trigger, 'mixed', 'safe')
      assertIsSpanish(text)
    })

    it(`${trigger}: always has sensory detail`, async () => {
      const text = await generateNarrative(trigger, 'mixed', 'safe')
      assertHasSensoryDetail(text)
    })
  }
})
