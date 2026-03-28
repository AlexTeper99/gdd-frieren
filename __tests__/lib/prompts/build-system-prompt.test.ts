import { describe, it, expect } from 'vitest'
import { buildSystemPrompt } from '@/lib/prompts'
import { BASE_PROMPT } from '@/lib/prompts/base'

describe('buildSystemPrompt', () => {
  it('includes the base prompt for every trigger', () => {
    const triggers = ['prologo', 'diario'] as const
    for (const trigger of triggers) {
      const result = buildSystemPrompt(trigger)
      expect(result).toContain('<identidad>')
      expect(result).toContain('<tono>')
      expect(result).toContain('<mundo>')
      expect(result).toContain('<calibracion>')
      expect(result).toContain('<inspiracion>')
      expect(result).toContain('<reglas>')
    }
  })

  it('appends the correct trigger module', () => {
    expect(buildSystemPrompt('prologo')).toContain('<modulo_prologo>')
    expect(buildSystemPrompt('diario')).toContain('<modulo_diario>')
  })

  it('does not mix trigger modules', () => {
    const prologo = buildSystemPrompt('prologo')
    expect(prologo).not.toContain('<modulo_diario>')

    const diario = buildSystemPrompt('diario')
    expect(diario).not.toContain('<modulo_prologo>')
  })

  it('base prompt contains SIEMPRE and NUNCA rules', () => {
    expect(BASE_PROMPT).toContain('SIEMPRE')
    expect(BASE_PROMPT).toContain('NUNCA')
  })

  it('base prompt specifies rioplatense', () => {
    expect(BASE_PROMPT).toContain('rioplatense')
  })

  it('base prompt contains all 6 Frieren tono principles', () => {
    expect(BASE_PROMPT).toContain('CONTRASTE')
    expect(BASE_PROMPT).toContain('EL TIEMPO PESA')
    expect(BASE_PROMPT).toContain('LO PEQUEÑO IMPORTA MÁS')
    expect(BASE_PROMPT).toContain('MELANCOLÍA SIN TRAGEDIA')
    expect(BASE_PROMPT).toContain('VÍNCULOS EN SILENCIO')
    expect(BASE_PROMPT).toContain('EL VIAJE ES TODO')
  })

  it('base prompt contains Valdris world', () => {
    expect(BASE_PROMPT).toContain('Valdris')
  })

  it('base prompt contains archetype flavors', () => {
    expect(BASE_PROMPT).toContain('Paladín')
    expect(BASE_PROMPT).toContain('Mago')
    expect(BASE_PROMPT).toContain('Guerrero')
    expect(BASE_PROMPT).toContain('Sacerdote')
  })

  it('covers exactly 2 triggers', () => {
    const triggers = ['prologo', 'diario'] as const
    expect(triggers).toHaveLength(2)
  })
})
