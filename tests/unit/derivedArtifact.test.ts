import { describe, expect, it, beforeEach } from 'vitest'
import {
  buildCassiniStreamBArtifact,
  CASSINI_STREAM_B_ARTIFACT_ID,
  deterministicContentHash,
} from '../../src/forensic/derivedArtifact'
import { createInitialState } from '../../src/game/state/initialState'
import {
  __setStateForTests,
  getInvestigationState,
  markForensicDerivedArtifact,
  resetForensicSpeechProgress,
  resetGame,
} from '../../src/game/state/investigationStore'

describe('Forensic derived artifact (P09 → P12)', () => {
  beforeEach(() => {
    resetGame()
    __setStateForTests(createInitialState())
  })

  it('hash is deterministic for the same inputs', () => {
    const a = deterministicContentHash(['cassini-stream-b', 'seq', 'x'])
    const b = deterministicContentHash(['cassini-stream-b', 'seq', 'x'])
    const c = deterministicContentHash(['cassini-stream-b', 'capture', 'x'])
    expect(a).toBe(b)
    expect(a).not.toBe(c)
  })

  it('persists stream B artifact and clears on DEV reset of henrique capture', () => {
    const art = buildCassiniStreamBArtifact({
      audioSrc: '/assets/audio/forensic/puzzle09/stream_b_reconstructed.wav',
      createdAtMs: 42,
      reconstructionOrder: 'sequence',
      ssrc: '0xBEEF',
      parentSourceId: 'hv_session_capture',
    })
    expect(art.id).toBe(CASSINI_STREAM_B_ARTIFACT_ID)
    markForensicDerivedArtifact(art)
    expect(getInvestigationState().forensicDerivedArtifacts?.[art.id]?.contentHash).toBe(
      art.contentHash,
    )
    resetForensicSpeechProgress('henrique_rtp_capture')
    expect(getInvestigationState().forensicDerivedArtifacts?.[art.id]).toBeUndefined()
  })
})
