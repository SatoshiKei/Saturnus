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

export const RING_CALLSIGN_HINT =
  'Continuidade: máscara some na área lateral; a câmera de serviço registra a saída com o mesmo rádio e a mesma mochila.'

export type ContinuityCheckId = 'backpack' | 'radio' | 'timing'

export interface RingContinuityFrame {
  id: 'morsa-frame-enter' | 'morsa-frame-lateral' | 'morsa-frame-exit'
  /** Timestamp diegético (após correção). */
  timeLabel: string
  /** Overlay de arquivo — câmeras distintas da mesma passagem. */
  cameraId: string
  caption: string
  imageSrc: string
}

/** Entrada da passagem → interior / zona cega → saída na outra extremidade. */
export const RING_CONTINUITY_FRAMES: RingContinuityFrame[] = [
  {
    id: 'morsa-frame-enter',
    timeLabel: '21:14:08',
    cameraId: 'CAM 03',
    caption: 'Entra na passagem de serviço — mascarado; mochila e rádio distintivos.',
    imageSrc: '/assets/block08/rings/morsa-enter-1.png',
  },
  {
    id: 'morsa-frame-lateral',
    timeLabel: '21:14:31',
    cameraId: 'CAM 07',
    caption: 'Já no interior da passagem — some da cobertura; objetos ainda legíveis.',
    imageSrc: '/assets/block08/rings/morsa-enter-2.png',
  },
  {
    id: 'morsa-frame-exit',
    timeLabel: '21:15:02',
    cameraId: 'CAM 11',
    caption: 'Sai pela outra extremidade — sem máscara; mesma mochila; mesmo rádio.',
    imageSrc: '/assets/block08/rings/morsa-exit.png',
  },
]

export const RING_CONTINUITY_CHECKS: { id: ContinuityCheckId; label: string }[] = [
  { id: 'backpack', label: 'Mochila / bolsa' },
  { id: 'radio', label: 'Rádio / equipamento' },
  { id: 'timing', label: 'Sequência temporal possível' },
]

export function correctedTime(s: RingSource): number {
  return s.rawTMin + s.offsetMin + s.driftMin
}

export function formatCorrectedClock(s: RingSource): string {
  const total = correctedTime(s)
  const h = Math.floor(total / 60) % 24
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function isRingOrderCorrect(order: RingSourceId[]): boolean {
  if (order.length !== RING_TRUE_ORDER.length) return false
  return order.every((id, i) => id === RING_TRUE_ORDER[i])
}

/** Ordem só pelos timestamps brutos — propositalmente errada. */
export function rawOrderByTimestamp(): RingSourceId[] {
  return [...RING_SOURCES].sort((a, b) => a.rawTMin - b.rawTMin).map((s) => s.id)
}
