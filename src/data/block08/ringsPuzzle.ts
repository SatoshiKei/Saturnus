/**
 * Puzzle 10 — Ordem dos Anéis (placeholder funcional).
 * A ordem de descoberta das fontes ≠ ordem real dos eventos; relógios dessincronizados.
 * TODO(puzzle-10): fingerprints de áudio, drift real, hashes de cópia.
 */

export type RingSourceId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

export interface RingSource {
  id: RingSourceId
  label: string
  kind: 'audio' | 'video' | 'radio' | 'camera'
  /** Timestamp bruto gravado (minutos desde 00:00 da madrugada). */
  rawTMin: number
  /** Offset a aplicar (minutos) para alinhar à timeline verdadeira. */
  offsetMin: number
  /** Drift acumulado (minutos) — correção simples no placeholder. */
  driftMin: number
  note: string
  sharedEvent?: string
}

export const RING_SOURCES: RingSource[] = [
  {
    id: 'A',
    label: 'Fonte A — áudio rádio local (Lívia)',
    kind: 'audio',
    rawTMin: 142,
    offsetMin: 0,
    driftMin: 0,
    note: 'Âncora: sirene + anúncio do corte de rua',
    sharedEvent: 'sirene-corte',
  },
  {
    id: 'B',
    label: 'Fonte B — vídeo de celular (manifestante)',
    kind: 'video',
    rawTMin: 138,
    offsetMin: 7,
    driftMin: 0,
    note: 'Mesma sirene; relógio do celular adiantado',
    sharedEvent: 'sirene-corte',
  },
  {
    id: 'C',
    label: 'Fonte C — comunicação núcleo mascarado',
    kind: 'radio',
    rawTMin: 155,
    offsetMin: -4,
    driftMin: 1,
    note: '“Morsa sumiu pela lateral”',
    sharedEvent: 'morsa-lateral',
  },
  {
    id: 'D',
    label: 'Fonte D — câmera fixa do protesto',
    kind: 'camera',
    rawTMin: 149,
    offsetMin: 2,
    driftMin: 0,
    note: 'Morsa entra na área lateral / serviço',
    sharedEvent: 'morsa-lateral',
  },
  {
    id: 'E',
    label: 'Fonte E — segundo vídeo parcial',
    kind: 'video',
    rawTMin: 160,
    offsetMin: -3,
    driftMin: 0,
    note: 'Derivado / cópia parcial de B (mesmo hash parcial)',
    sharedEvent: 'sirene-corte',
  },
  {
    id: 'F',
    label: 'Fonte F — câmera área de serviço',
    kind: 'camera',
    rawTMin: 151,
    offsetMin: 8,
    driftMin: 0,
    note: 'Saída sem máscara; rádio + mochila do núcleo',
    sharedEvent: 'saida-servico',
  },
]

/** Ordem verdadeira após correção (A âncora → … → F saída). */
export const RING_TRUE_ORDER: RingSourceId[] = ['A', 'B', 'E', 'D', 'C', 'F']

export const RING_CALLSIGN_HINT = 'Continuidade: máscara some na D; F registra a saída com o mesmo rádio/mochila.'

export function correctedTime(s: RingSource): number {
  return s.rawTMin + s.offsetMin + s.driftMin
}

export function isRingOrderCorrect(order: RingSourceId[]): boolean {
  if (order.length !== RING_TRUE_ORDER.length) return false
  return order.every((id, i) => id === RING_TRUE_ORDER[i])
}

/** Ordem só pelos timestamps brutos — propositalmente errada. */
export function rawOrderByTimestamp(): RingSourceId[] {
  return [...RING_SOURCES].sort((a, b) => a.rawTMin - b.rawTMin).map((s) => s.id)
}
