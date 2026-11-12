import { describe, expect, it } from 'vitest'
import {
  RING_TRUE_ORDER,
  isRingOrderCorrect,
  rawOrderByTimestamp,
} from '../../src/data/block08/ringsPuzzle'
import {
  ROTATION_CALLSIGN,
  isRotationSynced,
  resolveCallsignAfterSync,
} from '../../src/data/block08/rotationPuzzle'
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
import { block08EntryActions } from '../../src/game/story/block08DevCheckpoints'
import { onDocumentConsulted } from '../../src/game/story/documentConsultHooks'
import {
  finishAndreFollowup,
  finishBiaInterview,
  finishDenisInterview,
  finishMauroInterview,
  finishMiroThird,
  finishRuiInterview,
  onAccidentReflectionDone,
  onAndreWronglyReflectionDone,
  onDetranMauroCallDone,
  onFinalReflectionDone,
  onJaguarLeadReflectionDone,
  onMiroGuardrailReflectionDone,
  onMorsaContinuityConfirmed,
  onMorsaReflectionDone,
  onPartsShopDenisLead,
  onRingsTimelineSolved,
  onRotationSolved,
  onScaleLinksAugusto,
  requestGuardrailReexam,
} from '../../src/game/story/block08Handlers'

function seed() {
  resetGame()
  __setStateForTests(runStoryEngine(applyStoryActions(createInitialState(), block08EntryActions)))
}

describe('Bloco 8 — progressão', () => {
  it('inicia a partir do fim do Bloco 7 e libera Puzzle 10', () => {
    resetGame()
    let s = applyStoryActions(createInitialState(), [
      { type: 'setFlag', id: 'block07_complete', value: true },
      {
        type: 'replaceTasks',
        tasks: [
          { id: 'task_identify_morsa', label: 'Descobrir quem era Morsa', completed: false },
          {
            id: 'task_compare_henrique_mariana_system',
            label: 'Comparar sistemas',
            completed: false,
          },
        ],
      },
    ])
    s = runStoryEngine(s)
    expect(s.flags.block08_started).toBe(true)
    expect(s.flags.block08_rings_available).toBe(true)
    expect(s.evidenceOwned).toContain('protest_heterogeneous_sources')
  })

  it('Puzzle 10 → Morsa=André → André → Miro3 → guardrail', () => {
    seed()
    expect(isRingOrderCorrect(RING_TRUE_ORDER)).toBe(true)
    expect(rawOrderByTimestamp().join('')).not.toBe(RING_TRUE_ORDER.join(''))

    onRingsTimelineSolved()
    let s = getInvestigationState()
    expect(s.flags.block08_rings_timeline_solved).toBe(true)
    expect(s.evidenceOwned).toContain('protest_timeline_reconstructed')
    expect(s.evidenceOwned).not.toContain('morsa_was_andre')

    onMorsaContinuityConfirmed()
    s = getInvestigationState()
    expect(s.flags.block08_morsa_continuity_confirmed).toBe(true)
    expect(s.flags.block08_refl_morsa_pending).toBe(true)
    expect(s.flags.block08_morsa_reveal_played).toBe(true)
    expect(s.evidenceOwned).toContain('morsa_was_andre')

    onMorsaReflectionDone()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('morsa_was_andre')
    expect(s.evidenceOwned).toContain('andre_morsa_alibi_interval')
    expect(s.tasks.find((t) => t.id === 'task_identify_morsa')?.completed).toBe(true)
    expect(s.locations.presidio?.status).toBe('visitAvailable')

    finishAndreFollowup()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('andre_admits_morsa')
    expect(s.hypotheses.hyp_andre_killed_elisa?.state).toBe('discarded')

    onAndreWronglyReflectionDone()
    expect(getInvestigationState().locations['detencao-miro']?.status).toBe('visitAvailable')

    finishMiroThird()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('miro_says_guardrail_gave_way')
    expect(s.flags.block08_refl_miro_guardrail_pending).toBe(true)
    expect(s.flags.block08_guardrail_reexam_unlocked).toBeFalsy()

    onMiroGuardrailReflectionDone()
    expect(getInvestigationState().flags.block08_guardrail_reexam_unlocked).toBe(true)

    openDocument('doc-guardrail-reanalise')
    onDocumentConsulted('doc-guardrail-reanalise')
    requestGuardrailReexam()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('guardrail_impact_signs')
    expect(s.evidenceOwned).toContain('jaguar_x300_paint_fragment')
    expect(s.flags.block08_vehicle_search_unlocked).toBeFalsy()

    onJaguarLeadReflectionDone()
    onPartsShopDenisLead()
    expect(getInvestigationState().locations['oficina-denis']?.status).toBe('visitAvailable')
  })

  it('Dênis → DETRAN → Mauro → Bia → Rui → Puzzle 11 → escala → estado final', () => {
    seed()
    onMorsaContinuityConfirmed()
    onMorsaReflectionDone()
    finishAndreFollowup()
    onAndreWronglyReflectionDone()
    finishMiroThird()
    onMiroGuardrailReflectionDone()
    requestGuardrailReexam()
    onJaguarLeadReflectionDone()
    onPartsShopDenisLead()

    const cam = runPoliceSearch('guardrail', getInvestigationState())
    expect(cam.hits.some((h) => h.documentId === 'doc-camera-veiculo-madrugada')).toBe(false)

    finishDenisInterview()
    let s = getInvestigationState()
    expect(s.evidenceOwned).toContain('denis_remembers_jaguar_green')
    expect(s.flags.block08_detran_call_unlocked).toBe(true)

    onDetranMauroCallDone()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('jaguar_registered_mauro')
    expect(s.locations['mauro-casa']?.status).toBe('visitAvailable')

    finishMauroInterview()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('bia_used_jaguar_without_permission')
    expect(s.locations['bia-casa']?.status).toBe('visitAvailable')

    finishBiaInterview()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('bia_was_with_rui')
    expect(s.locations['rui-casa']?.status).toBe('visitAvailable')

    finishRuiInterview()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('rui_admits_drunk_crash')
    expect(s.evidenceOwned).toContain('rui_stopped_by_police_before')
    expect(s.evidenceOwned).toContain('elisa_death_accident_reconstruction')
    expect(s.hypotheses.hyp_elisa_died_accident?.state).toBe('confirmed')

    onAccidentReflectionDone()
    expect(getInvestigationState().flags.block08_rotation_available).toBe(true)

    expect(isRotationSynced({ radio: 0, cad: -3, dispatch: -2, scale: 1 })).toBe(true)
    expect(resolveCallsignAfterSync()).toBe(ROTATION_CALLSIGN)
    onRotationSolved()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('approach_callsign_reconstructed')
    expect(s.flags.block08_scale_search_unlocked).toBe(true)

    openDocument('doc-escala-vtr14')
    onDocumentConsulted('doc-escala-vtr14')
    onScaleLinksAugusto()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('scale_links_callsign_to_augusto')
    expect(s.flags.block08_refl_final_pending).toBe(true)

    onFinalReflectionDone()
    s = getInvestigationState()
    expect(s.flags.block08_complete).toBe(true)
    expect(s.flags.block09_entry_ready).toBe(true)
    expect(s.tasks.some((t) => t.id === 'task_how_mariana_knew')).toBe(true)
    expect(s.hypotheses.hyp_augusto_causal_in_chain?.state).toBe('confirmed')
    expect(s.hypotheses.hyp_mariana_chose_augusto?.state).toBe('confirmed')
  })
})
