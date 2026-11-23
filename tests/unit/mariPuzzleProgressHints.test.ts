import { describe, expect, it } from 'vitest'
import { nextMariPuzzleHintTier, type MariHintTriggerContext } from '../../src/data/companion/mariPuzzleProgressHints'

const baseCtx = (patch: Partial<MariHintTriggerContext> = {}): MariHintTriggerContext => ({
  sessionOpenSec: 5,
  idleSec: 0,
  secSinceLastDismiss: 999,
  ...patch,
})

describe('nextMariPuzzleHintTier — marcos', () => {
  it('P03 h3 só após limpeza espectral sem recovered (Play obrigatório)', () => {
    const flags = { mari_p03_h1_seen: true, mari_p03_h2_seen: true }
    const early = nextMariPuzzleHintTier(
      'puzzle-03-anels',
      flags,
      baseCtx({
        sessionOpenSec: 40,
        secSinceLastDismiss: 30,
        forensic: {
          recoveredCount: 1,
          notchReductionDb: 0,
          spectralReduction: 70,
          hasNoiseProfile: true,
          inspectorTab: 'process',
          containerRebuilt: false,
          compareActive: false,
          alignmentSaved: false,
          loggerSourceOpen: false,
          clipSequenceLen: 0,
          sequenceAssembled: false,
          spectrogramViewedCount: 0,
          rfBandSelected: false,
          rfHiddenListened: false,
          similarRegionCount: 0,
          hasCommonPattern: false,
          streamARecovered: false,
          streamBRecovered: false,
          packetSortIsSequence: false,
          rotationCrossingSet: false,
          rotationCadSet: false,
          rotationCompareUsed: false,
          memoryStrongHit: false,
          memoryConfirmedCount: 0,
        },
      }),
    )
    expect(early).toBeNull()

    const ready = nextMariPuzzleHintTier(
      'puzzle-03-anels',
      flags,
      baseCtx({
        sessionOpenSec: 40,
        secSinceLastDismiss: 30,
        forensic: {
          recoveredCount: 0,
          notchReductionDb: 0,
          spectralReduction: 60,
          hasNoiseProfile: true,
          inspectorTab: 'process',
          containerRebuilt: false,
          compareActive: false,
          alignmentSaved: false,
          loggerSourceOpen: false,
          clipSequenceLen: 0,
          sequenceAssembled: false,
          spectrogramViewedCount: 0,
          rfBandSelected: false,
          rfHiddenListened: false,
          similarRegionCount: 0,
          hasCommonPattern: false,
          streamARecovered: false,
          streamBRecovered: false,
          packetSortIsSequence: false,
          rotationCrossingSet: false,
          rotationCadSet: false,
          rotationCompareUsed: false,
          memoryStrongHit: false,
          memoryConfirmedCount: 0,
        },
      }),
    )
    expect(ready?.id).toBe('p03-h3')
  })

  it('P02 h2 espera aba Structure', () => {
    const flags = { mari_p02_h1_seen: true }
    const noStruct = nextMariPuzzleHintTier(
      'puzzle-02-iapetus',
      flags,
      baseCtx({ sessionOpenSec: 10, secSinceLastDismiss: 30, forensic: undefined }),
    )
    expect(noStruct).toBeNull()

    const withStruct = nextMariPuzzleHintTier(
      'puzzle-02-iapetus',
      flags,
      baseCtx({
        sessionOpenSec: 10,
        secSinceLastDismiss: 30,
        forensic: {
          recoveredCount: 0,
          notchReductionDb: 0,
          spectralReduction: 0,
          hasNoiseProfile: false,
          inspectorTab: 'structure',
          containerRebuilt: false,
          compareActive: false,
          alignmentSaved: false,
          loggerSourceOpen: false,
          clipSequenceLen: 0,
          sequenceAssembled: false,
          spectrogramViewedCount: 0,
          rfBandSelected: false,
          rfHiddenListened: false,
          similarRegionCount: 0,
          hasCommonPattern: false,
          streamARecovered: false,
          streamBRecovered: false,
          packetSortIsSequence: false,
          rotationCrossingSet: false,
          rotationCadSet: false,
          rotationCompareUsed: false,
          memoryStrongHit: false,
          memoryConfirmedCount: 0,
        },
      }),
    )
    expect(withStruct?.id).toBe('p02-h2')
  })
})