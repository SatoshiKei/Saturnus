import { beforeEach, describe, expect, it } from 'vitest'
import { scheduleMariApartmentReconstructionIfReady } from '../../src/game/story/block01Handlers'
import {
  dispatchActions,
  getInvestigationState,
  markDocumentRead,
  resetGame,
} from '../../src/game/state/investigationStore'

describe('scheduleMariApartmentReconstructionIfReady', () => {
  beforeEach(() => {
    resetGame()
  })

  it('não agenda sem os dois documentos lidos', () => {
    dispatchActions([
      { type: 'addDocument', id: 'doc-entrada-apartamento' },
      { type: 'addDocument', id: 'doc-apreensao-celular' },
    ])
    markDocumentRead('doc-entrada-apartamento')
    scheduleMariApartmentReconstructionIfReady()
    expect(getInvestigationState().flags.mari_apartment_scene_pending).toBeFalsy()
  })

  it('agenda one-shot após os dois laudos consultados', () => {
    dispatchActions([
      { type: 'addDocument', id: 'doc-entrada-apartamento' },
      { type: 'addDocument', id: 'doc-apreensao-celular' },
    ])
    markDocumentRead('doc-entrada-apartamento')
    markDocumentRead('doc-apreensao-celular')
    scheduleMariApartmentReconstructionIfReady()
    expect(getInvestigationState().flags.mari_apartment_scene_pending).toBe(true)
  })
})