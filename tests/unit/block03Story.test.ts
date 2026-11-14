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
  finishLiviaInterview,
  finishNicoInterview,
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
    expect(hits.some((h) => h.documentId === 'doc-nico-cadastro')).toBe(true)

    expect(getInvestigationState().contacts['contact-nico']?.unlocked).toBeFalsy()
    openDocument('doc-nico-cadastro')
    const after = getInvestigationState()
    expect(after.evidenceOwned).toContain('nico_current_record')
    expect(after.people.nico.status).toBe('located')
    expect(after.contacts['contact-nico']?.unlocked).toBe(true)
    expect(after.tasks.some((t) => t.id === 'task_locate_nico' && t.completed)).toBe(true)
  })

  it('entrevista Nico entrega gravações Janus', () => {
    seedBlock03Start()
    openDocument('doc-nico-cadastro')
    finishNicoInterview()
    finishNicoInterview()
    const s = getInvestigationState()
    expect(s.flags.block03_nico_interview_done).toBe(true)
    expect(s.evidenceOwned).toContain('nico_recording_booth')
    expect(s.evidenceOwned.filter((id) => id === 'nico_mariana_visit').length).toBe(1)
    expect(s.people.nico.status).toBe('interviewed')
  })

  it('Janus exige a captura da cabine e gera inconsistência sem absolver', () => {
    seedBlock03Start()
    runProvisionalJanusSync()
    expect(getInvestigationState().flags.block03_janus_done).toBeFalsy()

    __setStateForTests(
      applyStoryActions(getInvestigationState(), [
        { type: 'addEvidence', id: 'nico_recording_booth' },
      ]),
    )
    runProvisionalJanusSync()
    const s = getInvestigationState()
    expect(s.flags.block03_janus_done).toBe(true)
    expect(s.evidenceOwned).toContain('vertice_clocks_unsynced')
    expect(s.evidenceOwned).toContain('mariana_revising_elisa_chronology')
    expect(s.evidenceOwned).not.toContain('sandra_first_sighting_not_elisa')
    expect(s.flags.block03_reanalysis_unlocked).toBeFalsy()
    expect(s.hypotheses.hyp_andre_imprecise_chronology).toBeTruthy()
  })

  it('pesquisa Maralto libera Lívia; cruzamento não liga a Elisa', () => {
    seedBlock03Start()
    __setStateForTests(
      applyStoryActions(getInvestigationState(), [
        { type: 'discoverSearchTerm', term: 'maralto' },
      ]),
    )
    openDocument('doc-maralto-cadastro')
    openDocument('doc-maralto-clipping')
    let s = getInvestigationState()
    expect(s.flags.block03_maralto_researched).toBe(true)
    expect(s.people.livia.status).toBe('identified')
    expect(s.contacts['contact-livia']?.unlocked).toBe(true)

    const cross = runPoliceSearch('maralto elisa', s)
    expect(cross.hits.some((h) => h.documentId === 'doc-cruzamento-maralto-elisa')).toBe(true)
    openDocument('doc-cruzamento-maralto-elisa')
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
    // Saturnalia nomeia Morsa. Samuel continua no caminho ocorrência → detidos → ficha.
    expect(s.people.samuel.status).not.toBe('identified')
    expect(s.people.samuel.status).not.toBe('located')
    expect(s.people.samuel.status).not.toBe('interviewed')
    expect(s.tasks.some((t) => t.id === 'task_identify_morsa' && !t.completed)).toBe(true)
    const protests = runPoliceSearch('protesto', s)
    expect(protests.hits.some((h) => h.documentId === 'doc-protesto-ocorrencia')).toBe(true)
    expect(protests.hits.some((h) => h.documentId === 'doc-protesto-detidos')).toBe(true)
    expect(runPoliceSearch('morsa', s).hits.length).toBe(0)
  })

  it('entrevista Lívia entrega arquivo Saturnalia', () => {
    seedBlock03Start()
    finishLiviaInterview()
    const s = getInvestigationState()
    expect(s.evidenceOwned).toContain('livia_radio_archive_raw')
    expect(s.flags.block03_saturnalia_available).toBe(true)
  })
})