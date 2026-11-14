import { describe, expect, it, beforeEach } from 'vitest'
import {
  caseMediaCorpusForState,
  isMemoryProvenanceComplete,
  searchCaseMedia,
  MEMORY_REGIONS,
} from '../../src/data/block09/memoryPuzzle'
import { createInitialState } from '../../src/game/state/initialState'
import {
  __setStateForTests,
  getInvestigationState,
  migrateState,
  resetGame,
  restoreGameSnapshot,
} from '../../src/game/state/investigationStore'
import { createGameSaveSnapshot } from '../../src/game/state/gameSave'

describe('P09→P12 runtime artifact obrigatório', () => {
  beforeEach(() => {
    resetGame()
    __setStateForTests(createInitialState())
  })

  it('sem cassini-stream-b, região D não confirma strong hit', () => {
    const regionD = MEMORY_REGIONS.find((r) => r.source === 'cassini_derived')!
    const hits = searchCaseMedia(regionD.start + 0.05, regionD.end - 0.05, {})
    const strongD = hits.filter((h) => h.source === 'cassini_derived' && h.strong)
    expect(strongD).toHaveLength(0)
    const corpus = caseMediaCorpusForState({})
    const derived = corpus.find((m) => m.id === 'media-cassini-derived')!
    expect(derived.sha256).toBeUndefined()
    expect(derived.createdAt).toBeUndefined()
  })

  it('com artifact runtime, D pode ser strong; provenance completa exige as 4', () => {
    const art = {
      'cassini-stream-b': {
        id: 'cassini-stream-b',
        kind: 'cassini-stream-b' as const,
        contentHash: 'sha256:runtime-test',
        createdAtMs: Date.now(),
        parentSourceId: 'hv_session_capture',
        ssrc: 'B',
        reconstructionOrder: 'sequence' as const,
        audioSrc: '/assets/audio/forensic/puzzle09/stream_b.wav',
      },
    }
    const regionD = MEMORY_REGIONS.find((r) => r.source === 'cassini_derived')!
    const hits = searchCaseMedia(regionD.start + 0.05, regionD.end - 0.05, art)
    expect(hits.some((h) => h.source === 'cassini_derived' && h.strong)).toBe(true)
    expect(
      isMemoryProvenanceComplete(
        new Set(['apartment', 'emergency', 'enceladus', 'cassini_derived']),
      ),
    ).toBe(true)
    expect(isMemoryProvenanceComplete(new Set(['apartment', 'emergency', 'enceladus']))).toBe(
      false,
    )
  })

  it('save/load preserva forensicDerivedArtifacts entre P09 e P12', () => {
    const base = createInitialState()
    const withArt = {
      ...base,
      forensicDerivedArtifacts: {
        'cassini-stream-b': {
          id: 'cassini-stream-b',
          kind: 'cassini-stream-b' as const,
          contentHash: 'sha256:persist',
          createdAtMs: 1_700_000_000_000,
          parentSourceId: 'hv_session_capture',
          ssrc: 'B',
          reconstructionOrder: 'sequence' as const,
          audioSrc: '/assets/audio/forensic/puzzle09/stream_b.wav',
        },
      },
      flags: { ...base.flags, block07_cassini_done: true },
    }
    const snap = createGameSaveSnapshot(withArt, null)
    restoreGameSnapshot(snap, { persist: false })
    const loaded = getInvestigationState()
    expect(loaded.forensicDerivedArtifacts?.['cassini-stream-b']?.contentHash).toBe('sha256:persist')

    const migrated = migrateState({
      ...withArt,
      version: 1,
    } as typeof withArt)
    expect(migrated.forensicDerivedArtifacts?.['cassini-stream-b']?.contentHash).toBe(
      'sha256:persist',
    )
  })
})
