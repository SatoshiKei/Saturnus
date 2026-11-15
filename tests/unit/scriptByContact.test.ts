import { describe, expect, it } from 'vitest'
import { scriptByContact } from '../../src/data/calls'
import { createInitialState } from '../../src/game/state/initialState'
import type { InvestigationState } from '../../src/game/types'

function stateWith(partial: Partial<InvestigationState['flags']>, callsDone: string[] = []): InvestigationState {
  const base = createInitialState()
  return {
    ...base,
    flags: { ...base.flags, ...partial },
    callsDone,
  }
}

describe('scriptByContact', () => {
  it('escolhe call-julia-ricardo-audio quando pendente, não o repeat do onset', () => {
    const s = stateWith(
      {
        block07_julia_camila_check_unlocked: true,
        block07_julia_ricardo_audio_unlocked: true,
      },
      ['call-julia-onset'],
    )
    const script = scriptByContact('contact-julia', s)
    expect(script?.id).toBe('call-julia-ricardo-audio')
  })
})