import { describe, expect, it } from 'vitest'
import { createInitialUiState, cycleDifferenceComplete, evaluateCycleDifference } from '../../src/forensic/forensicEngine'
import {
  puzzle08CycleAnalysis,
  puzzle08EnceladusSession,
  puzzle08RecoveredText,
} from '../../src/forensic/puzzles/puzzle08Enceladus'

describe('P08 residual → listen → Recovered Speech', () => {
  it('preserva somente Ricardo (não frase completa)', () => {
    expect(puzzle08RecoveredText).toBe('Ricardo')
    expect(puzzle08RecoveredText.toLowerCase()).not.toMatch(/espera|renata/)
  })

  it('Difference ok sozinho NÃO completa; Recovered Speech exige segmento após residual', () => {
    const cfg = puzzle08CycleAnalysis
    const normals = [0, 1, 2, 3, 4, 6, 7]
    const ok = evaluateCycleDifference(cfg, 5, normals, 1)
    expect(ok.ok).toBe(true)

    let ui = createInitialUiState(puzzle08EnceladusSession)
    ui = {
      ...ui,
      cycleDifferenceDone: true,
      differenceQuality: ok.quality,
      ricardoClarity: ok.ricardoClarity,
      recoveredSpeech: [],
    }
    expect(cycleDifferenceComplete(puzzle08EnceladusSession, ui)).toBe(false)

    ui = {
      ...ui,
      recoveredSpeech: [
        {
          segmentId: cfg.recoveredSpeech.segmentId,
          text: cfg.recoveredSpeech.text,
          startSec: cfg.recoveredSpeech.startSec,
          unlockedAt: 1,
        },
      ],
    }
    expect(cycleDifferenceComplete(puzzle08EnceladusSession, ui)).toBe(true)
    expect(ui.recoveredSpeech.map((r) => r.text)).toEqual(['Ricardo'])
  })

  it('config de residual não pré-insere speech no source base AUD_0008', () => {
    const base = puzzle08EnceladusSession.sources[0]
    expect(base?.speechSegments?.length ?? 0).toBe(0)
    expect(base?.cycleAnalysis?.residualPreviewSrc).toBeTruthy()
    expect(base?.cycleAnalysis?.recoveredSpeech.text).toBe('Ricardo')
  })
})
