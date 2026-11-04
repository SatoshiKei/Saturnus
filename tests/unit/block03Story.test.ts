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
import { applyPoliceSearchHit } from '../../src/game/story/block02Handlers'
import {
  applyBlock03SearchHit,
  finishLiviaInterview,
  finishNicoInterview,
  onMarianaMaraltoRecordingFound,
  runProvisionalJanusSync,
  runProvisionalSaturnaliaReconstruct,
} from '../../src/game/story/block03Handlers'

function seedBlock03Start() {
  resetGame()
  __setStateForTests(
    runStoryEngine(
      applyStoryActions(createInitialState(), [
        { type: 'setFlag', id: 'block02_complete', value: true },
        { type: 'setFlag', id: 'block02_vertice_archive', value: true },
        { type: 'discoverPerson', id: 'nico', status: 'identified' },
        { type: 'addEvidence', id: 'nico_dj_identified' },
        {
          type: 'replaceTasks',
          tasks: [
            { id: 'task_locate_nico', label: 'Localizar Nico — testemunha do caso Elisa', completed: false },
          ],
        },
      ]),
    ),
  )
}

describe('Bloco 3 — progressão', () => {
  it('trigger block03_start desbloqueia busca Nico', () => {
    resetGame()
    let s = applyStoryActions(createInitialState(), [
      { type: 'setFlag', id: 'block02_complete', value: true },
    ])
    s = runStoryEngine(s)
    expect(s.flags.block03_started).toBe(true)
    expect(s.flags.block03_nico_search_unlocked).toBe(true)
  })

  it('busca Nico exige flag e localiza via cadastro', () => {
    seedBlock03Start()
    const blocked = runPoliceSearch('nico', createInitialState())
    expect(blocked.hits.length).toBe(0)

    const s = getInvestigationState()
    const { hits } = runPoliceSearch('Nicolas Nico', s)
    expect(hits.some((h) => h.evidenceId === 'nico_current_record')).toBe(true)

    applyPoliceSearchHit('nico_current_record')
    applyBlock03SearchHit('nico_current_record')
    const after = getInvestigationState()
    expect(after.flags.block03_nico_located).toBe(true)
    expect(after.people.nico.status).toBe('contactable')
    expect(after.tasks.some((t) => t.id === 'task_locate_nico' && t.completed)).toBe(true)
  })

  it('entrevista Nico entrega gravações Janus', () => {
    seedBlock03Start()
    applyBlock03SearchHit('nico_current_record')
    finishNicoInterview()
    finishNicoInterview()
    const s = getInvestigationState()
    expect(s.flags.block03_nico_interview_done).toBe(true)
    expect(s.evidenceOwned).toContain('nico_recording_booth')
    expect(s.evidenceOwned).toContain('nico_recording_portable')
    expect(s.evidenceOwned.filter((id) => id === 'nico_mariana_visit').length).toBe(1)
    expect(s.people.nico.status).toBe('interviewed')
  })

  it('Janus exige o par e gera inconsistência sem absolver', () => {
    seedBlock03Start()
    runProvisionalJanusSync()
    expect(getInvestigationState().flags.block03_janus_done).toBeFalsy()

    __setStateForTests(
      applyStoryActions(getInvestigationState(), [
        { type: 'addEvidence', id: 'nico_recording_booth' },
        { type: 'addEvidence', id: 'nico_recording_portable' },
      ]),
    )
    runProvisionalJanusSync()
    const s = getInvestigationState()
    expect(s.flags.block03_janus_done).toBe(true)
    expect(s.evidenceOwned).toContain('vertice_timeline_inconsistent')
    expect(s.flags.block03_reanalysis_unlocked).toBe(true)
    expect(s.hypotheses.hyp_andre_imprecise_chronology).toBeTruthy()
  })

  it('reanálise Maralto só após Janus', () => {
    seedBlock03Start()
    onMarianaMaraltoRecordingFound()
    expect(getInvestigationState().flags.block03_maralto_recording_found).toBeFalsy()

    __setStateForTests(
      applyStoryActions(getInvestigationState(), [
        { type: 'setFlag', id: 'block03_reanalysis_unlocked', value: true },
      ]),
    )
    onMarianaMaraltoRecordingFound()
    const s = getInvestigationState()
    expect(s.evidenceOwned).toContain('mariana_maralto_recording')
    expect(s.flags.block03_maralto_search_unlocked).toBe(true)
  })

  it('pesquisa Maralto libera Lívia; cruzamento não liga a Elisa', () => {
    seedBlock03Start()
    __setStateForTests(
      applyStoryActions(getInvestigationState(), [
        { type: 'setFlag', id: 'block03_maralto_search_unlocked', value: true },
        { type: 'addEvidence', id: 'mariana_maralto_recording' },
      ]),
    )
    applyPoliceSearchHit('maralto_public_record')
    applyBlock03SearchHit('maralto_public_record')
    applyPoliceSearchHit('livia_sought_by_mariana')
    applyBlock03SearchHit('livia_sought_by_mariana')
    let s = getInvestigationState()
    expect(s.flags.block03_maralto_researched).toBe(true)
    expect(s.people.livia.status).toBe('identified')
    expect(s.flags.block03_livia_search_unlocked).toBe(true)

    const cross = runPoliceSearch('maralto elisa', s)
    expect(cross.hits.some((h) => h.evidenceId === 'maralto_no_elisa_link')).toBe(true)
    applyPoliceSearchHit('maralto_no_elisa_link')
    applyBlock03SearchHit('maralto_no_elisa_link')
    s = getInvestigationState()
    expect(s.flags.block03_maralto_no_link).toBe(true)
  })

  it('Saturnalia introduz Morsa e fecha o bloco', () => {
    seedBlock03Start()
    __setStateForTests(
      applyStoryActions(getInvestigationState(), [
        { type: 'addEvidence', id: 'livia_radio_archive_raw' },
        { type: 'setFlag', id: 'block03_saturnalia_available', value: true },
      ]),
    )
    runProvisionalSaturnaliaReconstruct()
    const s = getInvestigationState()
    expect(s.flags.block03_saturnalia_done).toBe(true)
    expect(s.flags.block03_complete).toBe(true)
    expect(s.evidenceOwned).toContain('morsa_unidentified')
    expect(s.evidenceOwned).toContain('protest_masked_core')
    expect(s.people.morsa.status).toBe('identified')
    expect(s.people.samuel.status).toBe('identified')
    expect(s.tasks.some((t) => t.id === 'task_identify_morsa' && !t.completed)).toBe(true)
  })

  it('entrevista Lívia entrega arquivo Saturnalia', () => {
    seedBlock03Start()
    applyBlock03SearchHit('livia_contact_record')
    finishLiviaInterview()
    const s = getInvestigationState()
    expect(s.evidenceOwned).toContain('livia_radio_archive_raw')
    expect(s.flags.block03_saturnalia_available).toBe(true)
  })
})
