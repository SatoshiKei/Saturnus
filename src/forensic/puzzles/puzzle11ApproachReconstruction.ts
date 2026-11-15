import type { ForensicSession, ForensicSource } from '../forensicTypes'
import meta from './puzzle11Meta.json'
import {
  CAD_FLAME_ID,
  CORRECT_CROSSING,
  RAILWAY_PASSAGES,
  ROTATION_AVL,
  ROTATION_CAD,
  ROTATION_AUDIO,
  ROTATION_CROSSINGS,
  compareTrainFingerprints,
  evaluateRotationCase,
  type RotationAudioId,
  type RotationCrossingId,
  type RotationVehicleId,
} from '../../data/block08/rotationPuzzle'
import type { ForensicUiState } from '../forensicTypes'

const WAVEFORM = Array.from({ length: 128 }, (_, i) => Math.sin(i / 6) * 0.04)

export const P11_TRAIN_REF_SOURCE_ID = 'p11_audio_train_ref'

export const P11_AUDIO_SOURCE_IDS: Record<string, RotationAudioId> = {
  [P11_TRAIN_REF_SOURCE_ID]: 'train_ref',
  p11_audio_vtr08: 'vtr08',
  p11_audio_vtr14: 'vtr14',
  p11_audio_vtr21: 'vtr21',
}

export function isApproachRadioSourceId(sourceId: string): boolean {
  return /^p11_audio_vtr/.test(sourceId)
}

/** Referência ferroviária em A; janela de rádio em B (rótulos da UI; o score é simétrico). */
export function normalizeApproachComparePair(
  firstId: string,
  secondId: string,
): { compareSourceA: string; compareSourceB: string } {
  if (firstId === P11_TRAIN_REF_SOURCE_ID && isApproachRadioSourceId(secondId)) {
    return { compareSourceA: firstId, compareSourceB: secondId }
  }
  if (secondId === P11_TRAIN_REF_SOURCE_ID && isApproachRadioSourceId(firstId)) {
    return { compareSourceA: secondId, compareSourceB: firstId }
  }
  return { compareSourceA: firstId, compareSourceB: secondId }
}

export function approachComparePatchForDrop(
  sourceId: string,
): { compareSourceA?: string; compareSourceB?: string } | null {
  if (sourceId === P11_TRAIN_REF_SOURCE_ID) {
    return { compareSourceA: sourceId }
  }
  if (isApproachRadioSourceId(sourceId)) {
    return { compareSourceB: sourceId }
  }
  return null
}

function audioSource(
  id: string,
  filename: string,
  audioKey: RotationAudioId,
  durationSec = 28,
): ForensicSource {
  const bundle = ROTATION_AUDIO[audioKey]
  return {
    id,
    filename,
    displayName: filename,
    type: 'audio',
    durationSec,
    metadata: [
      { key: 'format', label: 'Format', value: 'WAV · janela institucional' },
      { key: 'sr', label: 'Sample rate', value: '22050 Hz' },
      { key: 'origin', label: 'Origin', value: 'Pacote de abordagem — rádio / referência' },
    ],
    structure: { kind: 'wav', emptyMessage: 'Sem estrutura editável para este WAV.' },
    audio: {
      sampleRate: 22050,
      channels: 1,
      seed: meta.seed as number,
      waveform: WAVEFORM,
      stems: [{ id: 'FILE', kind: 'file', initialGain: 1, src: bundle.src }],
    },
  }
}

const railwayRegistry: ForensicSource = {
  id: 'p11_registry_rail',
  filename: 'rail_crossing_ops.ndjson',
  displayName: 'rail_crossing_ops.ndjson',
  type: 'data',
  durationSec: 0,
  metadata: [
    { key: 'format', label: 'Format', value: 'NDJSON — passagens de nível' },
    { key: 'window', label: 'Window', value: '01:00–01:30' },
    { key: 'sector', label: 'Sector', value: 'Rede ferroviária municipal' },
  ],
  structure: {
    kind: 'registry',
    blocks: [
      ...ROTATION_CROSSINGS.map((c) => ({
        id: `crossing-${c.id}`,
        label: c.label,
        consultTag: `crossing:${c.id}`,
        fields: [
          { key: 'id', label: 'Crossing ID', value: c.id },
          { key: 'sector', label: 'Sector', value: c.sector },
          { key: 'note', label: 'Notes', value: c.notes },
        ],
      })),
      ...RAILWAY_PASSAGES.map((p) => ({
        id: `passage-${p.id}`,
        label: p.composition,
        consultTag: `passage:${p.crossingId}`,
        fields: [
          { key: 'crossing', label: 'Crossing', value: p.crossingId },
          { key: 'occupy', label: 'Occupy', value: p.occupy },
          { key: 'clear', label: 'Clear', value: p.clear },
          { key: 'length', label: 'Length', value: p.lengthNote },
        ],
      })),
    ],
  },
}

const cadTape: ForensicSource = {
  id: 'p11_registry_cad',
  filename: 'cad_dispatch_tape.log',
  displayName: 'cad_dispatch_tape.log',
  type: 'data',
  durationSec: 0,
  metadata: [
    { key: 'format', label: 'Format', value: 'Dispatch log export' },
    { key: 'window', label: 'Window', value: '00:40–02:00' },
  ],
  structure: {
    kind: 'registry',
    blocks: ROTATION_CAD.map((c) => ({
      id: `cad-${c.id}`,
      label: `${c.id} · ${c.time} · ${c.priority}`,
      consultTag: `cad:${c.id}`,
      fields: [
        { key: 'sector', label: 'Sector', value: c.sector },
        { key: 'summary', label: 'Summary', value: c.summary },
        { key: 'units', label: 'Dispatch notes', value: c.unitsNoted.join('; ') },
      ],
    })),
  },
}

function avlSource(unit: RotationVehicleId): ForensicSource {
  const points = ROTATION_AVL.filter((p) => p.unit === unit)
  return {
    id: `p11_avl_${unit.toLowerCase()}`,
    filename: `avl_${unit.toLowerCase()}_export.csv`,
    displayName: `avl_${unit.toLowerCase()}_export.csv`,
    type: 'data',
    durationSec: 0,
    metadata: [
      { key: 'format', label: 'Format', value: 'AVL / GPS breadcrumb' },
      { key: 'unit', label: 'Unit', value: unit },
    ],
    structure: {
      kind: 'avl',
      emptyMessage: 'Use the packet table for chronological points.',
    },
    packets: {
      rows: points.map((p, index) => ({
        index,
        timeSec: index,
        arrival: index,
        source: unit,
        protocol: 'AVL',
        status: p.event,
        payload: `${p.time} · ${p.location} · rumo ${p.heading}`,
      })),
    },
  }
}

export const puzzle11ApproachSources: ForensicSource[] = [
  railwayRegistry,
  cadTape,
  avlSource('VTR-08'),
  avlSource('VTR-14'),
  avlSource('VTR-21'),
  audioSource('p11_audio_train_ref', 'train_reference_clean.wav', 'train_ref'),
  audioSource('p11_audio_vtr08', 'vtr08_radio_window.wav', 'vtr08'),
  audioSource('p11_audio_vtr14', 'vtr14_radio_window.wav', 'vtr14'),
  audioSource('p11_audio_vtr21', 'vtr21_radio_window.wav', 'vtr21'),
]

export const puzzle11ApproachSession: ForensicSession = {
  id: 'puzzle-11-saturn-rotation',
  title: 'FORENSIC AUDIO / DIGITAL WORKSTATION',
  evidenceId: 'rui_police_approach_records',
  completion: {
    kind: 'approach-reconstruction',
    onCompleteAction: 'onRotationSolved',
  },
  sources: puzzle11ApproachSources,
}

export function parseApproachConsultTag(tag: string):
  | { kind: 'crossing'; id: RotationCrossingId }
  | { kind: 'passage'; id: RotationCrossingId }
  | { kind: 'cad'; id: string }
  | null {
  if (tag.startsWith('crossing:')) {
    return { kind: 'crossing', id: tag.slice(9) as RotationCrossingId }
  }
  if (tag.startsWith('passage:')) {
    return { kind: 'passage', id: tag.slice(8) as RotationCrossingId }
  }
  if (tag.startsWith('cad:')) {
    return { kind: 'cad', id: tag.slice(4) }
  }
  return null
}

/** Mensagem na barra de status após “Consultar registro” (P11). */
export function approachConsultStatusMessage(tag: string): string | null {
  const parsed = parseApproachConsultTag(tag)
  if (!parsed) return null
  if (parsed.kind === 'crossing') {
    const c = ROTATION_CROSSINGS.find((x) => x.id === parsed.id)
    return c
      ? `Passagem anotada no caderno da mesa: ${c.id} (${c.label}).`
      : `Passagem anotada no caderno: ${parsed.id}.`
  }
  if (parsed.kind === 'passage') {
    const p = RAILWAY_PASSAGES.find((x) => x.crossingId === parsed.id)
    return p
      ? `Janela de ocupação anotada (${p.occupy}–${p.clear}) — vinculada a ${parsed.id}.`
      : `Janela de ocupação anotada — vinculada a ${parsed.id}.`
  }
  const c = ROTATION_CAD.find((x) => x.id === parsed.id)
  return c
    ? `Ocorrência anotada no caderno da mesa: ${c.id} · ${c.time}.`
    : `Ocorrência anotada no caderno: ${parsed.id}.`
}

/** Registro deste bloco é o que está valendo no caderno da mesa (última consulta do tipo). */
export function approachConsultTagActive(tag: string, ui: ForensicUiState): boolean {
  const parsed = parseApproachConsultTag(tag)
  if (!parsed) return false
  if (parsed.kind === 'cad') return ui.rotationCadId === parsed.id
  if (parsed.kind === 'crossing' || parsed.kind === 'passage') {
    return ui.rotationCrossingId === parsed.id
  }
  return false
}

export function avlUnitFromSourceId(sourceId: string | null): RotationVehicleId | null {
  if (!sourceId?.startsWith('p11_avl_')) return null
  const tail = sourceId.slice('p11_avl_'.length).toUpperCase()
  const compact = tail.replace(/-/g, '')
  if (compact === 'VTR08') return 'VTR-08'
  if (compact === 'VTR14') return 'VTR-14'
  if (compact === 'VTR21') return 'VTR-21'
  return null
}

export function runApproachFingerprintCompare(
  sourceAId: string | null,
  sourceBId: string | null,
): ReturnType<typeof compareTrainFingerprints> | null {
  const left = sourceAId ? P11_AUDIO_SOURCE_IDS[sourceAId] : null
  const right = sourceBId ? P11_AUDIO_SOURCE_IDS[sourceBId] : null
  if (!left || !right) return null
  return compareTrainFingerprints(left, right)
}

export function approachReconstructionComplete(_session: ForensicSession, ui: ForensicUiState): boolean {
  const ev = evaluateRotationCase({
    crossingId: (ui.rotationCrossingId ?? null) as RotationCrossingId | null,
    cadId: ui.rotationCadId,
    avlUnitsOpened: ui.rotationAvlViewed as RotationVehicleId[],
    fingerprintVehicle: ui.rotationFingerprintVehicle as RotationVehicleId | null,
    eliminated: ui.rotationEliminated as RotationVehicleId[],
  })
  return ev.canConfirm
}

/** Validações DEV — não expor na UI do jogador. */
export function approachDevSnapshot(ui: ForensicUiState) {
  const fp = {
    'VTR-08': compareTrainFingerprints('train_ref', 'vtr08').score,
    'VTR-14': compareTrainFingerprints('train_ref', 'vtr14').score,
    'VTR-21': compareTrainFingerprints('train_ref', 'vtr21').score,
  }
  const ev = evaluateRotationCase({
    crossingId: (ui.rotationCrossingId ?? CORRECT_CROSSING) as RotationCrossingId,
    cadId: ui.rotationCadId ?? CAD_FLAME_ID,
    avlUnitsOpened: ui.rotationAvlViewed as RotationVehicleId[],
    fingerprintVehicle: ui.rotationFingerprintVehicle as RotationVehicleId | null,
    eliminated: ui.rotationEliminated as RotationVehicleId[],
  })
  return {
    trainCrossingCandidate: ui.rotationCrossingId,
    trainWindow: meta.trainWindow,
    cadIncidentSelected: ui.rotationCadId,
    candidateVehicles: ['VTR-08', 'VTR-14', 'VTR-21'],
    trainFingerprintByVehicle: fp,
    vtr14Confirmed: ui.rotationFingerprintVehicle === 'VTR-14',
    vehicleRouteCompatibility: null,
    rosterOpened: null,
    augustoRevealed: null,
    puzzleComplete: null,
    ...ev,
  }
}