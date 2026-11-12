/**
 * Puzzle 09 — Cassini-Huygens
 * Dataset forense: src/forensic/puzzles/puzzle09CassiniHuygens.ts
 */

export {
  puzzle09SsrcA as CASSINI_SSRC_A,
  puzzle09SsrcB as CASSINI_SSRC_B,
  puzzle09PacketCount as CASSINI_PACKET_COUNT,
} from '../../forensic/puzzles/puzzle09CassiniHuygens'

/** @deprecated placeholder — UI antiga removida. */
export type CassiniSsrc = 'A1' | 'B7'

/** @deprecated */
export interface CassiniPacket {
  id: string
  ssrc: CassiniSsrc
  seq: number
  ts: number
  note?: 'dup' | 'gap' | 'ok'
}

/** @deprecated */
export const CASSINI_CAPTURE: CassiniPacket[] = []

/** @deprecated */
export function packetsForSsrc(_ssrc: CassiniSsrc): CassiniPacket[] {
  return []
}

/** @deprecated */
export const CASSINI_SESSION_A_SUMMARY =
  'Stream A: conversa técnica Henrique × colega (ticket / sessões).'

/** @deprecated */
export const CASSINI_SESSION_B_SUMMARY =
  'Stream B: sessão VoIP anômala — interlocutor com contexto excessivo.'

/** @deprecated */
export function isCassiniSeparated(_assigned: Record<string, CassiniSsrc | ''>): boolean {
  return false
}
