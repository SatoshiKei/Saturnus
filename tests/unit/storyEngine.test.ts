import { describe, expect, it } from 'vitest'
import { createInitialState } from '../../src/game/state/initialState'
import { applyStoryActions } from '../../src/game/story/actions'
import { runStoryEngine } from '../../src/game/story/engine'
import { tryConfirmContradiction } from '../../src/game/state/investigationStore'
import { __setStateForTests, getInvestigationState, resetGame } from '../../src/game/state/investigationStore'

describe('story engine', () => {
  it('unlocks rafael when audio evidence owned', () => {
    resetGame()
    let s = createInitialState()
    s = applyStoryActions(s, [{ type: 'addEvidence', id: 'rafael_audio_01' }])
    s = runStoryEngine(s)
    expect(s.people.rafael.status).toBe('identified')
  })

  it('confirms configured contradiction only', () => {
    resetGame()
    __setStateForTests(
      applyStoryActions(getInvestigationState(), [
        { type: 'addEvidence', id: 'julia_statement_memory' },
        { type: 'addEvidence', id: 'mariana_memory_audio' },
      ]),
    )
    expect(tryConfirmContradiction('julia_statement_memory', 'mariana_memory_audio')).toBe(true)
    expect(getInvestigationState().contradictionsConfirmed.length).toBe(1)
    expect(tryConfirmContradiction('bo_inicial', 'mariana_memory_audio')).toBe(false)
  })
})
