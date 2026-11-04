import { describe, expect, it } from 'vitest'
import { HEX_CYCLE, HEX_EVIDENCE_IDS, HEX_NODES, HEX_PHRASE } from '../../src/data/block04/hexagonPuzzle'
import { createInitialState } from '../../src/game/state/initialState'
import { applyStoryActions } from '../../src/game/story/actions'
import { runStoryEngine } from '../../src/game/story/engine'
import { runPoliceSearch } from '../../src/game/search/runSearch'
import {
  __setStateForTests,
  getInvestigationState,
  resetGame,
} from '../../src/game/state/investigationStore'
import { applyPoliceSearchHit } from '../../src/game/story/block02Handlers'
import { block04EntryActions } from '../../src/game/story/block04DevCheckpoints'
import {
  applyBlock04SearchHit,
  finishAndreInterview,
  finishSamuelInterview,
  onDiaryEntryRead,
  onUnknownRecordingAnalyzed,
  onUnknownRecordingFound,
  runPhoneHiddenAppForensics,
  runProvisionalHexagonSolve,
} from '../../src/game/story/block04Handlers'

function seedBlock04Start() {
  resetGame()
  __setStateForTests(runStoryEngine(applyStoryActions(createInitialState(), block04EntryActions)))
}

describe('Bloco 4 — progressão', () => {
  it('trigger block04_start desbloqueia busca Samuel', () => {
    resetGame()
    let s = applyStoryActions(createInitialState(), [
      { type: 'setFlag', id: 'block03_complete', value: true },
    ])
    s = runStoryEngine(s)
    expect(s.flags.block04_started).toBe(true)
    expect(s.flags.block04_samuel_search_unlocked).toBe(true)
    expect(s.hypotheses.hyp_morsa_key).toBeTruthy()
  })

  it('grafo Hexágono fecha A→D→B→F→C→E→A com a frase correta', () => {
    expect(HEX_CYCLE).toEqual(['A', 'D', 'B', 'F', 'C', 'E'])
    const byId = Object.fromEntries(HEX_NODES.map((n) => [n.id, n]))
    let cur: string = 'A'
    const seen: string[] = []
    for (let i = 0; i < 6; i++) {
      seen.push(cur)
      cur = byId[cur].pointsTo
    }
    expect(seen).toEqual(HEX_CYCLE)
    expect(cur).toBe('A')
    expect(HEX_CYCLE.map((id) => byId[id].hiddenWord).join(' ')).toBe(HEX_PHRASE)
  })

  it('busca Samuel localiza e libera entrevista', () => {
    seedBlock04Start()
    const blocked = runPoliceSearch('samuel', createInitialState())
    expect(blocked.hits.length).toBe(0)

    const s = getInvestigationState()
    const { hits } = runPoliceSearch('Samuel', s)
    expect(hits.some((h) => h.evidenceId === 'samuel_current_record')).toBe(true)

    applyPoliceSearchHit('samuel_current_record')
    applyBlock04SearchHit('samuel_current_record')
    const after = getInvestigationState()
    expect(after.flags.block04_samuel_located).toBe(true)
    expect(after.people.samuel.status).toBe('contactable')
    expect(after.tasks.some((t) => t.id === 'task_interview_samuel' && !t.completed)).toBe(true)
  })

  it('Samuel confirma Morsa sem identificar e libera visitas André', () => {
    seedBlock04Start()
    applyBlock04SearchHit('samuel_current_record')
    finishSamuelInterview()
    finishSamuelInterview()
    const s = getInvestigationState()
    expect(s.flags.block04_samuel_interview_done).toBe(true)
    expect(s.evidenceOwned).toContain('samuel_confirms_morsa')
    expect(s.evidenceOwned).toContain('mariana_sought_samuel')
    expect(s.evidenceOwned).toContain('mariana_morsa_timing')
    expect(s.evidenceOwned.filter((id) => id === 'samuel_confirms_morsa').length).toBe(1)
    expect(s.flags.block04_andre_records_unlocked).toBe(true)
    expect(s.people.morsa.status).toBe('identified')
  })

  it('registro de visitas libera André; entrevista cria hipótese de manipulação', () => {
    seedBlock04Start()
    applyBlock04SearchHit('samuel_current_record')
    finishSamuelInterview()
    applyPoliceSearchHit('mariana_andre_visit_record')
    applyBlock04SearchHit('mariana_andre_visit_record')
    let s = getInvestigationState()
    expect(s.flags.block04_andre_visit_found).toBe(true)
    expect(s.people.andre.status).toBe('contactable')
    expect(s.locations.presidio?.status).toBe('visitAvailable')

    finishAndreInterview()
    s = getInvestigationState()
    expect(s.flags.block04_andre_interview_done).toBe(true)
    expect(s.evidenceOwned).toContain('andre_confirms_shift')
    expect(s.evidenceOwned).toContain('andre_told_her_to_stop')
    expect(s.evidenceOwned).toContain('andre_no_maralto_link')
    expect(s.hypotheses.hyp_andre_manipulating?.state).toBe('active')
    expect(s.flags.block04_chronology_search_unlocked).toBe(true)
  })

  it('cronologia enfraquece André como interlocutor e entrega os seis áudios', () => {
    seedBlock04Start()
    applyBlock04SearchHit('samuel_current_record')
    finishSamuelInterview()
    applyBlock04SearchHit('mariana_andre_visit_record')
    finishAndreInterview()
    applyPoliceSearchHit('andre_contact_chronology_mismatch')
    applyBlock04SearchHit('andre_contact_chronology_mismatch')
    const s = getInvestigationState()
    expect(s.flags.block04_andre_chronology_done).toBe(true)
    expect(s.hypotheses.hyp_andre_manipulating?.state).toBe('weakened')
    expect(s.flags.block04_hex_received).toBe(true)
    expect(s.flags.block04_hexagon_available).toBe(true)
    expect(s.provocationsPending).toContain('prov_hex_six')
    for (const id of HEX_EVIDENCE_IDS) {
      expect(s.evidenceOwned).toContain(id)
    }
  })

  it('Hexágono placeholder exige o conjunto e libera perícia', () => {
    seedBlock04Start()
    runProvisionalHexagonSolve()
    expect(getInvestigationState().flags.block04_hexagon_done).toBeFalsy()

    __setStateForTests(
      applyStoryActions(getInvestigationState(), [
        ...HEX_EVIDENCE_IDS.map((id) => ({ type: 'addEvidence' as const, id })),
        { type: 'setFlag', id: 'block04_hexagon_available', value: true },
      ]),
    )
    runProvisionalHexagonSolve()
    const s = getInvestigationState()
    expect(s.flags.block04_hexagon_done).toBe(true)
    expect(s.evidenceOwned).toContain('hex_phrase_recovered')
    expect(s.flags.block04_forensics_unlocked).toBe(true)
  })

  it('perícia revela diário oculto; diário abre gravação desconhecida', () => {
    seedBlock04Start()
    __setStateForTests(
      applyStoryActions(getInvestigationState(), [
        { type: 'setFlag', id: 'block04_forensics_unlocked', value: true },
      ]),
    )
    runPhoneHiddenAppForensics()
    runPhoneHiddenAppForensics()
    let s = getInvestigationState()
    expect(s.flags.block04_forensics_done).toBe(true)
    expect(s.evidenceOwned).toContain('hidden_app_detected')
    expect(s.evidenceOwned).toContain('hidden_diary_recovered')
    expect(s.phones.mariana.hiddenAppsRevealed).toBe(true)
    expect(s.passwordsDiscovered.diary).toBe(true)

    onDiaryEntryRead('diary-forget', false)
    onDiaryEntryRead('diary-julia-a', false)
    onDiaryEntryRead('diary-julia-b', false)
    onDiaryEntryRead('diary-record', true)
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('diary_memory_fear')
    expect(s.evidenceOwned).toContain('diary_julia_contradiction')
    expect(s.hypotheses.hyp_julia_manipulating).toBeTruthy()
    expect(s.flags.block04_unknown_recording_unlocked).toBe(true)
    expect(s.flags.block04_diary_opened).toBe(true)
  })

  it('gravação do desconhecido fecha o bloco com hipótese de interferência', () => {
    seedBlock04Start()
    __setStateForTests(
      applyStoryActions(getInvestigationState(), [
        { type: 'setFlag', id: 'block04_unknown_recording_unlocked', value: true },
        { type: 'addEvidence', id: 'diary_memory_fear' },
      ]),
    )
    onUnknownRecordingFound()
    expect(getInvestigationState().evidenceOwned).toContain('unknown_contact_recording')

    onUnknownRecordingAnalyzed()
    const s = getInvestigationState()
    expect(s.flags.block04_unknown_analyzed).toBe(true)
    expect(s.evidenceOwned).toContain('unknown_knows_mariana')
    expect(s.hypotheses.hyp_memory_interference).toBeTruthy()
    expect(s.flags.block04_complete).toBe(true)
    expect(s.tasks.some((t) => t.id === 'task_press_nico' && !t.completed)).toBe(true)
    expect(s.people.morsa.status).toBe('identified')
  })

  it('atalhos: perícia e CHK_UNK bloqueados sem pré-requisitos', () => {
    seedBlock04Start()
    runPhoneHiddenAppForensics()
    expect(getInvestigationState().flags.block04_forensics_done).toBeFalsy()

    onUnknownRecordingFound()
    expect(getInvestigationState().flags.block04_unknown_recording_found).toBeFalsy()
  })
})
