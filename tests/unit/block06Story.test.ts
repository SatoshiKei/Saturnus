import { describe, expect, it } from 'vitest'
import {
  PASTOR_CYCLES,
  PASTOR_TOKEN,
  decodeCyclesInOrder,
  isPastorOrderCorrect,
} from '../../src/data/block06/pastorMoonsPuzzle'
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
import { block06EntryActions } from '../../src/game/story/block06DevCheckpoints'
import {
  finishGeraldoInterview,
  finishJanaFollowup,
  finishMiroInterview,
  finishPoliceOperation,
  onGeraldoReflectionDone,
  onMiroReflectionDone,
  onPastorMoonsSolved,
} from '../../src/game/story/block06Handlers'

function seed() {
  resetGame()
  __setStateForTests(runStoryEngine(applyStoryActions(createInitialState(), block06EntryActions)))
}

describe('Bloco 6 — progressão', () => {
  it('inicia a partir do fim do Bloco 5', () => {
    resetGame()
    let s = applyStoryActions(createInitialState(), [
      { type: 'setFlag', id: 'block05_complete', value: true },
    ])
    s = runStoryEngine(s)
    expect(s.flags.block06_started).toBe(true)
    expect(s.flags.block06_geraldo_search_unlocked).toBe(true)
  })

  it('Geraldo é localizado pelos autos (ficha com endereço)', () => {
    seed()
    const hits = runPoliceSearch('geraldo', getInvestigationState())
    expect(hits.hits.some((h) => h.documentId === 'doc-geraldo-ficha')).toBe(true)
    openDocument('doc-geraldo-ficha')
    openDocument('doc-vertice-comanda-noitex')
    const s = getInvestigationState()
    expect(s.locations['geraldo-casa']?.status).toBe('visitAvailable')
    expect(s.evidenceOwned).toContain('vertice_comanda_night_x')
  })

  it('Geraldo → Jana2 → Válter docs → Puzzle G17N → operação → Miro → estado final', () => {
    seed()
    openDocument('doc-geraldo-ficha')
    openDocument('doc-vertice-comanda-noitex')
    finishGeraldoInterview()
    expect(getInvestigationState().evidenceOwned).toContain('geraldo_minimized_alcohol')
    onGeraldoReflectionDone()
    expect(getInvestigationState().locations['jana-casa']?.status).toBe('visitAvailable')

    finishJanaFollowup()
    let s = getInvestigationState()
    expect(s.evidenceOwned).toContain('jana_gave_belongings_deliberately')
    expect(s.evidenceOwned).toContain('jana_feared_valter_people')
    expect(s.flags.block06_valter_search_unlocked).toBe(true)

    openDocument('doc-valter-ocorrencias')
    openDocument('doc-valter-associados')
    openDocument('doc-valter-interceptacao')
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('miro_linked_to_valter_group')
    expect(s.flags.block06_pastor_available).toBe(true)
    expect(s.people.miro?.status).not.toBe('mentioned')

    expect(decodeCyclesInOrder(PASTOR_CYCLES)).toBe(PASTOR_TOKEN)
    expect(isPastorOrderCorrect(PASTOR_CYCLES.map((c) => c.id))).toBe(true)
    onPastorMoonsSolved()
    expect(getInvestigationState().evidenceOwned).toContain('pastor_token_g17n')
    expect(getInvestigationState().evidenceOwned).toContain('galpao17_operational_site')
    expect(getInvestigationState().locations['galpao-17']?.status).toBe('visitAvailable')

    finishPoliceOperation()
    expect(getInvestigationState().evidenceOwned).toContain('miro_arrested_current_crimes')
    expect(getInvestigationState().locations['detencao-miro']?.status).toBe('visitAvailable')

    finishMiroInterview()
    s = getInvestigationState()
    expect(s.evidenceOwned).toContain('miro_followed_elisa_by_mistake')
    expect(s.hypotheses.hyp_miro_followed_to_fall).toBeTruthy()
    expect(s.hypotheses.hyp_lookalike_may_not_be_andre).toBeTruthy()

    onMiroReflectionDone()
    s = getInvestigationState()
    expect(s.flags.block06_complete).toBe(true)
    expect(s.flags.block07_entry_ready).toBe(true)
    expect(s.tasks.some((t) => t.id === 'task_locate_sandra')).toBe(true)
  })
})
