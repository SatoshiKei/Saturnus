import { describe, expect, it } from 'vitest'
import { createInitialState } from '../../src/game/state/initialState'
import { applyStoryActions } from '../../src/game/story/actions'
import { runStoryEngine } from '../../src/game/story/engine'
import { runPoliceSearch } from '../../src/game/search/runSearch'
import {
  __setStateForTests,
  getInvestigationState,
  resetGame,
} from '../../src/game/state/investigationStore'
import {
  applyPoliceSearchHit,
  finishLucasInterview,
  finishVerticeArchive,
  onRafaelForwardAudioPlayed,
  runProvisionalRafaelForwardAnalysis,
  tryRegisterConvergence,
} from '../../src/game/story/block02Handlers'

describe('Bloco 2 — progressão', () => {
  it('análise provisória Rafael desbloqueia Vértice', () => {
    resetGame()
    __setStateForTests(
      applyStoryActions(getInvestigationState(), [
        { type: 'addEvidence', id: 'rafael_forward_from_mariana' },
      ]),
    )
    runProvisionalRafaelForwardAnalysis()
    const s = getInvestigationState()
    expect(s.flags.block02_rafael_forward_provisional).toBe(true)
    expect(s.evidenceOwned).toContain('rafael_recording_vertice_tag')
    expect(s.locations.vertice.status).toBe('visitAvailable')
  })

  it('arquivo Vértice identifica Nico sem contactable', () => {
    resetGame()
    finishVerticeArchive()
    const s = getInvestigationState()
    expect(s.people.nico.status).toBe('identified')
    expect(s.people.nico.status).not.toBe('contactable')
    expect(s.evidenceOwned).toContain('nico_dj_identified')
  })

  it('busca Elisa só após Lucas', () => {
    resetGame()
    let s = createInitialState()
    s = applyStoryActions(s, [{ type: 'setFlag', id: 'block02_elisa_search_unlocked', value: true }])
    const { hits } = runPoliceSearch('Elisa Duarte', s)
    expect(hits.some((h) => h.evidenceId === 'elisa_case_summary')).toBe(true)
    expect(hits.some((h) => h.evidenceId === 'nico_elisa_witness')).toBe(true)

    s = createInitialState()
    const blocked = runPoliceSearch('elisa', s)
    expect(blocked.hits.length).toBe(0)
  })

  it('convergência exige ambas trilhas', () => {
    resetGame()
    __setStateForTests(
      applyStoryActions(getInvestigationState(), [
        { type: 'addEvidence', id: 'nico_dj_identified' },
        { type: 'addEvidence', id: 'paula_leads_lucas' },
      ]),
    )
    tryRegisterConvergence()
    expect(getInvestigationState().flags.block02_convergence_done).toBeFalsy()

    applyPoliceSearchHit('elisa_case_summary')
    applyPoliceSearchHit('nico_elisa_witness')
    tryRegisterConvergence()
    const s = getInvestigationState()
    expect(s.flags.block02_convergence_done).toBe(true)
    expect(s.flags.block02_complete).toBe(true)
    expect(s.tasks.some((t) => t.id === 'task_locate_nico' && !t.completed)).toBe(true)
    expect(s.hypotheses.hyp_own_investigation?.state).toBe('confirmed')
  })

  it('Lucas libera hipótese voluntária', () => {
    resetGame()
    finishLucasInterview()
    const s = getInvestigationState()
    expect(s.flags.block02_elisa_search_unlocked).toBe(true)
    expect(s.hypotheses.hyp_voluntary_disappearance).toBeTruthy()
  })

  it('áudio Rafael gera evidência uma vez', () => {
    resetGame()
    onRafaelForwardAudioPlayed()
    onRafaelForwardAudioPlayed()
    expect(getInvestigationState().evidenceOwned.filter((id) => id === 'rafael_forward_from_mariana').length).toBe(1)
  })

  it('trigger block02_unlock_paula com nota quarta', () => {
    resetGame()
    let s = createInitialState()
    s = applyStoryActions(s, [
      { type: 'setFlag', id: 'block01_complete', value: true },
      { type: 'setFlag', id: 'block01_note_quarta_read', value: true },
    ])
    s = runStoryEngine(s)
    expect(s.flags.block02_paula_chat_unlocked).toBe(true)
    expect(s.contacts['contact-paula']?.unlocked).toBe(true)
  })
})
