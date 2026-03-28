// @vitest-environment node

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'
import { generateText, createGateway } from 'ai'
import { buildSystemPrompt } from '@/lib/prompts'
import type { TriggerType } from '@/lib/prompts'
import {
  PLAYER_HIGH_HP,
  PLAYER_LOW_HP,
  PLAYER_2,
  makeNarrativeContext,
} from './fixtures'

// Load .env.local manually since vitest doesn't auto-load it in node env
function loadEnvLocal() {
  try {
    const envPath = resolve(process.cwd(), '.env.local')
    const content = readFileSync(envPath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx)
      const value = trimmed.slice(eqIdx + 1)
      if (!process.env[key]) process.env[key] = value
    }
  } catch { /* no .env.local */ }
}
loadEnvLocal()

const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? '',
})

async function generateNarrative(
  trigger: TriggerType,
  jugadorActivo: typeof PLAYER_HIGH_HP,
  textoJugador: string | null = null,
): Promise<string> {
  const systemPrompt = buildSystemPrompt(trigger)
  const context = makeNarrativeContext({
    trigger,
    jugadorActivo,
    textoJugador,
  })

  const userMessage = `JUGADOR ACTIVO:\n${JSON.stringify(context.jugadorActivo)}\n\n${
    context.otroJugador ? `OTRO JUGADOR:\n${JSON.stringify(context.otroJugador)}\n\n` : ''
  }${
    context.textoJugador
      ? `TEXTO DEL JUGADOR:\n${context.textoJugador}`
      : 'Generá el prólogo del personaje.'
  }`

  const { text } = await generateText({
    model: gateway('anthropic/claude-sonnet-4.5'),
    system: systemPrompt,
    prompt: userMessage,
    maxOutputTokens: 1024,
  })

  return text
}

const FORBIDDEN_PATTERNS = [
  // Game mechanic terms
  /\b(HP|stat|stats|porcentaje|streak|level)\b/,
  /racha de \d/i,
  /nivel \d/i,
  // Moral judgment
  /\b(fallaste|fallaron|débil|decepcionante|decepcionó|vergüenza)\b/i,
  // Fourth wall
  /\b(app|aplicación|usuario|jugador|pantalla|botón|notificación)\b/i,
  // Generic fantasy clichés
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

describe('Narrative output — prologo trigger', { timeout: 30_000 }, () => {
  it('high HP → introduces character in Valdris', async () => {
    const text = await generateNarrative('prologo', PLAYER_HIGH_HP)

    assertNoForbiddenPatterns(text)
    assertHasSensoryDetail(text)
    assertIsSpanish(text)

    expect(text).toMatch(/Kael/i)
  })
})

describe('Narrative output — diario trigger', { timeout: 30_000 }, () => {
  it('high HP + player text → continues story naturally', async () => {
    const text = await generateNarrative(
      'diario',
      PLAYER_HIGH_HP,
      'Kael se acercó al río antes de que Lyra despertara. El agua estaba helada pero clara.'
    )

    assertNoForbiddenPatterns(text)
    assertHasSensoryDetail(text)
    assertIsSpanish(text)

    expect(text).toMatch(/Kael/i)
  })

  it('low HP + player text → world reflects difficulty', async () => {
    const text = await generateNarrative(
      'diario',
      PLAYER_LOW_HP,
      'Kael intentó levantarse temprano pero le costó. Igual salió a buscar leña.'
    )

    assertNoForbiddenPatterns(text)
    assertIsSpanish(text)

    expect(text).not.toMatch(/\b(salió limpio|fue fácil|sin esfuerzo|sin problema|sin dificultad)\b/i)
  })
})

describe('Narrative output — cross-trigger invariants', { timeout: 60_000 }, () => {
  const triggers: TriggerType[] = ['prologo', 'diario']

  for (const trigger of triggers) {
    it(`${trigger}: never mentions stats or game mechanics`, async () => {
      const text = await generateNarrative(trigger, PLAYER_HIGH_HP)
      assertNoForbiddenPatterns(text)
    })

    it(`${trigger}: always in Spanish`, async () => {
      const text = await generateNarrative(trigger, PLAYER_HIGH_HP)
      assertIsSpanish(text)
    })

    it(`${trigger}: always has sensory detail`, async () => {
      const text = await generateNarrative(trigger, PLAYER_HIGH_HP)
      assertHasSensoryDetail(text)
    })
  }
})
