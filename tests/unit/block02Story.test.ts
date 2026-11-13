import { describe, expect, it } from 'vitest'
import { createInitialState } from '../../src/game/state/initialState'
import { applyStoryActions } from '../../src/game/story/actions'
import { runStoryEngine } from '../../src/game/story/engine'
import { runPoliceSearch } from '../../src/game/search/runSearch'
import {
  __setStateForTests,
  getInvestigationState,
  openDocument,
  resetGame,
} from '../../src/game/state/investigationStore'
import {
  finishLucasInterview,
  finishVerticeArchive,
  onRafaelForwardAudioPlayed,
  runProvisionalRafaelForwardAnalysis,
  runProvisionalRingsAnalysis,
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

  it('arquivo Vértice entrega a gravação; Nico só depois de ANÉIS', () => {
    resetGame()
    finishVerticeArchive()
    let s = getInvestigationState()
    expect(s.evidenceOwned).toContain('rec_vtx_old_01')
    expect(s.evidenceOwned).not.toContain('nico_dj_identified')
    expect(s.people.nico.status).not.toBe('identified')

    runProvisionalRingsAnalysis()
    s = getInvestigationState()
    expect(s.people.nico.status).toBe('identified')
    expect(s.people.nico.status).not.toBe('contactable')
    expect(s.evidenceOwned).toContain('nico_dj_identified')
  })

  it('busca Elisa só após Lucas', () => {
    resetGame()
    let s = createInitialState()
    s = applyStoryActions(s, [{ type: 'setFlag', id: 'block02_elisa_search_unlocked', value: true }])
    const { hits } = runPoliceSearch('Elisa Duarte', s)
    expect(hits.some((h) => h.documentId === 'doc-elisa-resumo')).toBe(true)
    expect(hits.some((h) => h.documentId === 'doc-elisa-testemunhas')).toBe(true)

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
    expect(getInvestigationState().flags.block02_convergence_done).toBeFalsy()

    openDocument('doc-elisa-resumo')
    expect(getInvestigationState().flags.block02_convergence_done).toBeFalsy()
    openDocument('doc-elisa-testemunhas')
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
