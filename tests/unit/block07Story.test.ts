import { describe, expect, it } from 'vitest'
import {
  CASSINI_SSRC_A,
  CASSINI_SSRC_B,
} from '../../src/data/block07/cassiniPuzzle'
import {
  ENCELADUS_BURSTS,
  ENCELADUS_VOICE_FRAGMENT,
  enceladusPeriodMatches,
} from '../../src/data/block07/enceladusPuzzle'
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
import { block07EntryActions } from '../../src/game/story/block07DevCheckpoints'
import { onDocumentConsulted } from '../../src/game/story/documentConsultHooks'
import {
  finishCeciliaInterview,
  finishJuliaCamilaOnsetCheck,
  finishMiroFollowup,
  finishSandraInterview,
  onAsterHenriqueNamed,
  onCassiniSolved,
  onEnceladusSolved,
  onHenriqueRevealReflectionDone,
  onHospitalDepositDone,
  onHvReflectionDone,
  onJuliaRicardoAudioDone,
  onNotebookReflectionDone,
  onRenataCallDone,
  onRicardoDeadReflectionDone,
  onSandraReflectionDone,
  onTechReflectionDone,
  organizeMemoryOnset,
  reviewMorsaDuration,
  startBlock07,
  unlockHenriqueDump,
} from '../../src/game/story/block07Handlers'

function seed() {
  resetGame()
  __setStateForTests(runStoryEngine(applyStoryActions(createInitialState(), block07EntryActions)))
}

describe('Bloco 7 — progressão', () => {
  it('inicia a partir do fim do Bloco 6 e reabre a detenção', () => {
    resetGame()
    let s = applyStoryActions(createInitialState(), [
      { type: 'setFlag', id: 'block06_complete', value: true },
      {
        type: 'replaceTasks',
        tasks: [
          {
            id: 'task_press_miro_further',
            label: 'Até onde Miro seguiu Elisa — e o que ele ainda omite?',
            completed: false,
          },
        ],
      },
    ])
    s = runStoryEngine(s)
    __setStateForTests(s)
    startBlock07()
    const after = getInvestigationState()
    expect(after.flags.block07_started).toBe(true)
    expect(
      after.locations['detencao-miro']?.status === 'visitAvailable' ||
        after.tasks.some((t) => t.id === 'task_press_miro_further'),
    ).toBe(true)
  })

  it('Miro 2 admite descida; Sandra mantém André; Morsa + lapsos; áudio anônimo', () => {
    seed()
    finishMiroFollowup()
    let s = getInvestigationState()
    expect(s.evidenceOwned).toContain('miro_descended_fall_area')
    expect(s.evidenceOwned).toContain('miro_recovered_jana_bag')
    expect(s.flags.block07_sandra_search_unlocked).toBe(true)

    const hits = runPoliceSearch('sandra', getInvestigationState())
    expect(hits.hits.some((h) => h.documentId === 'doc-sandra-ficha')).toBe(true)
    openDocument('doc-sandra-ficha')
    expect(getInvestigationState().locations['sandra-casa']?.status).toBe('visitAvailable')

    finishSandraInterview()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('sandra_still_identifies_andre')
    expect(s.evidenceOwned).toContain('sandra_acknowledges_miro_possibility')
    onSandraReflectionDone()
    expect(getInvestigationState().flags.block07_morsa_review_unlocked).toBe(true)

    reviewMorsaDuration()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('morsa_active_long_interval')
    expect(s.evidenceOwned).toContain('mariana_focused_morsa_duration')
    expect(s.hypotheses.hyp_morsa_bridges_elisa_protests).toBeTruthy()

    organizeMemoryOnset()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('memory_anomalies_months_before')
    expect(s.evidenceOwned).toContain('onset_matches_hospital_shifts')

    finishJuliaCamilaOnsetCheck()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('no_dramatic_event_at_onset')
    expect(s.evidenceOwned).toContain('anon_hospital_burst_audio')
    expect(s.flags.block07_enceladus_available).toBe(true)
  })

  it('Puzzle 8 → Júlia → Renata → hospital → depósito → fórum → Aster → Cecília → Cassini', () => {
    seed()
    finishMiroFollowup()
    finishSandraInterview()
    onSandraReflectionDone()
    reviewMorsaDuration()
    organizeMemoryOnset()
    finishJuliaCamilaOnsetCheck()

    expect(enceladusPeriodMatches(ENCELADUS_BURSTS)).toBe(true)
    expect(ENCELADUS_VOICE_FRAGMENT).toContain('Ricardo')
    onEnceladusSolved()
    let s = getInvestigationState()
    expect(s.evidenceOwned).toContain('anon_audio_ricardo_name')
    expect(s.flags.block07_julia_ricardo_audio_unlocked).toBe(true)
    expect(s.flags.block07_ricardo_search_unlocked).toBeFalsy()

    onJuliaRicardoAudioDone()
    s = getInvestigationState()
    expect(s.flags.block07_renata_call_unlocked).toBe(true)
    expect(s.flags.block07_hospital_archive_unlocked).toBeFalsy()
    expect(s.evidenceOwned).toContain('renata_voice_on_burst')

    onRenataCallDone()
    s = getInvestigationState()
    expect(s.flags.block07_hospital_archive_unlocked).toBe(true)

    openDocument('doc-hospital-ricardo-freitas')
    onDocumentConsulted('doc-hospital-ricardo-freitas')
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('ricardo_freitas_died_that_shift')
    expect(s.flags.block07_refl_ricardo_dead_pending).toBe(true)
    expect(s.flags.block07_henrique_identified).toBeFalsy()

    onRicardoDeadReflectionDone()
    onNotebookReflectionDone()
    onHospitalDepositDone()
    onHvReflectionDone()

    const forum = runPoliceSearch('hvalenca', getInvestigationState())
    expect(forum.hits.some((h) => h.documentId === 'doc-forum-hvalenca')).toBe(true)
    openDocument('doc-forum-hvalenca')
    onDocumentConsulted('doc-forum-hvalenca')
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('hvalenca_forum_aster_mention')

    onAsterHenriqueNamed()
    s = getInvestigationState()
    expect(s.flags.block07_henrique_named).toBe(true)
    expect(s.people.henrique?.status).toBe('identified')
    expect(s.flags.block07_henrique_identified).toBeFalsy()

    onHenriqueRevealReflectionDone()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('ricardo_identity_false')
    expect(s.flags.block07_henrique_identified).toBe(true)
    expect(s.flags.block07_henrique_search_unlocked).toBe(true)

    openDocument('doc-henrique-empresa')
    openDocument('doc-henrique-incidente')
    openDocument('doc-cecilia-contato')
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('henrique_tech_company')
    expect(s.evidenceOwned).toContain('cecilia_prado_contact')
    expect(s.flags.block07_henrique_trail_done).toBe(true)
    expect(s.locations['cecilia-casa']?.status).toBe('visitAvailable')

    finishCeciliaInterview()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('cecilia_describes_henrique_decline')
    expect(s.hypotheses.hyp_unknown_tech_origin).toBeTruthy()

    unlockHenriqueDump()
    expect(getInvestigationState().evidenceOwned).toContain('henrique_rtp_capture')
    expect(getInvestigationState().flags.block07_cassini_available).toBe(true)
    expect(CASSINI_SSRC_A).toBe('48A21C30')
    expect(CASSINI_SSRC_B).toBe('91F47B12')
    expect(CASSINI_SSRC_A).not.toBe(CASSINI_SSRC_B)

    onCassiniSolved()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('henrique_two_rtp_sessions')
    expect(s.evidenceOwned).toContain('henrique_talked_to_contextual_system')
    expect(s.evidenceOwned).toContain('system_similar_to_mariana_unknown')
    expect(s.flags.block07_refl_tech_pending).toBe(true)

    onTechReflectionDone()
    s = getInvestigationState()
    expect(s.flags.block07_complete).toBe(true)
    expect(s.flags.block08_entry_ready).toBe(true)
    expect(s.tasks.some((t) => t.id === 'task_identify_morsa')).toBe(true)
    expect(s.tasks.some((t) => t.id === 'task_compare_henrique_mariana_system')).toBe(true)
    expect(s.tasks.find((t) => t.id === 'task_identify_morsa')?.completed).toBe(false)
    expect(s.flags.block08_entry_ready).toBe(true)
  })
})
