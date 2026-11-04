import { describe, expect, it } from 'vitest'
import { createInitialState } from '../../src/game/state/initialState'
import { applyStoryActions } from '../../src/game/story/actions'
import { runStoryEngine } from '../../src/game/story/engine'
import { dispatchActions, getInvestigationState, resetGame } from '../../src/game/state/investigationStore'

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

  it('registers a configured contradiction automatically, only for the right pair', () => {
    resetGame()
    dispatchActions([
      { type: 'addEvidence', id: 'initial_police_report' },
      { type: 'addEvidence', id: 'rafael_call_memory' },
    ])
    expect(getInvestigationState().contradictionsConfirmed.length).toBe(0)
    dispatchActions([{ type: 'addEvidence', id: 'mariana_memory_lapses' }])
    const s = getInvestigationState()
    expect(s.contradictionsConfirmed.length).toBe(1)
    expect(s.contradictionsConfirmed[0].id).toBe('contra_selective_memory')
  })

  it('does not register the same contradiction twice', () => {
    resetGame()
    dispatchActions([
      { type: 'addEvidence', id: 'mariana_memory_lapses' },
      { type: 'addEvidence', id: 'rafael_call_memory' },
    ])
    dispatchActions([{ type: 'addEvidence', id: 'initial_police_report' }])
    expect(getInvestigationState().contradictionsConfirmed.length).toBe(1)
  })
})
