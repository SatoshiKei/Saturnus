import { describe, expect, it } from 'vitest'
import { createInitialState } from '../../src/game/state/initialState'
import { applyStoryActions } from '../../src/game/story/actions'
import { runStoryEngine } from '../../src/game/story/engine'
import { tryConfirmContradiction } from '../../src/game/state/investigationStore'
import { __setStateForTests, getInvestigationState, resetGame } from '../../src/game/state/investigationStore'

describe('story engine', () => {
  it('completes mariana phone task when julia and rafael chats reviewed', () => {
    resetGame()
    let s = createInitialState()
    s = applyStoryActions(s, [
      { type: 'setFlag', id: 'block01_julia_memory', value: true },
      { type: 'setFlag', id: 'block01_rafael_memory', value: true },
    ])
    s = runStoryEngine(s)
    const task = s.tasks.find((t) => t.id === 'task_mariana_phone')
    expect(task?.completed).toBe(true)
  })

  it('confirms configured contradiction only', () => {
    resetGame()
    __setStateForTests(
      applyStoryActions(getInvestigationState(), [
        { type: 'addEvidence', id: 'mariana_memory_lapses' },
        { type: 'addEvidence', id: 'rafael_call_memory' },
        { type: 'addHypothesis', id: 'hyp_memory' },
      ]),
    )
    expect(tryConfirmContradiction('mariana_memory_lapses', 'rafael_call_memory')).toBe(true)
    expect(getInvestigationState().contradictionsConfirmed.length).toBe(1)
    expect(tryConfirmContradiction('initial_police_report', 'rafael_call_memory')).toBe(false)
  })
})
