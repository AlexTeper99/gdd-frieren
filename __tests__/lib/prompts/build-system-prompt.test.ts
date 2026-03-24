import { describe, it, expect } from 'vitest'
import { buildSystemPrompt, TRIGGERS, BASE_PROMPT } from '@/lib/prompts'

describe('buildSystemPrompt', () => {
  it('includes the base prompt for every trigger', () => {
    for (const trigger of TRIGGERS) {
      const result = buildSystemPrompt(trigger)
      expect(result).toContain('<identidad>')
      expect(result).toContain('<estilo>')
      expect(result).toContain('<reglas>')
      expect(result).toContain('<calibracion>')
      expect(result).toContain('<formato>')
    }
  })

  it('appends the correct trigger module', () => {
    expect(buildSystemPrompt('daily')).toContain('<trigger_daily>')
    expect(buildSystemPrompt('boss_semanal')).toContain('<trigger_boss>')
    expect(buildSystemPrompt('vinculo')).toContain('<trigger_vinculo>')
    expect(buildSystemPrompt('weekly_close')).toContain('<trigger_weekly_close>')
    expect(buildSystemPrompt('arc_close')).toContain('<trigger_arc_close>')
    expect(buildSystemPrompt('arc_open')).toContain('<trigger_arc_open>')
    expect(buildSystemPrompt('recovery')).toContain('<trigger_recovery>')
  })

  it('does not mix trigger modules', () => {
    const daily = buildSystemPrompt('daily')
    expect(daily).not.toContain('<trigger_boss>')
    expect(daily).not.toContain('<trigger_vinculo>')
    expect(daily).not.toContain('<trigger_recovery>')
  })

  it('base prompt contains MUST and NEVER rules', () => {
    expect(BASE_PROMPT).toContain('MUST')
    expect(BASE_PROMPT).toContain('NEVER')
  })

  it('base prompt specifies rioplatense', () => {
    expect(BASE_PROMPT).toContain('rioplatense')
  })

  it('base prompt contains all 6 Frieren principles', () => {
    expect(BASE_PROMPT).toContain('ACCIÓN ÉPICA Y QUIETUD')
    expect(BASE_PROMPT).toContain('EL TIEMPO TIENE PESO')
    expect(BASE_PROMPT).toContain('LO PEQUEÑO IMPORTA MÁS')
    expect(BASE_PROMPT).toContain('MELANCOLÍA SIN TRAGEDIA')
    expect(BASE_PROMPT).toContain('VÍNCULOS EN SILENCIO')
    expect(BASE_PROMPT).toContain('EL VIAJE SOBRE EL DESTINO')
  })

  it('base prompt contains all 5 calibration levels', () => {
    expect(BASE_PROMPT).toContain('Épica completa')
    expect(BASE_PROMPT).toContain('Éxito con costo')
    expect(BASE_PROMPT).toContain('más difícil')
    expect(BASE_PROMPT).toContain('Falla parcial')
    expect(BASE_PROMPT).toContain('El mundo resiste')
  })

  it('boss module contains all 3 fusion strategies', () => {
    const boss = buildSystemPrompt('boss_semanal')
    expect(boss).toContain('COMPATIBLES')
    expect(boss).toContain('CONTRADICTORIAS')
    expect(boss).toContain('OPUESTAS')
  })

  it('covers all 7 triggers', () => {
    expect(TRIGGERS).toHaveLength(7)
    expect(TRIGGERS).toEqual([
      'daily',
      'boss_semanal',
      'vinculo',
      'weekly_close',
      'arc_close',
      'arc_open',
      'recovery',
    ])
  })
})
