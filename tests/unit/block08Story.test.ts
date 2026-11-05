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
import {
  finishAndreFollowup,
  finishBiaInterview,
  finishDenisInterview,
  finishMauroInterview,
  finishMiroThird,
  finishRuiInterview,
  onAccidentReflectionDone,
  onAndreWronglyReflectionDone,
  onFinalReflectionDone,
  onMorsaReflectionDone,
  onRingsSolved,
  onRotationSolved,
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

    onRingsSolved()
    let s = getInvestigationState()
    expect(s.evidenceOwned).toContain('morsa_was_andre')
    expect(s.evidenceOwned).toContain('andre_morsa_alibi_interval')
    expect(s.tasks.find((t) => t.id === 'task_identify_morsa')?.completed).toBe(true)

    onMorsaReflectionDone()
    expect(getInvestigationState().locations.presidio?.status).toBe('visitAvailable')

    finishAndreFollowup()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('andre_admits_morsa')
    expect(s.hypotheses.hyp_andre_killed_elisa?.state).toBe('discarded')

    onAndreWronglyReflectionDone()
    expect(getInvestigationState().locations['detencao-miro']?.status).toBe('visitAvailable')

    finishMiroThird()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('miro_says_guardrail_gave_way')
    expect(s.flags.block08_guardrail_reexam_unlocked).toBe(true)

    requestGuardrailReexam()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('guardrail_impact_signs')
    expect(s.flags.block08_vehicle_search_unlocked).toBe(true)
  })

  it('Mauro → Dênis → Bia → Rui → Puzzle 11 → escala → estado final', () => {
    seed()
    onRingsSolved()
    onMorsaReflectionDone()
    finishAndreFollowup()
    onAndreWronglyReflectionDone()
    finishMiroThird()
    requestGuardrailReexam()

    openDocument('doc-camera-veiculo-madrugada')
    let s = getInvestigationState()
    expect(s.evidenceOwned).toContain('mauro_vehicle_compatible_damage')
    expect(s.locations['mauro-casa']?.status).toBe('visitAvailable')

    finishMauroInterview()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('mauro_repair_transfer_denis')
    expect(s.locations['oficina-denis']?.status).toBe('visitAvailable')

    finishDenisInterview()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('vehicle_guardrail_damage_match')
    expect(s.flags.block08_bia_search_unlocked).toBe(true)

    const biaHits = runPoliceSearch('bia', getInvestigationState())
    expect(biaHits.hits.some((h) => h.documentId === 'doc-bia-ficha')).toBe(true)
    openDocument('doc-bia-ficha')
    finishBiaInterview()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('bia_was_with_rui')

    openDocument('doc-rui-ficha')
    finishRuiInterview()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('rui_admits_drunk_crash')
    expect(s.evidenceOwned).toContain('rui_stopped_by_police_before')
    expect(s.evidenceOwned).toContain('elisa_death_accident_reconstruction')
    expect(s.hypotheses.hyp_elisa_died_accident?.state).toBe('confirmed')

    onAccidentReflectionDone()
    expect(getInvestigationState().flags.block08_rotation_available).toBe(true)

    expect(
      isRotationSynced({ radio: 0, cad: -3, dispatch: -2, scale: 1 }),
    ).toBe(true)
    expect(resolveCallsignAfterSync()).toBe(ROTATION_CALLSIGN)
    onRotationSolved()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('approach_callsign_reconstructed')
    expect(s.flags.block08_scale_search_unlocked).toBe(true)

    openDocument('doc-escala-vtr14')
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
