import { describe, expect, it } from 'vitest'
import { createInitialState } from '../../src/game/state/initialState'
import { applyStoryActions } from '../../src/game/story/actions'
import { isPersonVisibleInRegistry, repairInvestigationState } from '../../src/game/personRegistryGates'

describe('personRegistryGates — Lucas', () => {
  it('oculta Lucas sem flag nem evidência Paula', () => {
    const inv = createInitialState()
    expect(isPersonVisibleInRegistry('lucas', inv)).toBe(false)
  })

  it('mostra Lucas quando só existe paula_leads_lucas (save desync)', () => {
    let inv = createInitialState()
    inv = applyStoryActions(inv, [{ type: 'addEvidence', id: 'paula_leads_lucas' }])
    expect(inv.flags.block02_paula_chat_done).toBeFalsy()
    expect(isPersonVisibleInRegistry('lucas', inv)).toBe(true)
  })

  it('repair sincroniza flags a partir da evidência', () => {
    let inv = createInitialState()
    inv = applyStoryActions(inv, [{ type: 'addEvidence', id: 'paula_leads_lucas' }])
    const fixed = repairInvestigationState(inv)
    expect(fixed.flags.block02_paula_chat_done).toBe(true)
  })
})
