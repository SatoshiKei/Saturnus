import { describe, expect, it, beforeEach } from 'vitest'
import { createInitialState } from '../../src/game/state/initialState'
import {
  __setStateForTests,
  dispatchActions,
  getInvestigationState,
  openDocument,
  resetGame,
} from '../../src/game/state/investigationStore'
import { onDocumentConsulted } from '../../src/game/story/documentConsultHooks'
import { runProvisionalEmergencyAnalysis } from '../../src/game/story/block01Handlers'

describe('task_trace_emergency_call', () => {
  beforeEach(() => {
    resetGame()
    __setStateForTests(createInitialState())
  })

  it('completa ao consultar o registro da central após P01', () => {
    runProvisionalEmergencyAnalysis()
    let s = getInvestigationState()
    const task = s.tasks.find((t) => t.id === 'task_trace_emergency_call')
    expect(task).toBeTruthy()
    expect(task?.completed).toBe(false)

    dispatchActions([{ type: 'addDocument', id: 'doc-central-chamada' }])
    openDocument('doc-central-chamada')
    onDocumentConsulted('doc-central-chamada')

    s = getInvestigationState()
    expect(s.tasks.find((t) => t.id === 'task_trace_emergency_call')?.completed).toBe(true)
  })

  it('não completa sem P01 provisional', () => {
    dispatchActions([
      { type: 'addTask', id: 'task_trace_emergency_call', label: 'Analisar origem' },
      { type: 'addDocument', id: 'doc-central-chamada' },
    ])
    onDocumentConsulted('doc-central-chamada')
    expect(
      getInvestigationState().tasks.find((t) => t.id === 'task_trace_emergency_call')?.completed,
    ).toBe(false)
  })
})
