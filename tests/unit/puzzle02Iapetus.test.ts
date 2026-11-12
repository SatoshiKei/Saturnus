import { describe, expect, it } from 'vitest'
import {
  createInitialUiState,
  effectivePlayableUntil,
  fileMetadataForContainer,
  rebuildContainer,
  resetProcess,
  resolveStructurePages,
  structureSequenceValid,
} from '../../src/forensic/forensicEngine'
import {
  puzzle02CorruptPageId,
  puzzle02DamagedPlayableUntilSec,
  puzzle02ExpectedSequence,
  puzzle02IapetusSession,
  puzzle02ContainerDurationSec,
  puzzle02SpeechSegments,
} from '../../src/forensic/puzzles/puzzle02Iapetus'
import { puzzle01CassiniSession } from '../../src/forensic/puzzles/puzzle01Cassini'

const source = puzzle02IapetusSession.sources[0]!

describe('Puzzle 02 — IAPETUS engine', () => {
  it('A — initial playback truncates before end', () => {
    const ui = createInitialUiState(puzzle02IapetusSession)
    expect(effectivePlayableUntil(source, ui.containerRebuilt)).toBe(
      puzzle02DamagedPlayableUntilSec,
    )
    expect(puzzle02DamagedPlayableUntilSec).toBeLessThan(puzzle02ContainerDurationSec)
    const meta = fileMetadataForContainer(source, false)
    expect(meta.find((m) => m.key === 'containerDuration')?.value).toMatch(/33\.411/)
    expect(meta.find((m) => m.key === 'decodedDuration')?.value).toMatch(/22\.260/)
    expect(meta.find((m) => m.key === 'decodeNote')?.value).toMatch(/before container EOF/i)
  })

  it('B — Gain/EQ/Notch do not unlock final region (process reset keeps structure)', () => {
    const ui = {
      ...createInitialUiState(puzzle02IapetusSession),
      process: {
        ...createInitialUiState(puzzle02IapetusSession).process,
        gainDb: 12,
        notchCenterHz: 1700,
        notchReductionDb: -24,
        spectralReduction: 80,
      },
    }
    expect(effectivePlayableUntil(source, ui.containerRebuilt)).toBe(
      puzzle02DamagedPlayableUntilSec,
    )
    const afterReset = resetProcess(ui)
    expect(afterReset.containerRebuilt).toBe(false)
    expect(effectivePlayableUntil(source, afterReset.containerRebuilt)).toBe(
      puzzle02DamagedPlayableUntilSec,
    )
  })

  it('C — Rebuild without editing Sequence does not resolve', () => {
    const result = rebuildContainer(source, {})
    expect(result.ok).toBe(false)
    expect(result.message).toMatch(/structural warnings/i)
    expect(structureSequenceValid(source, {})).toBe(false)
    const pages = resolveStructurePages(source, {}, false)
    const corrupt = pages.find((p) => p.id === puzzle02CorruptPageId)!
    expect(corrupt.sequence).toBe(12)
    expect(corrupt.crcStatus).toBe('mismatch')
  })

  it('D — Wrong Sequence + Rebuild does not resolve', () => {
    const sequences = { [puzzle02CorruptPageId]: 9 }
    const result = rebuildContainer(source, sequences)
    expect(result.ok).toBe(false)
    expect(structureSequenceValid(source, sequences)).toBe(false)
    expect(effectivePlayableUntil(source, result.ok)).toBe(puzzle02DamagedPlayableUntilSec)
  })

  it('E — Sequence 5 without Rebuild keeps truncated playback and CRC mismatch', () => {
    const sequences = { [puzzle02CorruptPageId]: puzzle02ExpectedSequence }
    expect(structureSequenceValid(source, sequences)).toBe(true)
    const pages = resolveStructurePages(source, sequences, false)
    const corrupt = pages.find((p) => p.id === puzzle02CorruptPageId)!
    expect(corrupt.sequence).toBe(5)
    expect(corrupt.crcStatus).toBe('mismatch')
    expect(effectivePlayableUntil(source, false)).toBe(puzzle02DamagedPlayableUntilSec)
  })

  it('F — Sequence 5 + Rebuild unlocks full playback and valid CRC', () => {
    const sequences = { [puzzle02CorruptPageId]: puzzle02ExpectedSequence }
    const result = rebuildContainer(source, sequences)
    expect(result.ok).toBe(true)
    expect(result.message).toMatch(/Decode map reconstructed/i)
    const pages = resolveStructurePages(source, sequences, true)
    const corrupt = pages.find((p) => p.id === puzzle02CorruptPageId)!
    expect(corrupt.sequence).toBe(5)
    expect(corrupt.crcStatus).toBe('valid')
    expect(effectivePlayableUntil(source, true)).toBe(puzzle02ContainerDurationSec)
    const meta = fileMetadataForContainer(source, true)
    expect(meta.find((m) => m.key === 'decodedDuration')?.value).toMatch(/33\.411/)
    expect(meta.find((m) => m.key === 'decodeNote')?.value).toMatch(/Decode complete/i)
  })

  it('G — completion requires rebuilt + vertice speech segment', () => {
    const completion = puzzle02IapetusSession.completion!
    expect(completion.kind).toBe('container-rebuild')
    expect(completion.requireSpeechSegmentIds).toContain('seg_vertice')
    expect(completion.onCompleteAction).toBe('runProvisionalRafaelForwardAnalysis')
    const vertice = puzzle02SpeechSegments.find((s) => s.id === 'seg_vertice')!
    expect(vertice.text).toBe('isso aí foi gravado no Vértice')
    expect(vertice.requiresContainerRebuild).toBe(true)
    expect(vertice.startSec).toBeGreaterThan(puzzle02DamagedPlayableUntilSec)
  })

  it('H — dataset never reveals Nico or Elisa', () => {
    const blob = JSON.stringify(puzzle02IapetusSession)
    expect(blob).not.toMatch(/nico|elisa|Nico|Elisa/i)
    expect(blob).toMatch(/Vértice/)
  })

  it('does not alter Puzzle 01 session identity', () => {
    expect(puzzle01CassiniSession.id).toBe('puzzle-01-cassini')
    expect(puzzle01CassiniSession.evidenceId).toBe('emergency_call_raw')
    expect(puzzle02IapetusSession.evidenceId).toBe('rafael_forward_from_mariana')
  })

  it('Reset processing preserves container rebuild finding', () => {
    const ui = {
      ...createInitialUiState(puzzle02IapetusSession),
      containerRebuilt: true,
      structureSequences: { [puzzle02CorruptPageId]: 5 },
      rebuildCount: 2,
    }
    const after = resetProcess(ui)
    expect(after.containerRebuilt).toBe(true)
    expect(after.structureSequences[puzzle02CorruptPageId]).toBe(5)
    expect(after.rebuildCount).toBe(2)
  })
})
