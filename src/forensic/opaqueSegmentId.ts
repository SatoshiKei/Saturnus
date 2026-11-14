/**
 * IDs opacos player-facing para segmentos de fala.
 * Internamente `seg_lembro` etc. permanecem para save/compat.
 * Nunca deriva de palavras da transcrição.
 */

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function fnv1a(input: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

function encodeChunk(n: number, len: number): string {
  let x = n >>> 0
  let out = ''
  for (let i = 0; i < len; i++) {
    out = ALPHABET[x % ALPHABET.length]! + out
    x = Math.floor(x / ALPHABET.length)
  }
  return out
}

/** Rótulo estável tipo `SEG_AH83-JF3J4` a partir do id interno. */
export function opaqueSegmentLabel(internalId: string, sessionSalt = 'saturnus-fw'): string {
  const a = fnv1a(`${sessionSalt}|${internalId}|A`)
  const b = fnv1a(`${sessionSalt}|${internalId}|B`)
  return `SEG_${encodeChunk(a, 4)}-${encodeChunk(b, 5)}`
}

/** Estados de recuperação — não colapsar. */
export type SegmentRecoveryPhase =
  | 'signal_candidate'
  | 'processable'
  | 'intelligible'
  | 'heard'
  | 'recoveredSpeech'

export function segmentRecoveryPhase(opts: {
  clarityScore: number
  threshold: number
  heard: boolean
  recovered: boolean
}): SegmentRecoveryPhase {
  if (opts.recovered) return 'recoveredSpeech'
  if (opts.heard) return 'heard'
  if (opts.clarityScore >= opts.threshold) return 'intelligible'
  if (opts.clarityScore >= opts.threshold * 0.45) return 'processable'
  return 'signal_candidate'
}

/** Feedback permitido antes da audição — sem texto. */
export function segmentStatusGlyph(phase: SegmentRecoveryPhase): string {
  switch (phase) {
    case 'recoveredSpeech':
    case 'heard':
    case 'intelligible':
      return '✓'
    case 'processable':
      return '≈'
    default:
      return '·'
  }
}

export function formatSegmentMonitorLine(opts: {
  opaqueId: string
  clarityScore: number
  threshold: number
  phase: SegmentRecoveryPhase
}): string {
  const ratio = `${opts.clarityScore.toFixed(2)}/${opts.threshold.toFixed(2)}`
  if (opts.phase === 'intelligible' || opts.phase === 'heard' || opts.phase === 'recoveredSpeech') {
    return `${opts.opaqueId}    ✓`
  }
  if (opts.phase === 'processable') {
    return `${opts.opaqueId}    ${ratio}`
  }
  return `${opts.opaqueId}    ${ratio}`
}

/** True se o róulo player-facing vaza palavra da transcrição ou id semântico. */
export function opaqueLabelLeaksSemantics(label: string, forbiddenWords: string[]): boolean {
  const upper = label.toUpperCase()
  return forbiddenWords.some((w) => w.length >= 4 && upper.includes(w.toUpperCase()))
}
