import { describe, expect, it } from 'vitest'
import { createInitialState } from '../../src/game/state/initialState'
import { applyStoryActions } from '../../src/game/story/actions'
import { runStoryEngine } from '../../src/game/story/engine'
import { runPoliceSearch } from '../../src/game/search/runSearch'
import {
  __setStateForTests,
  dispatchActions,
  getInvestigationState,
  openDocument,
  resetGame,
} from '../../src/game/state/investigationStore'
import { block05EntryActions } from '../../src/game/story/block05DevCheckpoints'
import {
  comparePhoneFilesSequence,
  finishJanaInterview,
  finishNicoFollowup,
  onAndreStillGuiltyReflectionDone,
  onCoincidenceReflectionDone,
  onMaraltoLineWeighed,
  onMaraltoReflectionDone,
  onPathReflectionDone,
  organizeMarianaContactChronology,
  revisitEmergencyEntry,
} from '../../src/game/story/block05Handlers'

function seedBlock05Start() {
  resetGame()
  __setStateForTests(runStoryEngine(applyStoryActions(createInitialState(), block05EntryActions)))
}

describe('Bloco 5 — progressão', () => {
  it('inicia a partir do fim do Bloco 4 e reabre o Titã', () => {
    resetGame()
    let s = applyStoryActions(createInitialState(), [
      { type: 'setFlag', id: 'block04_complete', value: true },
      { type: 'unlockLocation', id: 'titan', status: 'visited' },
    ])
    s = runStoryEngine(s)
    expect(s.flags.block05_started).toBe(true)
    expect(s.locations.titan?.status).toBe('visitAvailable')
  })

  it('segunda conversa com Nico libera busca por Jana e o testemunho da jaqueta', () => {
    seedBlock05Start()
    finishNicoFollowup()
    const s = getInvestigationState()
    expect(s.flags.block05_nico_followup_done).toBe(true)
    expect(s.evidenceOwned).toContain('nico_believes_jacket_jana')
    expect(s.flags.block05_jana_search_unlocked).toBe(true)
    expect(s.tasks.some((t) => t.id === 'task_locate_jana' && !t.completed)).toBe(true)
  })

  it('Jana é descoberta pelos autos (consulta jana → documento com endereço)', () => {
    seedBlock05Start()
    finishNicoFollowup()
    expect(runPoliceSearch('jana', getInvestigationState()).hits.some((h) => h.documentId === 'doc-elisa-jana')).toBe(
      true,
    )
    openDocument('doc-elisa-jana')
    const s = getInvestigationState()
    expect(s.people.jana?.status).toBe('located')
    expect(s.locations['jana-casa']?.status).toBe('visitAvailable')
    expect(s.tasks.some((t) => t.id === 'task_talk_jana')).toBe(true)
  })

  it('entrevista com Jana registra confirmação e explicação de empréstimo', () => {
    seedBlock05Start()
    finishNicoFollowup()
    openDocument('doc-elisa-jana')
    finishJanaInterview()
    const s = getInvestigationState()
    expect(s.evidenceOwned).toContain('jana_confirms_jacket')
    expect(s.evidenceOwned).toContain('jana_loan_explanation')
    expect(s.flags.block05_elisa_review_unlocked).toBe(true)
  })

  it('consulta dos autos Elisa completa a revisão e abre reflexão sobre André', () => {
    seedBlock05Start()
    finishNicoFollowup()
    openDocument('doc-elisa-jana')
    finishJanaInterview()
    openDocument('doc-elisa-argumento')
    openDocument('doc-elisa-alibi')
    openDocument('doc-elisa-testemunha-queda')
    const s = getInvestigationState()
    expect(s.flags.block05_elisa_review_done).toBe(true)
    expect(s.hypotheses.hyp_mariana_needed_brother).toBeTruthy()
    expect(s.flags.block05_refl_andre_pending).toBe(true)
  })

  it('cronologia → comparação → coincidência → emergência → percurso → Geraldo', () => {
    seedBlock05Start()
    finishNicoFollowup()
    openDocument('doc-elisa-jana')
    finishJanaInterview()
    openDocument('doc-elisa-argumento')
    openDocument('doc-elisa-alibi')
    openDocument('doc-elisa-testemunha-queda')
    onAndreStillGuiltyReflectionDone()
    onMaraltoLineWeighed()
    onMaraltoReflectionDone()
    organizeMarianaContactChronology()
    let s = getInvestigationState()
    expect(s.documentsOwned).toContain('doc-mariana-contact-chronology')
    expect(s.evidenceOwned).toContain('mariana_sought_people_before')
    comparePhoneFilesSequence()
    s = getInvestigationState()
    expect(s.documentsOwned).toContain('doc-phone-file-dependencies')
    expect(s.evidenceOwned).toContain('phone_files_depend_on_order')
    expect(s.flags.block05_refl_coincidence_pending).toBe(true)
    expect(s.flags.block05_emergency_revisit_unlocked).toBeFalsy()
    onCoincidenceReflectionDone()
    expect(getInvestigationState().flags.block05_emergency_revisit_unlocked).toBe(true)
    revisitEmergencyEntry()
    s = getInvestigationState()
    expect(s.documentsOwned).toContain('doc-emergency-reassessment')
    expect(s.documentsOwned).toContain('doc-central-chamada')
    expect(s.documentsOwned).toContain('doc-entrada-apartamento')
    expect(s.documentsOwned).toContain('doc-apreensao-celular')
    expect(s.hypotheses.hyp_call_to_seize_phone).toBeTruthy()
    dispatchActions([{ type: 'setFlag', id: 'refl-b05-path_seen', value: true }])
    onPathReflectionDone()
    s = getInvestigationState()
    expect(s.hypotheses.hyp_deliberate_path).toBeTruthy()
    expect(s.hypotheses.hyp_kidnapping?.state).toBe('weakened')
    expect(s.flags.block05_complete).toBe(true)
    expect(s.flags.block06_entry_ready).toBe(true)
    expect(s.documentsOwned).toContain('doc-elisa-geraldo-depoimento')
    expect(s.tasks.some((t) => t.id === 'task_reexamine_elisa_from_scratch' && !t.completed)).toBe(true)
  })
})
