/**
 * Puzzle 11 — Rotação de Saturno (placeholder funcional).
 * Relógios de sistemas policiais com offsets/drift; âncoras → indicativo da viatura.
 * TODO(puzzle-11): pares de eventos e drift contínuo reais.
 */

export type RotationSystemId = 'radio' | 'cad' | 'dispatch' | 'scale'

export interface RotationLog {
  id: string
  system: RotationSystemId
  rawTMin: number
  offsetMin: number
  event: string
  callsign?: string
}

export const ROTATION_LOGS: RotationLog[] = [
  { id: 'r1', system: 'radio', rawTMin: 78, offsetMin: 0, event: 'abertura-ocorrencia-norte' },
  { id: 'r2', system: 'cad', rawTMin: 81, offsetMin: -3, event: 'abertura-ocorrencia-norte' },
  { id: 'r3', system: 'dispatch', rawTMin: 80, offsetMin: -2, event: 'abertura-ocorrencia-norte' },
  { id: 'r4', system: 'radio', rawTMin: 92, offsetMin: 0, event: 'abordagem-via-auxiliar', callsign: 'VTR-14' },
  { id: 'r5', system: 'cad', rawTMin: 96, offsetMin: -3, event: 'abordagem-via-auxiliar' },
  { id: 'r6', system: 'dispatch', rawTMin: 94, offsetMin: -2, event: 'abordagem-via-auxiliar', callsign: 'VTR-14' },
  { id: 'r7', system: 'scale', rawTMin: 90, offsetMin: 1, event: 'registro-equipe-noite' },
  { id: 'r8', system: 'radio', rawTMin: 88, offsetMin: 0, event: 'chamado-ruido', callsign: 'VTR-09' },
  { id: 'r9', system: 'cad', rawTMin: 91, offsetMin: -3, event: 'chamado-ruido' },
]

export const ROTATION_CALLSIGN = 'VTR-14'
export const ROTATION_ANCHOR_EVENT = 'abordagem-via-auxiliar'

export function correctedRotationTime(log: RotationLog): number {
  return log.rawTMin + log.offsetMin
}

/** Após correção, só VTR-14 cobre local+horário da abordagem. */
export function resolveCallsignAfterSync(): string {
  const anchors = ROTATION_LOGS.filter((l) => l.event === ROTATION_ANCHOR_EVENT)
  const withCs = anchors.find((l) => l.callsign)
  return withCs?.callsign ?? ROTATION_CALLSIGN
}

export function isRotationSynced(appliedOffsets: Record<RotationSystemId, number>): boolean {
  const systems: RotationSystemId[] = ['radio', 'cad', 'dispatch']
  return systems.every((sys) => {
    const sample = ROTATION_LOGS.find((l) => l.system === sys)!
    return appliedOffsets[sys] === sample.offsetMin
  })
}
