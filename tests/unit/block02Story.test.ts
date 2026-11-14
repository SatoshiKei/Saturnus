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
  finishVerticeSetCrossRef,
  onRafaelClubAudioPlayed,
  onRafaelForwardAudioPlayed,
  runProvisionalRafaelForwardAnalysis,
  runProvisionalRingsAnalysis,
} from '../../src/game/story/block02Handlers'

describe('Bloco 2 — progressão', () => {
  it('análise provisória Rafael desbloqueia Vértice', () => {
    resetGame()
    __setStateForTests(
      applyStoryActions(getInvestigationState(), [
        { type: 'addEvidence', id: 'rafael_voice_to_augusto' },
      ]),
    )
    runProvisionalRafaelForwardAnalysis()
    const s = getInvestigationState()
    expect(s.flags.block02_rafael_forward_provisional).toBe(true)
    expect(s.evidenceOwned).toContain('rafael_recording_vertice_tag')
    expect(s.locations.vertice.status).toBe('visitAvailable')
  })

  it('1ª visita só confirma arquivos; áudio P3 vem de Rafael; ANÉIS é técnico; Nico só na 2ª visita', () => {
    resetGame()
    finishVerticeArchive()
    let s = getInvestigationState()
    expect(s.flags.block02_vertice_archive).toBe(true)
    expect(s.documentsOwned).toContain('doc-vertice-escala')
    expect(s.evidenceOwned).not.toContain('rec_vtx_old_01')
    expect(s.evidenceOwned).not.toContain('nico_dj_identified')
    expect(s.people.nico.status).not.toBe('identified')

    // Sem a gravação da balada, o P3 técnico não roda.
    runProvisionalRingsAnalysis()
    expect(getInvestigationState().flags.block02_rings_provisional).toBeFalsy()

    onRafaelClubAudioPlayed()
    s = getInvestigationState()
    expect(s.flags.block02_rafael_club_received).toBe(true)
    expect(s.evidenceOwned).toContain('rec_vtx_old_01')

    runProvisionalRingsAnalysis()
    s = getInvestigationState()
    expect(s.flags.block02_rings_provisional).toBe(true)
    expect(s.evidenceOwned).toContain('rec_vtx_fingerprint_transition')
    expect(s.locations.vertice.status).toBe('visitAvailable')
    expect(s.evidenceOwned).not.toContain('nico_dj_identified')
    expect(s.people.nico.status).not.toBe('identified')

    // Cruzamento antes do P3 técnico é ignorado; depois, identifica Nico.
    finishVerticeSetCrossRef()
    s = getInvestigationState()
    expect(s.flags.block02_vertice_set_crossref).toBe(true)
    expect(s.people.nico.status).toBe('identified')
    expect(s.people.nico.status).not.toBe('contactable')
    expect(s.evidenceOwned).toContain('nico_dj_identified')
  })

  it('cruzamento set_crossref é ignorado sem o P3 técnico', () => {
    resetGame()
    finishVerticeSetCrossRef()
    const s = getInvestigationState()
    expect(s.flags.block02_vertice_set_crossref).toBeFalsy()
    expect(s.people.nico.status).not.toBe('identified')
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

  it('áudio de Rafael (balada) gera rec_vtx_old_01 uma vez; alias forward equivale', () => {
    resetGame()
    onRafaelClubAudioPlayed()
    onRafaelForwardAudioPlayed()
    const owned = getInvestigationState().evidenceOwned
    expect(owned.filter((id) => id === 'rec_vtx_old_01').length).toBe(1)
    expect(owned).not.toContain('rafael_voice_to_augusto')
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
