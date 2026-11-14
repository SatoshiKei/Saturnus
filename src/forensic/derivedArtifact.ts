import type { ForensicDerivedArtifact } from '../game/types'
import { puzzle09SsrcB } from './puzzles/puzzle09CassiniHuygens'

/** Hash determinístico (djb2 hex) — estável entre save/load e testes. */
export function deterministicContentHash(parts: string[]): string {
  let h = 5381
  const s = parts.join('|')
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i)
  }
  // unsigned 32 + length mix for collision resistance enough for narrative ids
  const u = h >>> 0
  const len = s.length.toString(16).padStart(4, '0')
  return `${u.toString(16).padStart(8, '0')}${len}${s.length > 0 ? s.charCodeAt(0).toString(16) : '00'}`
}

export const CASSINI_STREAM_B_ARTIFACT_ID = 'cassini-stream-b'

export function buildCassiniStreamBArtifact(input: {
  audioSrc: string
  createdAtMs: number
  reconstructionOrder: ForensicDerivedArtifact['reconstructionOrder']
  parentSourceId?: string
  ssrc?: string
}): ForensicDerivedArtifact {
  const ssrc = input.ssrc ?? puzzle09SsrcB
  const parentSourceId = input.parentSourceId ?? 'hv_session_capture'
  const contentHash = deterministicContentHash([
    'cassini-stream-b',
    ssrc,
    input.reconstructionOrder,
    input.audioSrc,
    parentSourceId,
  ])
  return {
    id: CASSINI_STREAM_B_ARTIFACT_ID,
    kind: 'cassini-stream-b',
    contentHash,
    createdAtMs: input.createdAtMs,
    parentSourceId,
    ssrc,
    reconstructionOrder: input.reconstructionOrder,
    audioSrc: input.audioSrc,
  }
}
