/**
 * Puzzle 11 — Rotação de Saturno.
 * Depoimento → passagem ferroviária → CAD urgente → AVL/rádio → fingerprint → VTR-14 → escala.
 * Sem offset/drift/ENF/sliders.
 */

import meta from '../../forensic/puzzles/puzzle11Meta.json'

export const ROTATION_CALLSIGN = 'VTR-14' as const

export type RotationCrossingId =
  | 'PN-SUL-01'
  | 'PN-CENTRO-02'
  | 'PN-NORTE-03'
  | 'PN-OESTE-04'

export type RotationVehicleId = 'VTR-08' | 'VTR-14' | 'VTR-21'

export type RotationAudioId = 'train_ref' | 'vtr08' | 'vtr14' | 'vtr21'

export interface RotationCrossing {
  id: RotationCrossingId
  label: string
  sector: string
  /** Relação espacial com o guardrail / via auxiliar onde Rui bateu. */
  towardGuardrail: boolean
  notes: string
}

export interface RailwayPassage {
  id: string
  composition: string
  crossingId: RotationCrossingId
  occupy: string
  clear: string
  lengthNote: string
}

export interface CadIncident {
  id: string
  time: string
  priority: 'routine' | 'priority' | 'urgent'
  sector: string
  summary: string
  unitsNoted: string[]
}

export interface AvlPoint {
  id: string
  time: string
  unit: RotationVehicleId
  location: string
  heading: string
  event: string
}

export interface RotationVehicle {
  id: RotationVehicleId
  sectorStart: string
  activity: string
  radioNote: string
  /** Compatível com rota pós-abordagem → ocorrência de chamas. */
  flameRouteOk: boolean
  /** Compatível com proximidade da passagem correta + janela do trem. */
  crossingProximityOk: boolean
  /** Direção de saída compatível com relato (sentido contrário ao de Rui). */
  exitDirectionOk: boolean
}

export const ROTATION_CROSSINGS: RotationCrossing[] = [
  {
    id: 'PN-SUL-01',
    label: 'Passagem Sul — ramal industrial',
    sector: 'Sul / industrial',
    towardGuardrail: false,
    notes: 'Longe da via auxiliar norte. Rui seguia para o guardrail no sentido oposto.',
  },
  {
    id: 'PN-CENTRO-02',
    label: 'Passagem Centro — linha urbana',
    sector: 'Centro',
    towardGuardrail: false,
    notes: 'Centro urbano; não fica entre a via auxiliar e o ponto da colisão.',
  },
  {
    id: 'PN-NORTE-03',
    label: 'Passagem Norte — setor auxiliar',
    sector: 'Via auxiliar norte',
    towardGuardrail: true,
    notes: 'Na rota que Rui descreveu: após a cancela, poucos minutos até o guardrail.',
  },
  {
    id: 'PN-OESTE-04',
    label: 'Passagem Oeste — acesso ao porto',
    sector: 'Oeste / porto',
    towardGuardrail: false,
    notes: 'Ramal portuário; fora do corredor da via auxiliar.',
  },
]

export const CORRECT_CROSSING: RotationCrossingId = 'PN-NORTE-03'

export const RAILWAY_PASSAGES: RailwayPassage[] = [
  {
    id: 'comp-a',
    composition: 'Composição 4412 — carga longa',
    crossingId: 'PN-NORTE-03',
    occupy: '01:12',
    clear: '01:18',
    lengthNote: 'ocupação prolongada (vários minutos)',
  },
  {
    id: 'comp-b',
    composition: 'Composição 2280 — passageiros',
    crossingId: 'PN-CENTRO-02',
    occupy: '00:55',
    clear: '00:57',
    lengthNote: 'passagem curta',
  },
  {
    id: 'comp-c',
    composition: 'Composição 1190 — carga',
    crossingId: 'PN-SUL-01',
    occupy: '01:05',
    clear: '01:09',
    lengthNote: 'média',
  },
  {
    id: 'comp-d',
    composition: 'Composição 3301 — manobra',
    crossingId: 'PN-OESTE-04',
    occupy: '01:20',
    clear: '01:22',
    lengthNote: 'curta',
  },
]

export const ROTATION_CAD: CadIncident[] = [
  {
    id: 'CAD-1839',
    time: '00:48',
    priority: 'routine',
    sector: 'Centro',
    summary: 'Barulho em via pública — sem vítimas.',
    unitsNoted: ['VTR-21'],
  },
  {
    id: 'CAD-1844',
    time: '01:02',
    priority: 'priority',
    sector: 'Sul industrial',
    summary: 'Alarme comercial — verificação.',
    unitsNoted: ['VTR-08'],
  },
  {
    id: 'CAD-1847',
    time: '01:21',
    priority: 'urgent',
    sector: 'Via auxiliar norte / acostamento km 4',
    summary: 'Veículo em chamas no acostamento — possível ocupante no interior.',
    unitsNoted: ['unidade próxima solicitada', 'apoio em deslocamento'],
  },
  {
    id: 'CAD-1851',
    time: '01:40',
    priority: 'routine',
    sector: 'Porto',
    summary: 'Controle de acesso — veículo parado irregular.',
    unitsNoted: ['VTR-21'],
  },
]

export const CAD_FLAME_ID = 'CAD-1847'

export const ROTATION_VEHICLES: RotationVehicle[] = [
  {
    id: 'VTR-08',
    sectorStart: 'Sul industrial',
    activity: 'Verificação de alarme comercial (CAD-1844); permanece no sul após 01:10.',
    radioNote: 'Canal com tráfego de alarme; sem assinatura ferroviária.',
    flameRouteOk: false,
    crossingProximityOk: false,
    exitDirectionOk: false,
  },
  {
    id: 'VTR-14',
    sectorStart: 'Via auxiliar norte',
    activity: 'Patrulha na auxiliar; após 01:18 desloca-se no sentido da ocorrência CAD-1847.',
    radioNote: 'Janela com fundo ferroviário distante na passagem norte.',
    flameRouteOk: true,
    crossingProximityOk: true,
    exitDirectionOk: true,
  },
  {
    id: 'VTR-21',
    sectorStart: 'Centro / porto',
    activity: 'Rotina urbana; horário próximo, mas longe da passagem norte.',
    radioNote: 'Estática de tráfego; sem padrão do trem de referência.',
    flameRouteOk: true,
    crossingProximityOk: false,
    exitDirectionOk: false,
  },
]

export const ROTATION_AVL: AvlPoint[] = [
  {
    id: 'avl-08-a',
    time: '01:04',
    unit: 'VTR-08',
    location: 'Setor sul — galpão comercial',
    heading: 'S',
    event: 'chegada alarme',
  },
  {
    id: 'avl-08-b',
    time: '01:19',
    unit: 'VTR-08',
    location: 'Setor sul — permanece no perímetro',
    heading: 'SW',
    event: 'ainda no sul',
  },
  {
    id: 'avl-08-c',
    time: '01:24',
    unit: 'VTR-08',
    location: 'Setor sul — saída do local',
    heading: 'S',
    event: 'não cruza auxiliar norte',
  },
  {
    id: 'avl-14-a',
    time: '01:14',
    unit: 'VTR-14',
    location: 'Via auxiliar norte — próximo PN-NORTE-03',
    heading: 'N',
    event: 'patrulha / abordagem informal',
  },
  {
    id: 'avl-14-b',
    time: '01:19',
    unit: 'VTR-14',
    location: 'Via auxiliar norte — sentido contrário ao fluxo sul',
    heading: 'N',
    event: 'saída rápida após liberação',
  },
  {
    id: 'avl-14-c',
    time: '01:23',
    unit: 'VTR-14',
    location: 'Acostamento km 4 — aproximação CAD-1847',
    heading: 'N',
    event: 'deslocamento para veículo em chamas',
  },
  {
    id: 'avl-21-a',
    time: '01:10',
    unit: 'VTR-21',
    location: 'Centro — praça',
    heading: 'E',
    event: 'rotina',
  },
  {
    id: 'avl-21-b',
    time: '01:20',
    unit: 'VTR-21',
    location: 'Acesso porto — fora do setor auxiliar',
    heading: 'W',
    event: 'longe da passagem norte',
  },
  {
    id: 'avl-21-c',
    time: '01:26',
    unit: 'VTR-21',
    location: 'Porto — controle de acesso',
    heading: 'W',
    event: 'CAD-1851',
  },
]

export const ROTATION_AUDIO: Record<
  RotationAudioId,
  { id: RotationAudioId; label: string; src: string }
> = {
  train_ref: {
    id: 'train_ref',
    label: 'Referência ferroviária (filtrada / rádio)',
    src: meta.audio.reference,
  },
  vtr08: {
    id: 'vtr08',
    label: 'Rádio VTR-08 — janela 01:12–01:24',
    src: meta.audio.vtr08,
  },
  vtr14: {
    id: 'vtr14',
    label: 'Rádio VTR-14 — janela 01:12–01:24',
    src: meta.audio.vtr14,
  },
  vtr21: {
    id: 'vtr21',
    label: 'Rádio VTR-21 — janela 01:12–01:24',
    src: meta.audio.vtr21,
  },
}

const ENV = meta.env as {
  reference: number[]
  vtr14: number[]
  vtr08: number[]
  vtr21: number[]
}

const THRESHOLD = meta.fingerprintThreshold as number

function pearson(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length)
  if (n < 4) return 0
  let sa = 0
  let sb = 0
  for (let i = 0; i < n; i++) {
    sa += a[i]
    sb += b[i]
  }
  const ma = sa / n
  const mb = sb / n
  let num = 0
  let da = 0
  let db = 0
  for (let i = 0; i < n; i++) {
    const xa = a[i] - ma
    const xb = b[i] - mb
    num += xa * xb
    da += xa * xa
    db += xb * xb
  }
  const den = Math.sqrt(da * db)
  return den < 1e-12 ? 0 : num / den
}

function envFor(id: RotationAudioId): number[] {
  if (id === 'train_ref') return ENV.reference
  if (id === 'vtr14') return ENV.vtr14
  if (id === 'vtr08') return ENV.vtr08
  return ENV.vtr21
}

/** Audio Fingerprint Compare — referência do trem × rádio de viatura. */
export function compareTrainFingerprints(
  left: RotationAudioId,
  right: RotationAudioId,
): { match: boolean; score: number; message: string; vehicleHit: RotationVehicleId | null } {
  if (left === right) {
    return { match: false, score: 0, message: 'Selecione duas fontes diferentes.', vehicleHit: null }
  }
  const pair = new Set([left, right])
  const score = Math.max(0, pearson(envFor(left), envFor(right)))
  const isTrainVs14 = pair.has('train_ref') && pair.has('vtr14')
  const match = isTrainVs14 && score >= THRESHOLD
  if (match) {
    return {
      match: true,
      score,
      message: 'Assinatura compartilhada forte — a gravação foi feita perto da mesma passagem durante aquele trem.',
      vehicleHit: 'VTR-14',
    }
  }
  if (pair.has('train_ref') && (pair.has('vtr08') || pair.has('vtr21'))) {
    return {
      match: false,
      score,
      message: 'Sobreposição fraca — o padrão ferroviário de referência não aparece neste canal.',
      vehicleHit: null,
    }
  }
  return {
    match: false,
    score,
    message: 'Sem assinatura ferroviária compartilhada relevante.',
    vehicleHit: null,
  }
}

export interface RotationCaseState {
  crossingId: RotationCrossingId | null
  cadId: string | null
  avlUnitsOpened: RotationVehicleId[]
  fingerprintVehicle: RotationVehicleId | null
  eliminated: RotationVehicleId[]
}

export function evaluateRotationCase(state: RotationCaseState): {
  crossingOk: boolean
  cadOk: boolean
  fingerprintOk: boolean
  avl14Ok: boolean
  eliminatedOk: boolean
  vtr14Only: boolean
  canConfirm: boolean
  vtr14Score: number
} {
  const crossingOk = state.crossingId === CORRECT_CROSSING
  const cadOk = state.cadId === CAD_FLAME_ID
  const fingerprintOk = state.fingerprintVehicle === 'VTR-14'
  const avl14Ok = state.avlUnitsOpened.includes('VTR-14')
  const elim = new Set(state.eliminated)
  const eliminatedOk = elim.has('VTR-08') && elim.has('VTR-21') && !elim.has('VTR-14')
  let score = 0
  if (crossingOk) score += 1
  if (cadOk) score += 1
  if (fingerprintOk) score += 2
  if (avl14Ok) score += 1
  if (eliminatedOk) score += 1
  const vtr14Only = crossingOk && cadOk && fingerprintOk && avl14Ok && eliminatedOk
  return {
    crossingOk,
    cadOk,
    fingerprintOk,
    avl14Ok,
    eliminatedOk,
    vtr14Only,
    canConfirm: vtr14Only,
    vtr14Score: score,
  }
}

/** @deprecated placeholder API — mantido só se algum import antigo restar. */
export type RotationSystemId = 'radio' | 'cad' | 'dispatch' | 'scale'
export function resolveCallsignAfterSync(): string {
  return ROTATION_CALLSIGN
}
export function isRotationSynced(_o: Record<string, number>): boolean {
  return false
}
