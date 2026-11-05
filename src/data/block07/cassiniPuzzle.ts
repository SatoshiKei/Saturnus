/**
 * Puzzle 9 — Cassini-Huygens (placeholder funcional).
 * Dois SSRCs misturados numa captura RTP; separar e ordenar → duas sessões.
 * TODO(puzzle-09): reorder/jitter buffer reais sobre PCAP.
 */

export type CassiniSsrc = 'A1' | 'B7'

export interface CassiniPacket {
  id: string
  ssrc: CassiniSsrc
  seq: number
  ts: number
  note?: 'dup' | 'gap' | 'ok'
}

/** Pacotes embaralhados (ordem de captura). */
export const CASSINI_CAPTURE: CassiniPacket[] = [
  { id: 'p1', ssrc: 'A1', seq: 100, ts: 1000, note: 'ok' },
  { id: 'p2', ssrc: 'B7', seq: 200, ts: 1005, note: 'ok' },
  { id: 'p3', ssrc: 'A1', seq: 102, ts: 1040, note: 'gap' },
  { id: 'p4', ssrc: 'B7', seq: 201, ts: 1045, note: 'ok' },
  { id: 'p5', ssrc: 'A1', seq: 101, ts: 1020, note: 'ok' },
  { id: 'p6', ssrc: 'B7', seq: 200, ts: 1005, note: 'dup' },
  { id: 'p7', ssrc: 'A1', seq: 103, ts: 1060, note: 'ok' },
  { id: 'p8', ssrc: 'B7', seq: 202, ts: 1085, note: 'ok' },
]

export function packetsForSsrc(ssrc: CassiniSsrc): CassiniPacket[] {
  const seen = new Set<number>()
  return CASSINI_CAPTURE.filter((p) => p.ssrc === ssrc && p.note !== 'dup')
    .filter((p) => {
      if (seen.has(p.seq)) return false
      seen.add(p.seq)
      return true
    })
    .sort((a, b) => a.seq - b.seq)
}

export const CASSINI_SESSION_A_SUMMARY =
  'Sessão A1: Henrique fala com uma interface que responde rápido e cita detalhes de turnos anteriores.'
export const CASSINI_SESSION_B_SUMMARY =
  'Sessão B7: o interlocutor demonstra contexto acumulado e informações que Henrique não lembra de ter dado naquela chamada.'

export function isCassiniSeparated(assigned: Record<string, CassiniSsrc | ''>): boolean {
  return CASSINI_CAPTURE.filter((p) => p.note !== 'dup').every((p) => assigned[p.id] === p.ssrc)
}
