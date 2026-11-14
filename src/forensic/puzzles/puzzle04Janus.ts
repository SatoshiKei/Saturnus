import type { ForensicSession, ForensicSource } from '../forensicTypes'
import { buildCompositeWaveform } from '../forensicMix'

/** Offset canônico: relógio do Vértice atrasado 7m30s. */
export const puzzle04ExpectedOffsetSec = 450
export const puzzle04OffsetToleranceSec = 0.2
export const puzzle04DjEventSec = 72
export const puzzle04DurationSec = 180

/** Origens na timeline compartilhada (Fonte A mais tarde no tempo real). */
export const puzzle04SourceAOriginSec = 450
export const puzzle04SourceBOriginSec = 0

export const puzzle04FindingText =
  'Sandra não poderia ter visto Elisa no primeiro avistamento.'

export const puzzle04SetLogVerticeTime = '01:16:00'
export const puzzle04SandraApproxTime = '~01:16'

/** Deriva horário real a partir do set log (relógio Vertice) + offset formalizado. */
export function deriveCorrectedRealTime(
  setLogVerticeTime: string,
  offsetSec: number,
): string {
  const m = /^(\d{1,2}):(\d{2}):(\d{2})$/.exec(setLogVerticeTime.trim())
  if (!m) return setLogVerticeTime
  const total =
    Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) + Math.round(offsetSec)
  const h = Math.floor(total / 3600) % 24
  const min = Math.floor((total % 3600) / 60)
  const sec = total % 60
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export const puzzle04CorrectedRealTime = deriveCorrectedRealTime(
  puzzle04SetLogVerticeTime,
  puzzle04ExpectedOffsetSec,
)

const PHONE_SRC = '/assets/audio/forensic/puzzle04/puzzle04_phone_source.wav'
const DESK_SRC = '/assets/audio/forensic/puzzle04/puzzle04_desk_source.mp3'

function audioWave(seed: number, noiseFloor: number) {
  return buildCompositeWaveform({
    durationSec: puzzle04DurationSec,
    seed,
    noiseFloor,
    voice: [
      { startSec: 0, endSec: puzzle04DjEventSec, amplitude: 0.7 },
      {
        startSec: puzzle04DjEventSec,
        endSec: puzzle04DjEventSec + 18.7,
        amplitude: 0.52,
      },
      { startSec: puzzle04DjEventSec + 18.7, endSec: puzzle04DurationSec, amplitude: 0.76 },
    ],
  })
}

const phoneSource: ForensicSource = {
  id: 'janus_phone',
  filename: 'REC_VTX_PHONE_NX.m4a',
  displayName: 'REC_VTX_PHONE_NX.m4a',
  type: 'audio',
  durationSec: puzzle04DurationSec,
  timelineOriginSec: puzzle04SourceAOriginSec,
  tracks: [
    { id: 'phone', name: 'PHONE', channel: '1 / mono', visible: true, gainDb: 0, pan: 0 },
  ],
  timing: {
    sourceClock: 'external / messaging backup',
    referenceSourceId: 'janus_phone',
    offsetMs: 0,
    absoluteStartLabel: '01:22:18 REAL',
    eventClockAtDj: '01:23:30 REAL',
    externalStamp: 'WA_MEDIA_RX 01:25:18 ↔ file end',
  },
  metadata: [
    { key: 'filename', label: 'Filename', value: 'REC_VTX_PHONE_NX.m4a' },
    { key: 'container', label: 'Container', value: 'MPEG-4 / AAC' },
    { key: 'duration', label: 'Duration', value: '03:00.000' },
    { key: 'source', label: 'Source', value: 'Ambient phone capture (Noite X)' },
    {
      key: 'chain',
      label: 'Chain',
      value: 'Celular associado a Elisa → Lucas → Mariana → Rafael → Augusto',
    },
    { key: 'clock', label: 'Clock reference', value: 'External messaging server stamp' },
    { key: 'externalStamp', label: 'External stamp', value: 'WA_MEDIA_RX 01:25:18' },
    { key: 'fileStart', label: 'File start (real)', value: '01:22:18' },
  ],
  structure: { kind: 'm4a', emptyMessage: 'No editable structure for this source.' },
  audio: {
    sampleRate: 44100,
    channels: 1,
    seed: 2041104,
    waveform: audioWave(2041104, 0.28),
    stems: [{ id: 'FILE', kind: 'file', initialGain: 1, src: PHONE_SRC }],
  },
}

const deskSource: ForensicSource = {
  id: 'janus_desk',
  filename: 'VTX_DESK_FEED_NX.wav',
  displayName: 'VTX_DESK_FEED_NX.wav',
  type: 'audio',
  durationSec: puzzle04DurationSec,
  timelineOriginSec: puzzle04SourceBOriginSec,
  tracks: [
    { id: 'desk', name: 'DESK', channel: '1 / mono', visible: true, gainDb: 0, pan: 0 },
  ],
  timing: {
    sourceClock: 'Vertice local / cabine',
    referenceSourceId: 'janus_phone',
    offsetMs: 0,
    absoluteStartLabel: '01:14:48 VÉRTICE',
    eventClockAtDj: '01:16:00 VÉRTICE',
  },
  metadata: [
    { key: 'filename', label: 'Filename', value: 'VTX_DESK_FEED_NX.wav' },
    { key: 'container', label: 'Container', value: 'WAV / PCM' },
    { key: 'duration', label: 'Duration', value: '03:00.000' },
    { key: 'source', label: 'Source', value: 'Automatic desk feed — Vertice booth' },
    { key: 'chain', label: 'Chain', value: 'Nico (arquivo técnico da casa) → Augusto' },
    { key: 'clock', label: 'Clock reference', value: 'Vertice local system' },
    { key: 'fileStart', label: 'File start (Vertice)', value: '01:14:48' },
  ],
  structure: { kind: 'wav', emptyMessage: 'No editable structure for this source.' },
  audio: {
    sampleRate: 44100,
    channels: 1,
    seed: 2041105,
    waveform: audioWave(2041105, 0.08),
    stems: [{ id: 'FILE', kind: 'file', initialGain: 1, src: DESK_SRC }],
  },
}

const setLogSource: ForensicSource = {
  id: 'janus_set_log_levels',
  filename: 'VTX-SET-LOG-LEVELS.txt',
  displayName: 'VTX-SET-LOG-LEVELS.txt',
  type: 'data',
  durationSec: 0,
  metadata: [
    { key: 'record', label: 'Record', value: 'VTX-SET-LOG · Noite X' },
    { key: 'entry', label: 'Program entry', value: 'Avicii — Levels' },
    {
      key: 'transition',
      label: 'Transition / close',
      value: `${puzzle04SetLogVerticeTime} (Vertice clock)`,
    },
    { key: 'note', label: 'Note', value: 'House programming timestamp — local system' },
  ],
  setRecord: {
    setId: 'VTX-SET-LOG-LEVELS',
    operatorLabel: 'Cabine / programação',
    bpmBefore: 0,
    bpmAfter: 0,
    interventionStartSec: 0,
    interventionEndSec: 0,
    notes: 'Avicii — Levels · transição/encerramento ~01:16:00 (relógio da casa)',
  },
}

const infraSource: ForensicSource = {
  id: 'janus_clock_infra',
  filename: 'VTX-CLOCK-INFRA.txt',
  displayName: 'VTX-CLOCK-INFRA.txt',
  type: 'data',
  durationSec: 0,
  metadata: [
    {
      key: 'scope',
      label: 'Scope',
      value: 'Booth recorder · set logs · programming timestamps',
    },
    {
      key: 'reference',
      label: 'Time reference',
      value: 'Shared local house clock',
    },
    {
      key: 'note',
      label: 'Note',
      value: 'Same local reference used for desk feed labels and set-log times.',
    },
  ],
}

const sandraCompareSource: ForensicSource = {
  id: 'janus_sandra_window',
  filename: 'SANDRA-SIGHTING-WINDOW.txt',
  displayName: 'SANDRA-SIGHTING-WINDOW.txt',
  type: 'data',
  durationSec: 0,
  metadata: [
    {
      key: 'first',
      label: 'First sighting (approx.)',
      value: `${puzzle04SandraApproxTime} real — woman with light jacket + bag, followed`,
    },
    {
      key: 'help',
      label: 'Help call (external)',
      value: '~01:27 real — reliable call log',
    },
    {
      key: 'second',
      label: 'Second sighting',
      value: 'Male silhouette leaving dark area near guardrail — face not identified',
    },
  ],
}

export const puzzle04JanusSession: ForensicSession = {
  id: 'puzzle-04-janus-epimetheus',
  title: 'FORENSIC AUDIO / DIGITAL WORKSTATION',
  evidenceId: 'nico_recording_booth',
  completion: {
    kind: 'clock-sync',
    onCompleteAction: 'runJanusEpimetheusAnalysis',
    expectedOffsetSec: puzzle04ExpectedOffsetSec,
    offsetToleranceSec: puzzle04OffsetToleranceSec,
    setLogVerticeTime: puzzle04SetLogVerticeTime,
    correctedRealTime: puzzle04CorrectedRealTime,
    findingText: puzzle04FindingText,
  },
  sources: [phoneSource, deskSource, setLogSource, infraSource, sandraCompareSource],
}
