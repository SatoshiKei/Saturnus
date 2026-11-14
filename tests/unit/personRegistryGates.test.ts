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

describe('personRegistryGates — Nico (pendência)', () => {
  it('repair fecha Falar com Nico após visita antecipada', () => {
    let inv = createInitialState()
    inv = applyStoryActions(inv, [
      { type: 'addTask', id: 'task_talk_nico', label: 'Falar com Nico' },
      { type: 'setFlag', id: 'nico_early_done', value: true },
    ])
    const fixed = repairInvestigationState(inv)
    expect(fixed.tasks.find((t) => t.id === 'task_talk_nico')?.completed).toBe(true)
    expect(fixed.flags.block03_nico_interview_done).toBeFalsy()
  })

  it('repair fecha Falar com Lívia após entrevista / Saturnália', () => {
    let inv = createInitialState()
    inv = applyStoryActions(inv, [
      { type: 'addTask', id: 'task_talk_livia', label: 'Ir à redação da Rádio Costeira' },
      { type: 'addEvidence', id: 'livia_radio_archive_raw' },
    ])
    const fixed = repairInvestigationState(inv)
    expect(fixed.tasks.find((t) => t.id === 'task_talk_livia')?.completed).toBe(true)
  })

  it('repair fecha Falar com Nico se Janus já foi feito', () => {
    let inv = createInitialState()
    inv = applyStoryActions(inv, [
      { type: 'addTask', id: 'task_talk_nico', label: 'Falar com Nico' },
      { type: 'setFlag', id: 'block03_janus_done', value: true },
    ])
    const fixed = repairInvestigationState(inv)
    expect(fixed.tasks.find((t) => t.id === 'task_talk_nico')?.completed).toBe(true)
    expect(fixed.flags.block03_nico_interview_done).toBe(true)
  })
})

describe('personRegistryGates — Samuel', () => {
  it('Saturnalia sozinho não mostra Samuel', () => {
    let inv = createInitialState()
    inv = applyStoryActions(inv, [{ type: 'setFlag', id: 'block03_saturnalia_done', value: true }])
    expect(isPersonVisibleInRegistry('samuel', inv)).toBe(false)
  })

  it('lista de detidos / search unlock mostra Samuel', () => {
    let inv = createInitialState()
    inv = applyStoryActions(inv, [
      { type: 'setFlag', id: 'block04_samuel_search_unlocked', value: true },
    ])
    expect(isPersonVisibleInRegistry('samuel', inv)).toBe(true)
  })
})
