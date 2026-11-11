/** Tipos genéricos da bancada forense — UI não depende de puzzle específico. */

export type ForensicSourceType =
  | 'audio'
  | 'video'
  | 'container'
  | 'packet-capture'
  | 'radio'
  | 'data'

export type ForensicInspectorTab =
  | 'process'
  | 'analysis'
  | 'file'
  | 'structure'
  | 'packets'
  | 'timing'
  | 'compare'
  | 'notes'

export type StemId =
  | 'VOICE'
  | 'BACKGROUND_NOISE'
  | 'TONE_1700'
  | 'VOCAL_DEBRIS'
  | 'CLICKS'

export interface MetadataField {
  key: string
  label: string
  value: string
}

export interface TrackConfig {
  id: string
  name: string
  channel?: string
  /** Tracks visíveis ao jogador (mixer). Stems internos ficam em audio.stems. */
  visible: boolean
  gainDb?: number
  pan?: number
}

export interface AudioClipConfig {
  id: string
  /** URL pública do asset */
  src: string
  startSec: number
  /** Duração estimada do clip; se omitida, usa duração do buffer. */
  durationSec?: number
}

export interface StemConfig {
  id: StemId
  kind: 'clips' | 'tone' | 'noise' | 'clicks' | 'debris'
  /** Ganho inicial (linear 0–1 ou >1). */
  initialGain: number
  clips?: AudioClipConfig[]
  /** Tom contínuo */
  frequencyHz?: number
  /** Ruído / clicks gerados proceduralmente */
  density?: number
}

export interface AudioAssetConfig {
  sampleRate?: number
  channels?: number
  /** Composição interna — não aparece no mixer do jogador. */
  stems: StemConfig[]
  /** Waveform pré-calculada (0–1 amplitudes). */
  waveform?: number[]
  /** Magnitude por bin de frequência (Hz aproximado via index). */
  spectrum?: { frequencies: number[]; magnitudes: number[] }
  /** Espectrograma: rows = freq (baixo→alto), cols = tempo. */
  spectrogram?: { cols: number; rows: number; values: number[]; maxHz: number }
}

export interface StructureBlock {
  id: string
  label: string
  fields: MetadataField[]
}

export interface StructureData {
  kind: string
  emptyMessage?: string
  blocks?: StructureBlock[]
  canRebuild?: boolean
}

export interface PacketRow {
  index: number
  arrival?: number
  sequence?: number
  timestamp?: number
  stream?: string
  payload?: string
  status?: string
}

export interface PacketData {
  emptyMessage?: string
  rows?: PacketRow[]
}

export interface TimingData {
  sourceClock?: string
  offsetMs?: number
  driftPpm?: number
  syncMarker?: string
  referenceSourceId?: string
}

export interface NoiseRegion {
  id: string
  startSec: number
  endSec: number
  /** Sobreposição mínima com a seleção para perfil “bom”. */
  minOverlapRatio: number
}

export interface TranscriptionFragment {
  id: string
  /** Formas aceitas (já normalizadas ou texto bruto). */
  accepted: string[]
}

export interface ForensicSource {
  id: string
  filename: string
  type: ForensicSourceType
  durationSec: number
  displayName?: string
  audio?: AudioAssetConfig
  tracks?: TrackConfig[]
  metadata?: MetadataField[]
  structure?: StructureData
  packets?: PacketData
  timing?: TimingData
  /** Regiões predominantemente de ruído (validação interna de Noise Profile). */
  noiseRegions?: NoiseRegion[]
  /** Fragmentos para NOTES / TRANSCRIPTION quando o dataset exige. */
  transcription?: TranscriptionFragment[]
}

export interface ForensicSession {
  id: string
  title: string
  sources: ForensicSource[]
  /** Evidência do jogo que abre esta sessão. */
  evidenceId?: string
  /** Flag/handler de conclusão narrativa (opcional). */
  completion?: {
    kind: 'transcription'
    /** Chama handler externo quando completo. */
    onCompleteAction?: 'runProvisionalEmergencyAnalysis'
  }
}

export interface NoiseProfileState {
  id: string
  name: string
  startSec: number
  endSec: number
  /** Interno — não exibido ao jogador. */
  quality: 'good' | 'contaminated'
  capturedAt: number
}

export interface ProcessParams {
  gainDb: number
  pan: number
  highPassHz: number
  highPassSlope: number
  lowPassHz: number
  lowPassSlope: number
  bandPassLowHz: number
  bandPassHighHz: number
  notchCenterHz: number
  notchWidthHz: number
  notchReductionDb: number
  eqBands: Record<string, number>
  spectralReduction: number
  spectralSensitivity: number
  spectralSmoothing: number
  fadeInSec: number
  fadeOutSec: number
  reverse: boolean
  normalizePeak: number
  bypass: boolean
}

export interface SelectionRange {
  startSec: number
  endSec: number
}

export interface Marker {
  id: string
  timeSec: number
  label: string
}

export interface TrackRuntime {
  id: string
  mute: boolean
  solo: boolean
  gainDb: number
  pan: number
  visible: boolean
}

export interface ForensicUiState {
  activeSourceId: string | null
  inspectorTab: ForensicInspectorTab
  playheadSec: number
  zoom: number
  scrollSec: number
  selection: SelectionRange | null
  loop: boolean
  playbackRate: number
  playing: boolean
  markers: Marker[]
  tracks: Record<string, TrackRuntime>
  process: ProcessParams
  noiseProfiles: NoiseProfileState[]
  activeNoiseProfileId: string | null
  transcriptionNotes: string
  compareSourceA: string | null
  compareSourceB: string | null
  waveformZoomY: number
}

export const DEFAULT_PROCESS: ProcessParams = {
  gainDb: 0,
  pan: 0,
  highPassHz: 20,
  highPassSlope: 12,
  lowPassHz: 20000,
  lowPassSlope: 12,
  bandPassLowHz: 20,
  bandPassHighHz: 20000,
  notchCenterHz: 1000,
  notchWidthHz: 180,
  notchReductionDb: 0,
  eqBands: { '125': 0, '250': 0, '500': 0, '1k': 0, '2k': 0, '4k': 0, '8k': 0 },
  spectralReduction: 0,
  spectralSensitivity: 50,
  spectralSmoothing: 50,
  fadeInSec: 0,
  fadeOutSec: 0,
  reverse: false,
  normalizePeak: -1,
  bypass: false,
}

export const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5] as const

export const INSPECTOR_TABS: { id: ForensicInspectorTab; label: string }[] = [
  { id: 'process', label: 'PROCESS' },
  { id: 'analysis', label: 'ANALYSIS' },
  { id: 'file', label: 'FILE' },
  { id: 'structure', label: 'STRUCTURE' },
  { id: 'packets', label: 'PACKETS' },
  { id: 'timing', label: 'TIMING' },
  { id: 'compare', label: 'COMPARE' },
  { id: 'notes', label: 'NOTES' },
]
