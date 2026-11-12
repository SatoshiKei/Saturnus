/**
 * Puzzle 07 — Luas Pastoras
 * Captura RF INTERCEPT_0511_RF_CAPTURE; canal oculto entre A e C → G17N / 23:40
 * → tabela logística → Galpão 17 — Pátio Norte.
 *
 * Dataset forense: src/forensic/puzzles/puzzle07ShepherdMoons.ts
 */

export const PASTOR_TOKEN = 'G17N'
export const PASTOR_LOCATION_LABEL = 'Galpão 17 — Pátio Norte'
export const PASTOR_LOCATION_ID = 'galpao-17'
export const PASTOR_DELIVERY_TIME = '23:40'

export const PASTOR_CODE_TABLE: { token: string; place: string }[] = [
  { token: 'K02S', place: 'Cais 02 — Sul' },
  { token: 'G17N', place: PASTOR_LOCATION_LABEL },
  { token: 'B08L', place: 'Box 08 — Leste' },
]

export const PASTOR_FREQUENCIES_MHZ = {
  A: 462.525,
  B: 462.575,
  C: 462.625,
} as const

/** @deprecated Placeholder XOR — mantido só para testes legados que ainda importam. */
export interface PastorCycle {
  id: string
  sequence: number
  leftA: { time: string; callsign: string; note: string }
  rightC: { time: string; callsign: string; note: string }
  burstB: { time: string; radioId: string; senderId: number; payload: number }
}

/** @deprecated */
export const PASTOR_CYCLES: PastorCycle[] = [
  {
    id: 'c1',
    sequence: 1,
    leftA: { time: '02:11:04', callsign: 'VL-A7', note: 'confirma rota' },
    rightC: { time: '02:11:18', callsign: 'VL-C2', note: 'ack' },
    burstB: { time: '02:11:11', radioId: 'R-B09', senderId: 0x12, payload: 0x12 ^ 0x47 },
  },
  {
    id: 'c2',
    sequence: 2,
    leftA: { time: '02:14:40', callsign: 'VL-A7', note: 'mudança de pátio' },
    rightC: { time: '02:14:55', callsign: 'VL-C2', note: 'ok' },
    burstB: { time: '02:14:47', radioId: 'R-B09', senderId: 0x08, payload: 0x08 ^ 0x31 },
  },
  {
    id: 'c3',
    sequence: 3,
    leftA: { time: '02:18:02', callsign: 'VL-A3', note: 'espera' },
    rightC: { time: '02:18:16', callsign: 'VL-C9', note: 'livre' },
    burstB: { time: '02:18:09', radioId: 'R-B04', senderId: 0x21, payload: 0x21 ^ 0x37 },
  },
  {
    id: 'c4',
    sequence: 4,
    leftA: { time: '02:22:30', callsign: 'VL-A7', note: 'fecha' },
    rightC: { time: '02:22:44', callsign: 'VL-C2', note: 'fim' },
    burstB: { time: '02:22:37', radioId: 'R-B09', senderId: 0x0f, payload: 0x0f ^ 0x4e },
  },
]

/** @deprecated */
export function decodeBurst(senderId: number, payload: number): string {
  return String.fromCharCode(payload ^ senderId)
}

/** @deprecated */
export function decodeCyclesInOrder(order: PastorCycle[]): string {
  return order.map((c) => decodeBurst(c.burstB.senderId, c.burstB.payload)).join('')
}

/** @deprecated */
export function isPastorOrderCorrect(ids: string[]): boolean {
  if (ids.length !== PASTOR_CYCLES.length) return false
  return ids.every((id, i) => id === PASTOR_CYCLES[i]!.id)
}

export function lookupPastorToken(token: string): string | null {
  return PASTOR_CODE_TABLE.find((r) => r.token === token)?.place ?? null
}
