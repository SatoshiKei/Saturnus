import { describe, expect, it } from 'vitest'
import { createInitialState } from '../../src/game/state/initialState'
import { applyStoryActions } from '../../src/game/story/actions'
import { runStoryEngine } from '../../src/game/story/engine'
import { dispatchActions, getInvestigationState, resetGame } from '../../src/game/state/investigationStore'
import { registerInitialPoliceReport } from '../../src/game/story/block01Handlers'

describe('Bloco 1 — triggers e contradição', () => {
  it('registra BO inicial uma única vez', () => {
    resetGame()
    registerInitialPoliceReport()
    registerInitialPoliceReport()
    const s = getInvestigationState()
    expect(s.evidenceOwned).toContain('initial_police_report')
    expect(s.people.mariana.status).toBe('identified')
    expect(s.hypotheses.hyp_kidnapping).toBeTruthy()
  })

  it('desbloqueia hospital após contradição de memória', () => {
    resetGame()
    let s = createInitialState()
    s = applyStoryActions(s, [{ type: 'setFlag', id: 'block01_contradiction_memory', value: true }])
    s = runStoryEngine(s)
    expect(s.locations.hospital.status).toBe('visitAvailable')
  })

  it('libera Rafael no fim do bloco (hospital concluído)', () => {
    resetGame()
    let s = createInitialState()
    s = applyStoryActions(s, [{ type: 'setFlag', id: 'block01_hospital_done', value: true }])
    s = runStoryEngine(s)
    expect(s.people.rafael.status).toBe('identified')
    expect(s.contacts['contact-rafael']?.unlocked).toBe(true)
    expect(s.flags.block01_complete).toBe(true)
  })

  it('registra a contradição sozinha quando as duas evidências estão no caderno', () => {
    resetGame()
    dispatchActions([
      { type: 'addEvidence', id: 'mariana_memory_lapses' },
      { type: 'addHypothesis', id: 'hyp_memory' },
    ])
    expect(getInvestigationState().contradictionsConfirmed.length).toBe(0)
    dispatchActions([{ type: 'addEvidence', id: 'rafael_call_memory' }])
    const s = getInvestigationState()
    expect(s.contradictionsConfirmed.some((c) => c.id === 'contra_selective_memory')).toBe(true)
    expect(s.hypotheses.hyp_memory?.state).toBe('weakened')
    expect(s.hypotheses.hyp_manipulation).toBeTruthy()
    expect(s.flags.block01_contradiction_memory).toBe(true)
    expect(s.locations.hospital.status).toBe('visitAvailable')
    expect(s.discoveries.some((d) => d.kind === 'contradiction')).toBe(true)
  })
})
