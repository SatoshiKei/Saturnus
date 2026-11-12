/**
 * Puzzle 08 — Enceladus
 * Repetição de ciclos → Find Similar → Common Pattern → Difference → “Ricardo”.
 * Dataset forense: src/forensic/puzzles/puzzle08Enceladus.ts
 */

export const ENCELADUS_VOICE_FRAGMENT = 'Ricardo'
export const ENCELADUS_CYCLE_COUNT = 8
export const ENCELADUS_CYCLE_SEC = 6
export const ENCELADUS_ANOMALY_CYCLE = 6 // 1-based
export const ENCELADUS_DURATION_SEC = 48
export const ENCELADUS_UI_FILENAME = 'AUD_0008.wav'

/** @deprecated Placeholder de rajadas — UI antiga removida. */
export interface EnceladusBurst {
  id: string
  tSec: number
  kind: 'equip' | 'voice' | 'noise'
  label: string
}

/** @deprecated */
export const ENCELADUS_BURSTS: EnceladusBurst[] = [
  { id: 'b1', tSec: 6, kind: 'equip', label: 'ciclo' },
  { id: 'b2', tSec: 12, kind: 'equip', label: 'ciclo' },
  { id: 'b3', tSec: 36, kind: 'voice', label: 'fragmento' },
]

/** @deprecated */
export const ENCELADUS_REF_TABLE: { id: string; label: string; match: boolean }[] = []

/** @deprecated */
export function enceladusPeriodMatches(_bursts: EnceladusBurst[]): boolean {
  return true
}
