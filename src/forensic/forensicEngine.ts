import type {
  ForensicSession,
  ForensicSource,
  ForensicUiState,
  NoiseProfileState,
  NoiseRegion,
  NotchRule,
  ProcessParams,
  RecoveredSpeechEntry,
  SelectionRange,
  SpectralRule,
  SpeechSegment,
  StemId,
  TrackRuntime,
} from './forensicTypes'
import { DEFAULT_PROCESS } from './forensicTypes'

export function createInitialUiState(
  session: ForensicSession,
  recoveredSpeech: RecoveredSpeechEntry[] = [],
): ForensicUiState {
  const first = session.sources[0]
  const tracks: Record<string, TrackRuntime> = {}
  for (const t of first?.tracks ?? []) {
    tracks[t.id] = {
      id: t.id,
      mute: false,
      solo: false,
      gainDb: t.gainDb ?? 0,
      pan: t.pan ?? 0,
      visible: t.visible,
    }
  }
  return {
    activeSourceId: first?.id ?? null,
    inspectorTab: 'process',
    playheadSec: 0,
    zoom: 1,
    scrollSec: 0,
    selection: null,
    loop: false,
    playbackRate: 1,
    playing: false,
    markers: [],
    tracks,
    process: { ...DEFAULT_PROCESS, eqBands: { ...DEFAULT_PROCESS.eqBands } },
    noiseProfiles: [],
    activeNoiseProfileId: null,
    recoveredSpeech: [...recoveredSpeech],
    compareSourceA: null,
    compareSourceB: null,
    waveformZoomY: 1,
  }
}

export function getActiveSource(
  session: ForensicSession,
  ui: ForensicUiState,
): ForensicSource | undefined {
  return session.sources.find((s) => s.id === ui.activeSourceId) ?? session.sources[0]
}

/** Intervalos de voz a partir dos segmentos ou clips do dataset. */
export function voiceSpansFromSource(
  source: ForensicSource | undefined,
): { startSec: number; endSec: number }[] {
  if (!source) return []
  if (source.speechSegments?.length) {
    return source.speechSegments.map((s) => ({
      startSec: s.startSec,
      endSec: s.startSec + s.durationSec,
    }))
  }
  if (!source.audio) return []
  const spans: { startSec: number; endSec: number }[] = []
  for (const stem of source.audio.stems) {
    if (stem.kind !== 'clips') continue
    for (const clip of stem.clips ?? []) {
      const dur = clip.durationSec ?? 0
      if (dur <= 0) continue
      spans.push({ startSec: clip.startSec, endSec: clip.startSec + dur })
    }
  }
  return spans
}

function smoothstep(t: number): number {
  const x = Math.min(1, Math.max(0, t))
  return x * x * (3 - 2 * x)
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v))
}

function bandStrength(dist: number, rule: NotchRule): number {
  const { fullEffectHz, strongEffectHz, partialEffectHz, tailHz } = rule
  if (dist <= fullEffectHz) return 1
  if (dist <= strongEffectHz) {
    const t = smoothstep((dist - fullEffectHz) / Math.max(1, strongEffectHz - fullEffectHz))
    return lerp(1, 0.82, t)
  }
  if (dist <= partialEffectHz) {
    const t = smoothstep((dist - strongEffectHz) / Math.max(1, partialEffectHz - strongEffectHz))
    return lerp(0.82, 0.36, t)
  }
  if (dist <= tailHz) {
    const t = smoothstep((dist - partialEffectHz) / Math.max(1, tailHz - partialEffectHz))
    return lerp(0.36, 0.04, t)
  }
  return 0.04 * Math.exp(-(dist - tailHz) / 70)
}

/**
 * Qualidade da largura do Notch (métrica independente).
 * Ideal ~120–260 Hz; aceitável ~70–400 Hz; extremos caem forte.
 */
export function notchWidthQuality(widthHz: number, rule?: NotchRule): number {
  const ideal = rule?.idealWidthHz ?? 180
  const wideFail = rule?.wideWidthHz ?? 900
  if (widthHz >= 120 && widthHz <= 260) return 1
  if (widthHz >= 70 && widthHz < 120) return lerp(0.55, 1, (widthHz - 70) / 50)
  if (widthHz > 260 && widthHz <= 400) return lerp(1, 0.55, (widthHz - 260) / 140)
  if (widthHz < 70) return lerp(0.05, 0.55, Math.max(0, widthHz) / 70)
  if (widthHz > 400 && widthHz < wideFail) {
    return lerp(0.55, 0.12, (widthHz - 400) / Math.max(1, wideFail - 400))
  }
  // Larguras próximas do ideal legado ainda pontuam bem.
  const dist = Math.abs(widthHz - ideal)
  if (dist < 40) return 1
  return 0.08
}

/** Precisão do Center vs alvo (~1700 Hz). Independente de depth/width. */
export function centerAccuracy(centerHz: number, targetHz = 1700): number {
  return bandStrength(Math.abs(centerHz - targetHz), {
    targetHz,
    fullEffectHz: 50,
    strongEffectHz: 100,
    partialEffectHz: 200,
    tailHz: 280,
    idealWidthHz: 180,
    wideWidthHz: 900,
    fullReductionDb: 24,
    maxAttenuationDb: 38,
  })
}

/** Profundidade do Notch pela Reduction (0 em 0 dB → 1 em fullReductionDb). */
export function notchDepthEffect(reductionDb: number, fullReductionDb = 24): number {
  if (reductionDb > -0.25) return 0
  return clamp01(Math.abs(reductionDb) / Math.max(1, fullReductionDb))
}

/**
 * Efeito composto no stem tonal (áudio).
 * Center sozinho já atenua parcialmente; depth e width completam.
 */
export function notchToneEffect(
  centerHz: number,
  reductionDb: number,
  widthHz: number,
  rule: NotchRule,
): number {
  const center = centerAccuracy(centerHz, rule.targetHz)
  const depth = notchDepthEffect(reductionDb, rule.fullReductionDb)
  const width = notchWidthQuality(widthHz, rule)
  // Center isolado → ~25% da atenuação máxima do tom (feedback perceptível).
  return clamp01(center * (0.25 + 0.75 * depth) * (0.55 + 0.45 * width))
}

export function toneStemGain(baseGain: number, process: ProcessParams, rule?: NotchRule): number {
  if (process.bypass || !rule) return baseGain
  const effect = notchToneEffect(
    process.notchCenterHz,
    process.notchReductionDb,
    process.notchWidthHz,
    rule,
  )
  const atten = Math.pow(10, (-rule.maxAttenuationDb * effect) / 20)
  return baseGain * atten
}

export const GENERIC_SPECTRAL_RULE: SpectralRule = {
  maxNoiseCutDb: 34,
  noiseFloor: 0.18,
  maxDebrisCutDb: 18,
  debrisFloor: 0.3,
  maxVoiceCutDb: 8,
}

function profileQualityOf(profile: NoiseProfileState): number {
  if (typeof profile.qualityScore === 'number') {
    return clamp01(profile.qualityScore)
  }
  return profile.quality === 'good' ? 1 : 0.28
}

/**
 * Efeito de redução espectral 0–1.
 * Depende de Reduction / Sensitivity / Smoothing / profileQuality.
 * Perfil contaminado + 100% NÃO atinge o máximo.
 */
export function noiseReductionEffect(
  process: ProcessParams,
  profile: NoiseProfileState | null,
): number {
  if (process.bypass || process.spectralReduction <= 0 || !profile) return 0
  const q = profileQualityOf(profile)
  const r = clamp01(process.spectralReduction / 100)
  const sens = process.spectralSensitivity
  const smooth = process.spectralSmoothing
  const sensScore = 1 - Math.min(1, Math.abs(sens - 55) / 70)
  const smoothScore = 1 - Math.min(1, Math.abs(smooth - 30) / 80)
  // Redução acima de ~90% com perfil fraco perde eficiência.
  const overdrivePenalty = r > 0.9 ? lerp(1, 0.72, (r - 0.9) / 0.1) : 1
  return clamp01(
    r *
      (0.28 + 0.72 * q) *
      (0.55 + 0.45 * sensScore) *
      (0.6 + 0.4 * smoothScore) *
      overdrivePenalty,
  )
}

/**
 * Spectral Reduction atua em ruído e debris.
 * Perfil contaminado também tira um pouco de clareza da voz limpa.
 */
export function spectralStemGains(
  process: ProcessParams,
  profile: NoiseProfileState | null,
  rule: SpectralRule = GENERIC_SPECTRAL_RULE,
): { noiseGain: number; debrisGain: number; voiceClarity: number } {
  const effect = noiseReductionEffect(process, profile)
  if (effect <= 0) return { noiseGain: 1, debrisGain: 1, voiceClarity: 1 }
  const q = profile ? profileQualityOf(profile) : 0
  const noiseDb = -rule.maxNoiseCutDb * effect
  const debrisDb = -rule.maxDebrisCutDb * effect
  const voiceDb = -rule.maxVoiceCutDb * effect * (1 - q)
  return {
    noiseGain: Math.max(rule.noiseFloor, Math.pow(10, noiseDb / 20)),
    debrisGain: Math.max(rule.debrisFloor, Math.pow(10, debrisDb / 20)),
    voiceClarity: Math.pow(10, voiceDb / 20),
  }
}

export interface RecoveryMetrics {
  centerAccuracy: number
  notchDepthEffect: number
  notchWidthQuality: number
  notchEffectiveness: number
  noiseProfileQuality: number
  noiseReductionEffect: number
  /** Métrica auxiliar (média) — não é o mecanismo principal de unlock. */
  recoveryAmount: number
}

/**
 * Métricas de ferramenta separadas.
 * Gain/Normalize NÃO entram aqui.
 */
export function computeRecoveryMetrics(
  process: ProcessParams,
  profile: NoiseProfileState | null,
  notchRule?: NotchRule,
): RecoveryMetrics {
  const q = profile ? profileQualityOf(profile) : 0
  if (process.bypass) {
    return {
      centerAccuracy: 0,
      notchDepthEffect: 0,
      notchWidthQuality: 0,
      notchEffectiveness: 0,
      noiseProfileQuality: q,
      noiseReductionEffect: 0,
      recoveryAmount: 0,
    }
  }
  const target = notchRule?.targetHz ?? 1700
  const fullDepth = notchRule?.fullReductionDb ?? 24
  const center = centerAccuracy(process.notchCenterHz, target)
  const depth = notchDepthEffect(process.notchReductionDb, fullDepth)
  const width = notchWidthQuality(process.notchWidthHz, notchRule)
  const notch = notchRule
    ? notchToneEffect(
        process.notchCenterHz,
        process.notchReductionDb,
        process.notchWidthHz,
        notchRule,
      )
    : clamp01(center * (0.25 + 0.75 * depth) * (0.55 + 0.45 * width))
  const nre = noiseReductionEffect(process, profile)
  const recoveryAmount = clamp01(0.22 * center + 0.22 * depth + 0.18 * width + 0.38 * nre)
  return {
    centerAccuracy: center,
    notchDepthEffect: depth,
    notchWidthQuality: width,
    notchEffectiveness: notch,
    noiseProfileQuality: q,
    noiseReductionEffect: nre,
    recoveryAmount,
  }
}

export function overlapRatio(sel: SelectionRange, region: NoiseRegion): number {
  const a0 = Math.min(sel.startSec, sel.endSec)
  const a1 = Math.max(sel.startSec, sel.endSec)
  const overlap = Math.max(0, Math.min(a1, region.endSec) - Math.max(a0, region.startSec))
  const selDur = Math.max(0.001, a1 - a0)
  return overlap / selDur
}

/**
 * Qualidade do perfil: ideal ≈ 0.30–1.80 s sem voz.
 * Seleção com fala → score baixo.
 */
export function profileQualityScore(
  sel: SelectionRange,
  spans: { startSec: number; endSec: number }[],
  ideal?: { startSec: number; endSec: number },
): number {
  const a0 = Math.min(sel.startSec, sel.endSec)
  const a1 = Math.max(sel.startSec, sel.endSec)
  const dur = Math.max(0.001, a1 - a0)
  let voice = 0
  for (const s of spans) {
    voice += Math.max(0, Math.min(a1, s.endSec) - Math.max(a0, s.startSec))
  }
  const frac = Math.min(1, voice / dur)
  let q = Math.exp(-4.6 * frac)
  if (frac <= 0.02) q = Math.max(q, 0.92)
  if (frac >= 0.3) q = Math.min(q, 0.2)

  if (ideal) {
    const idealOverlap =
      Math.max(0, Math.min(a1, ideal.endSec) - Math.max(a0, ideal.startSec)) /
      Math.max(0.001, ideal.endSec - ideal.startSec)
    const coverage = Math.min(1, dur / Math.max(0.001, ideal.endSec - ideal.startSec))
    const idealBonus = idealOverlap * Math.min(1, coverage) * (frac <= 0.05 ? 1 : 0.4)
    q = Math.max(q, idealBonus)
  }
  return clamp01(q)
}

export function classifyNoiseProfile(
  sel: SelectionRange,
  regions: NoiseRegion[] | undefined,
  spans?: { startSec: number; endSec: number }[],
  ideal?: { startSec: number; endSec: number },
): 'good' | 'contaminated' {
  if (spans?.length) {
    return profileQualityScore(sel, spans, ideal) >= 0.72 ? 'good' : 'contaminated'
  }
  if (!regions?.length) return 'contaminated'
  for (const r of regions) {
    if (overlapRatio(sel, r) >= r.minOverlapRatio) return 'good'
  }
  return 'contaminated'
}

export function captureNoiseProfile(
  sel: SelectionRange | null,
  regions: NoiseRegion[] | undefined,
  existing: NoiseProfileState[],
  spans?: { startSec: number; endSec: number }[],
  ideal?: { startSec: number; endSec: number },
): { ok: false; reason: 'no-selection' } | { ok: true; profile: NoiseProfileState } {
  if (!sel || Math.abs(sel.endSec - sel.startSec) < 0.05) {
    return { ok: false, reason: 'no-selection' }
  }
  const qualityScore = spans?.length
    ? profileQualityScore(sel, spans, ideal)
    : classifyNoiseProfile(sel, regions) === 'good'
      ? 0.98
      : 0.22
  const quality: NoiseProfileState['quality'] = qualityScore >= 0.72 ? 'good' : 'contaminated'
  const profile: NoiseProfileState = {
    id: `np-${existing.length + 1}-${Date.now()}`,
    name: `Profile ${existing.length + 1}`,
    startSec: Math.min(sel.startSec, sel.endSec),
    endSec: Math.max(sel.startSec, sel.endSec),
    quality,
    qualityScore,
    capturedAt: Date.now(),
  }
  return { ok: true, profile }
}

export interface StemProcessRules {
  notch?: NotchRule
  spectral?: SpectralRule
}

/**
 * Ganhos efetivos por stem.
 * Master Gain escala tudo — não melhora SNR.
 * A presença limpa por frase é aplicada nos clip gains (ver clipRecoveryGain).
 */
export function computeStemGains(
  base: Record<StemId, number>,
  process: ProcessParams,
  profile: NoiseProfileState | null,
  rules?: StemProcessRules,
): Record<StemId, number> {
  const metrics = computeRecoveryMetrics(process, profile, rules?.notch)
  const { noiseGain, debrisGain, voiceClarity } = spectralStemGains(
    process,
    profile,
    rules?.spectral,
  )
  const master = process.bypass ? 1 : Math.pow(10, process.gainDb / 20)
  // Crossfade global suave — a inteligibilidade real vem dos clip multipliers.
  const notchProg = clamp01(
    metrics.centerAccuracy * 0.45 + metrics.notchDepthEffect * 0.35 + metrics.notchWidthQuality * 0.2,
  )
  const recovery = clamp01(0.55 * notchProg + 0.45 * metrics.noiseReductionEffect)
  const corrupted = lerp(1, 0.28, recovery)
  const cleanBus = lerp(0.35, 1, recovery) * voiceClarity
  const tone =
    (base.TONE_1700 ?? 1) *
    (process.bypass || !rules?.notch
      ? 1
      : Math.pow(10, (-(rules.notch.maxAttenuationDb) * metrics.notchEffectiveness) / 20))

  return {
    CORRUPTED_BASE: (base.CORRUPTED_BASE ?? 1) * corrupted * master,
    VOICE: (base.VOICE ?? 1) * cleanBus * master,
    BACKGROUND_NOISE: (base.BACKGROUND_NOISE ?? 1) * noiseGain * master,
    TONE_1700: tone * master,
    VOCAL_DEBRIS: (base.VOCAL_DEBRIS ?? 1) * debrisGain * master,
    CLICKS: (base.CLICKS ?? 1) * master,
  }
}

export interface SegmentClarity {
  segmentId: string
  /** Contribuições 0..1 (peso × métrica). */
  centerContribution: number
  depthContribution: number
  widthContribution: number
  noiseContribution: number
  /** Score ponderado 0..1. */
  clarityScore: number
  threshold: number
  unlocked: boolean
  /** Alias legado para debug/UI antiga. */
  clarityDb: number
  thresholdDb: number
}

/**
 * Score de recuperação por segmento — pesos vêm do dataset.
 * Contínuo (não binário). Gain master não conta.
 */
export function evaluateSegmentClarity(
  segment: SpeechSegment,
  process: ProcessParams,
  profile: NoiseProfileState | null,
  _base: Record<StemId, number>,
  rules?: StemProcessRules,
  alreadyUnlocked = false,
): SegmentClarity {
  const metrics = computeRecoveryMetrics(process, profile, rules?.notch)
  const w = segment.recoveryWeights
  const centerContribution = w.center * metrics.centerAccuracy
  const depthContribution = w.depth * metrics.notchDepthEffect
  const widthContribution = w.width * metrics.notchWidthQuality
  const noiseContribution = w.noise * metrics.noiseReductionEffect
  let clarityScore = clamp01(
    centerContribution + depthContribution + widthContribution + noiseContribution,
  )
  // Soft gates: se o segmento depende fortemente de uma ferramenta, ela precisa estar razoável.
  if (w.center >= 0.25 && metrics.centerAccuracy < 0.28) {
    clarityScore *= lerp(0.35, 1, metrics.centerAccuracy / 0.28)
  }
  if (w.depth >= 0.35 && metrics.notchDepthEffect < 0.2) {
    clarityScore *= lerp(0.45, 1, metrics.notchDepthEffect / 0.2)
  }
  if (w.width >= 0.25 && metrics.notchWidthQuality < 0.35) {
    clarityScore *= lerp(0.4, 1, metrics.notchWidthQuality / 0.35)
  }
  if (w.noise >= 0.5 && metrics.noiseReductionEffect < 0.25) {
    clarityScore *= lerp(0.3, 1, metrics.noiseReductionEffect / 0.25)
  }
  clarityScore = clamp01(clarityScore)
  const threshold = segment.clarityThreshold
  return {
    segmentId: segment.id,
    centerContribution,
    depthContribution,
    widthContribution,
    noiseContribution,
    clarityScore,
    threshold,
    unlocked: alreadyUnlocked || clarityScore >= threshold,
    clarityDb: clarityScore * 10,
    thresholdDb: threshold * 10,
  }
}

/** Multiplicador linear do clip limpo a partir do score do segmento. */
export function clipRecoveryGain(score: number, voiceWeight = 1): number {
  return lerp(0.03, 1.15, clamp01(score)) * voiceWeight
}

export function speechRecoveryComplete(
  recovered: RecoveredSpeechEntry[],
  segments: SpeechSegment[] | undefined,
): boolean {
  if (!segments?.length) return false
  const ids = new Set(recovered.map((r) => r.segmentId))
  return segments.every((s) => ids.has(s.id))
}

export function resetProcess(ui: ForensicUiState): ForensicUiState {
  return {
    ...ui,
    process: { ...DEFAULT_PROCESS, eqBands: { ...DEFAULT_PROCESS.eqBands } },
    noiseProfiles: [],
    activeNoiseProfileId: null,
    selection: null,
    playheadSec: 0,
    playing: false,
    markers: [],
    recoveredSpeech: ui.recoveredSpeech,
    waveformZoomY: 1,
  }
}

export function dbToLinear(db: number): number {
  return Math.pow(10, db / 20)
}

export function fmtTime(sec: number): string {
  const s = Math.max(0, sec)
  const m = Math.floor(s / 60)
  const r = s - m * 60
  return `${m}:${r.toFixed(2).padStart(5, '0')}`
}

export function alwaysAvailableTabs(): ForensicUiState['inspectorTab'][] {
  return ['process', 'analysis', 'file', 'structure', 'packets', 'timing', 'compare', 'notes']
}
