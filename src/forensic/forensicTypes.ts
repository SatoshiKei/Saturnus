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
  | 'CORRUPTED_BASE'
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
  /** Duração do clip em segundos (perfil de ruído e waveform). */
  durationSec?: number
  /** Ganho relativo interno, em dB, aplicado depois de um level-match opcional. */
  gainDb?: number
}

export interface GainWindow {
  startSec: number
  endSec: number
  /** Multiplicador linear de amplitude. */
  gain: number
}

export interface DebrisFragment {
  src: string
  sourceOffsetSec: number
  durationMs: number
  timelineSec: number
  gainDb: number
  reverse?: boolean
}

export interface ClickEvent {
  timeSec: number
  durationMs: number
  /** Amplitude de pico antes do ganho do stem, 0–1. */
  amplitude: number
}

export interface DropoutEvent {
  timeSec: number
  durationMs: number
  /** Ganho linear no centro do dropout. */
  gain: number
}

export interface NotchRule {
  targetHz: number
  /** Distância (Hz) até o alvo com efeito máximo. */
  fullEffectHz: number
  strongEffectHz: number
  partialEffectHz: number
  tailHz: number
  idealWidthHz: number
  wideWidthHz: number
  /** |reduction| em dB que conta como profundidade total. */
  fullReductionDb: number
  /** Atenuação do stem tonal quando o efeito é 1. */
  maxAttenuationDb: number
}

export interface SpectralRule {
  maxNoiseCutDb: number
  /** Piso linear do ruído — textura que permanece mesmo no máximo. */
  noiseFloor: number
  maxDebrisCutDb: number
  debrisFloor: number
  /** Corte de voz em dB com redução total e perfil completamente contaminado. */
  maxVoiceCutDb: number
}

export interface StemConfig {
  id: StemId
  kind: 'file' | 'clips' | 'tone' | 'noise' | 'clicks' | 'debris'
  /** Ganho inicial (linear 0–1 ou >1). */
  initialGain: number
  /** Arquivo contínuo (ex.: base corrompida de 44 s). */
  src?: string
  clips?: AudioClipConfig[]
  /** Tom contínuo */
  frequencyHz?: number
  /** Ruído / clicks gerados proceduralmente */
  density?: number
  seed?: number
  /** RMS alvo do buffer procedural, em dBFS, antes do ganho do stem. */
  targetRmsDb?: number
  /** Level-match de cada clip para este RMS antes de `gainDb`. */
  matchRmsDb?: number
  envelope?: GainWindow[]
  fragments?: DebrisFragment[]
  events?: ClickEvent[]
  dropouts?: DropoutEvent[]
}

/** Pesos de recuperação por segmento — a engine permanece genérica. */
export interface SpeechRecoveryWeights {
  center: number
  depth: number
  width: number
  noise: number
}

/** Segmento de fala analisável — unlock automático por clareza, sem input do jogador. */
export interface SpeechSegment {
  id: string
  text: string
  startSec: number
  durationSec: number
  /** Id do clip limpo correspondente (ganho perceptivo por segmento). */
  clipId?: string
  /** Threshold 0..1 do score ponderado para registrar o trecho. */
  clarityThreshold: number
  recoveryWeights: SpeechRecoveryWeights
  /**
   * Nível relativo interno da voz limpa neste trecho (linear).
   * Não aparece na UI; só afeta o áudio/percepção.
   */
  voiceWeight: number
  /** Multiplicador do tom residual neste trecho (1 = base). */
  toneWeight?: number
  /** Multiplicador do ruído de fundo neste trecho. */
  noiseWeight?: number
  /** Multiplicador de debris neste trecho. */
  debrisWeight?: number
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
  seed?: number
  /** Curva do Notch sobre o stem tonal. Ausente = o filtro real segue sozinho. */
  notch?: NotchRule
  /** Curva da redução espectral sobre ruído, debris e voz. */
  spectral?: SpectralRule
  /** Alvos de calibração (só dataset / debug — não exibidos ao jogador). */
  recovery?: {
    idealNotchCenterHz: number
    idealNotchWidthHz: number
    idealNotchReductionDb: number
    idealProfileStartSec: number
    idealProfileEndSec: number
    idealSpectralReduction: number
    idealSpectralSensitivity: number
    idealSpectralSmoothing: number
    unlockHoldSec: number
  }
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
  /** Segmentos de fala recuperáveis automaticamente (Recovered Speech). */
  speechSegments?: SpeechSegment[]
}

export interface ForensicSession {
  id: string
  title: string
  sources: ForensicSource[]
  /** Evidência do jogo que abre esta sessão. */
  evidenceId?: string
  /** Flag/handler de conclusão narrativa (opcional). */
  completion?: {
    kind: 'speech-recovery'
    /** Chama handler externo quando completo. */
    onCompleteAction?: 'runProvisionalEmergencyAnalysis'
  }
}

export interface RecoveredSpeechEntry {
  segmentId: string
  text: string
  startSec: number
  unlockedAt: number
}

export interface NoiseProfileState {
  id: string
  name: string
  startSec: number
  endSec: number
  /** Interno — não exibido ao jogador. */
  quality: 'good' | 'contaminated'
  /** 1 = seleção quase sem voz. Não exibido ao jogador. */
  qualityScore?: number
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
  /** Segmentos já recuperados nesta sessão (espelha o save). */
  recoveredSpeech: RecoveredSpeechEntry[]
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
  { id: 'process', label: 'Process' },
  { id: 'analysis', label: 'Analysis' },
  { id: 'file', label: 'File' },
  { id: 'structure', label: 'Structure' },
  { id: 'packets', label: 'Packets' },
  { id: 'timing', label: 'Timing' },
  { id: 'compare', label: 'Compare' },
  { id: 'notes', label: 'Notes' },
]
