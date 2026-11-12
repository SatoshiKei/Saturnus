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
  | 'spectrum'
  | 'compare'
  | 'notes'

/** Captura RF simulada (waterfall / extract channel) — genérica. */
export interface RfChannelDef {
  id: string
  centerMhz: number
  known: boolean
  label?: string
  nominalPower?: number
}

export interface RfBurstDef {
  id: string
  channelId: string
  centerMhz: number
  startSec: number
  durationSec: number
  power: number
  audioSrc?: string
}

export interface RfWaterfallData {
  cols: number
  rows: number
  freqMinMhz: number
  freqMaxMhz: number
  durationSec: number
  /** row-major: row = time index, col = frequency index · 0..1 */
  values: number[]
}

export interface RfCaptureConfig {
  durationSec: number
  freqMinMhz: number
  freqMaxMhz: number
  knownChannelIds: string[]
  hiddenChannelId: string
  channels: RfChannelDef[]
  bursts: RfBurstDef[]
  waterfall: RfWaterfallData
  extract: {
    hiddenCenterMhz: number
    toleranceMhz: number
    idealBandwidthMhz: number
    minBandwidthMhz: number
    maxBandwidthMhz: number
    derivedSourceId: string
    derivedAudioSrc: string
    derivedDisplayName: string
  }
  findings?: {
    token: string
    timeLabel: string
    locationLabel: string
  }
}

export type StemId =
  | 'FILE'
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
  /** Só pode desbloquear após rebuild válido do container. */
  requiresContainerRebuild?: boolean
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

/** Página/bloco estrutural genérico (Ogg, etc.). */
export interface StructurePage {
  id: string
  index: number
  offset: string
  flags: string
  granule: string
  serial: string
  sequence: number
  /** Esperado — só dataset / DEV. */
  expectedSequence?: number
  segments: number
  storedCrc: string
  crcStatus: 'valid' | 'mismatch' | 'pending'
  editableFields?: Array<'sequence'>
}

export interface StructureRebuildRule {
  kind: 'sequence-repair'
  corruptPageId: string
  expectedSequence: number
}

export interface StructureData {
  kind: string
  emptyMessage?: string
  blocks?: StructureBlock[]
  pages?: StructurePage[]
  canRebuild?: boolean
  rebuildRule?: StructureRebuildRule
}

/** Controle de decode truncado por container danificado. */
export interface ContainerPlaybackConfig {
  /** Duração anunciada pelo container (metadados). */
  containerDurationSec: number
  /** Até onde o decoder chega com a estrutura danificada. */
  damagedPlayableUntilSec: number
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
  /** Rótulo absoluto do início do arquivo (ex.: 01:22:18 REAL). */
  absoluteStartLabel?: string
  /** Relógio da fonte no evento de sincronização (DJ). */
  eventClockAtDj?: string
  /** Stamp externo confiável (mensageria). */
  externalStamp?: string
}

/** Região de tempo preparada no dataset — ferramenta genérica de Tempo. */
export interface TempoRegion {
  id: string
  startSec: number
  endSec: number
  bpm: number
  confidence: 'low' | 'medium' | 'high'
}

/** Registro administrativo/técnico comparável (sem áudio). */
export interface SetRecordFields {
  setId: string
  operatorLabel: string
  bpmBefore: number
  bpmAfter: number
  interventionStartSec: number
  interventionEndSec: number
  notes: string
  /** Interno — nunca exibir como “correto”. */
  isCorrectMatch?: boolean
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
  /**
   * Posição inicial desta fonte na timeline compartilhada (segundos).
   * Usado com `sourceOffsets` para alinhamento multitrack.
   */
  timelineOriginSec?: number
  /** Regiões predominantemente de ruído (validação interna de Noise Profile). */
  noiseRegions?: NoiseRegion[]
  /** Segmentos de fala recuperáveis automaticamente (Recovered Speech). */
  speechSegments?: SpeechSegment[]
  /** Truncamento por container (Puzzle Structure). */
  containerPlayback?: ContainerPlaybackConfig
  /** Regiões de tempo para Estimate tempo (Analysis). */
  tempoRegions?: TempoRegion[]
  /** Campos de registro de set (COMPARE / LINK SOURCE). */
  setRecord?: SetRecordFields
  /** Captura RF / waterfall (Puzzle 07+). */
  rfCapture?: RfCaptureConfig
}

export interface ForensicSession {
  id: string
  title: string
  sources: ForensicSource[]
  /** Evidência do jogo que abre esta sessão. */
  evidenceId?: string
  /** Flag/handler de conclusão narrativa (opcional). */
  completion?: {
    kind:
      | 'speech-recovery'
      | 'container-rebuild'
      | 'source-link'
      | 'clock-sync'
      | 'clip-sequence'
      | 'spectrogram-survey'
      | 'rf-channel-extract'
    /** Chama handler externo quando completo. */
    onCompleteAction?:
      | 'runProvisionalEmergencyAnalysis'
      | 'runProvisionalRafaelForwardAnalysis'
      | 'runProvisionalRingsAnalysis'
      | 'runJanusEpimetheusAnalysis'
      | 'runSaturnaliaReconstruct'
      | 'runHexagonSpectrogramSurvey'
      | 'runShepherdMoonsExtract'
    /** Segmentos obrigatórios além do rebuild (se houver). */
    requireSpeechSegmentIds?: string[]
    /** source id do registro correto (source-link). */
    correctSetSourceId?: string
    /** Offset de relógio esperado (clock-sync), em segundos. */
    expectedOffsetSec?: number
    /** Tolerância de alinhamento (clock-sync), em segundos. */
    offsetToleranceSec?: number
    /** Horário Vertice no set log (clock-sync). */
    setLogVerticeTime?: string
    /** Horário real após correção (clock-sync). */
    correctedRealTime?: string
    /** Finding obrigatório (clock-sync). */
    findingText?: string
    /** Ordem correta de source ids (clip-sequence). */
    expectedSourceOrder?: string[]
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
  /** 0 = sem fala na amostra; 1 = amostra dominada por voz / cobre quase toda a fala. */
  voiceContamination?: number
  /** Duração da seleção usada no perfil. */
  durationSec?: number
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
  /** Sequence overrides por page id (Structure). */
  structureSequences: Record<string, number>
  selectedStructurePageId: string | null
  containerRebuilt: boolean
  rebuildStatus: string | null
  rebuildCount: number
  /** Resultado da última estimativa de tempo (Analysis). */
  tempoEstimate: { bpm: number; confidence: string; windowSec: number } | null
  /** Feedback do último LINK SOURCE. */
  linkStatus: string | null
  linkedSetSourceId: string | null
  /** Offset horizontal por source id (segundos) na timeline compartilhada. */
  sourceOffsets: Record<string, number>
  /** Fonte usada como referência de relógio. */
  timingReferenceSourceId: string | null
  /** Diferença de relógio formalizada após sync válido (segundos). */
  formalizedClockOffsetSec: number | null
  /** Horário do set log após Apply clock correction. */
  correctedSetTime: string | null
  /** Finding técnico desbloqueado. */
  findingUnlocked: boolean
  /** Ordem de montagem de clips (source ids). */
  clipSequence: string[]
  /** Último Assemble/Build Sequence bem-sucedido. */
  sequenceAssembled: boolean
  /** Mensagem genérica do último assemble (sem spoiler por slot). */
  assembleStatus: string | null
  /** Sources cujo Spectrogram já foi aberto nesta sessão (Puzzle 06). */
  spectrogramViewedSourceIds: string[]
  /** Seleção RF (Spectrum / Waterfall). */
  rfCenterMhz: number | null
  rfBandwidthMhz: number | null
  rfExtractionQuality: number | null
  rfHiddenOverlap: number | null
  rfExtracted: boolean
  rfDerivedSourceId: string | null
  rfStatus: string | null
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
  { id: 'spectrum', label: 'Spectrum' },
  { id: 'compare', label: 'Compare' },
  { id: 'notes', label: 'Notes' },
]
