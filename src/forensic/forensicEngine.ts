import type {
  ForensicSession,
  ForensicSource,
  ForensicUiState,
  NoiseProfileState,
  NoiseRegion,
  NotchRule,
  ProcessParams,
  SelectionRange,
  SpectralRule,
  StemId,
  TrackRuntime,
} from './forensicTypes'
import { DEFAULT_PROCESS } from './forensicTypes'

/** Normaliza texto para comparação de transcrição. */
export function normalizeTranscript(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function createInitialUiState(session: ForensicSession): ForensicUiState {
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
    transcriptionNotes: '',
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

/** Intervalos de voz a partir dos clips do dataset — sem nomes de frase. */
export function voiceSpansFromSource(
  source: ForensicSource | undefined,
): { startSec: number; endSec: number }[] {
  if (!source?.audio) return []
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

function widthFactor(widthHz: number, rule: NotchRule): number {
  const narrow = rule.idealWidthHz * 0.4
  const idealHi = rule.idealWidthHz * 2.2
  if (widthHz <= 12) return 0.42
  if (widthHz < narrow) return lerp(0.42, 1, (widthHz - 12) / Math.max(1, narrow - 12))
  if (widthHz <= idealHi) return 1
  if (widthHz >= rule.wideWidthHz) {
    const over = Math.min(1, (widthHz - rule.wideWidthHz) / Math.max(1, rule.wideWidthHz))
    return lerp(0.22, 0.08, over)
  }
  const t = smoothstep((widthHz - idealHi) / Math.max(1, rule.wideWidthHz - idealHi))
  return lerp(1, 0.22, t)
}

/**
 * Efeito do Notch sobre o stem tonal (0 = nenhum, 1 = máximo).
 * Centro, largura e redução entram juntos. Não é um teste de igualdade.
 */
export function notchToneEffect(
  centerHz: number,
  reductionDb: number,
  widthHz: number,
  rule: NotchRule,
): number {
  if (reductionDb > -0.25) return 0
  const dist = Math.abs(centerHz - rule.targetHz)
  const depth = Math.min(1, Math.abs(reductionDb) / Math.max(1, rule.fullReductionDb))
  const effect = bandStrength(dist, rule) * widthFactor(widthHz, rule) * depth
  return Math.max(0, Math.min(1, effect))
}

/** Ganho linear do stem tonal a partir da curva de notch. */
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

/** Fallback genérico. O puzzle sobrescreve via dataset. */
export const GENERIC_SPECTRAL_RULE: SpectralRule = {
  maxNoiseCutDb: 34,
  noiseFloor: 0.15,
  maxDebrisCutDb: 16,
  debrisFloor: 0.28,
  maxVoiceCutDb: 6,
}

function profileQualityOf(profile: NoiseProfileState): number {
  if (typeof profile.qualityScore === 'number') {
    return Math.min(1, Math.max(0, profile.qualityScore))
  }
  return profile.quality === 'good' ? 1 : 0.28
}

/**
 * Spectral Reduction atua em ruído e debris.
 * Perfil contaminado também tira um pouco de clareza da voz.
 * O piso impede que 100% deixe só a voz.
 */
export function spectralStemGains(
  process: ProcessParams,
  profile: NoiseProfileState | null,
  rule: SpectralRule = GENERIC_SPECTRAL_RULE,
): { noiseGain: number; debrisGain: number; voiceClarity: number } {
  if (process.bypass || process.spectralReduction <= 0 || !profile) {
    return { noiseGain: 1, debrisGain: 1, voiceClarity: 1 }
  }
  const t = Math.min(1, Math.max(0, process.spectralReduction / 100))
  const sens = Math.min(1, Math.max(0, process.spectralSensitivity / 100))
  const smooth = Math.min(1, Math.max(0, process.spectralSmoothing / 100))
  const q = profileQualityOf(profile)
  const strength = t * (0.5 + 0.5 * sens) * (1 - 0.22 * smooth)
  const noiseDb = -rule.maxNoiseCutDb * strength * (0.35 + 0.65 * q)
  const debrisDb = -rule.maxDebrisCutDb * strength * (0.4 + 0.6 * q)
  const voiceDb = -rule.maxVoiceCutDb * t * (1 - q) * (0.4 + 0.6 * sens) * (1 - 0.3 * smooth)
  return {
    noiseGain: Math.max(rule.noiseFloor, Math.pow(10, noiseDb / 20)),
    debrisGain: Math.max(rule.debrisFloor, Math.pow(10, debrisDb / 20)),
    voiceClarity: Math.pow(10, voiceDb / 20),
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
 * 1 quando a seleção quase não contém voz; cai conforme a fala entra.
 * Não classifica "certo/errado" para o jogador.
 */
export function profileQualityScore(
  sel: SelectionRange,
  spans: { startSec: number; endSec: number }[],
): number {
  const a0 = Math.min(sel.startSec, sel.endSec)
  const a1 = Math.max(sel.startSec, sel.endSec)
  const dur = Math.max(0.001, a1 - a0)
  let voice = 0
  for (const s of spans) {
    voice += Math.max(0, Math.min(a1, s.endSec) - Math.max(a0, s.startSec))
  }
  const frac = Math.min(1, voice / dur)
  let q = Math.exp(-4.2 * frac)
  if (frac <= 0.02) q = Math.max(q, 0.98)
  if (frac >= 0.35) q = Math.min(q, 0.22)
  return Math.max(0, Math.min(1, q))
}

/** Classifica perfil internamente; não revela ao jogador. */
export function classifyNoiseProfile(
  sel: SelectionRange,
  regions: NoiseRegion[] | undefined,
  spans?: { startSec: number; endSec: number }[],
): 'good' | 'contaminated' {
  if (spans?.length) {
    return profileQualityScore(sel, spans) >= 0.72 ? 'good' : 'contaminated'
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
): { ok: false; reason: 'no-selection' } | { ok: true; profile: NoiseProfileState } {
  if (!sel || Math.abs(sel.endSec - sel.startSec) < 0.05) {
    return { ok: false, reason: 'no-selection' }
  }
  const qualityScore = spans?.length
    ? profileQualityScore(sel, spans)
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

/** Extrai linhas / trechos da área de NOTES. */
export function parseTranscriptionEntries(notes: string): string[] {
  return notes
    .split(/[\n|;]+/)
    .map((l) => normalizeTranscript(l))
    .filter(Boolean)
}

export function transcriptionComplete(
  notes: string,
  fragments: { id: string; accepted: string[] }[] | undefined,
): boolean {
  if (!fragments?.length) return false
  const entries = parseTranscriptionEntries(notes)
  if (!entries.length) return false
  return fragments.every((frag) => {
    const accepted = frag.accepted.map(normalizeTranscript)
    return entries.some((e) => accepted.some((a) => e === a || e.includes(a)))
  })
}

export interface StemProcessRules {
  notch?: NotchRule
  spectral?: SpectralRule
}

/** Ganhos efetivos por stem. O Gain do usuário escala todos. */
export function computeStemGains(
  base: Record<StemId, number>,
  process: ProcessParams,
  profile: NoiseProfileState | null,
  rules?: StemProcessRules,
): Record<StemId, number> {
  const tone = toneStemGain(base.TONE_1700 ?? 1, process, rules?.notch)
  const { noiseGain, debrisGain, voiceClarity } = spectralStemGains(
    process,
    profile,
    rules?.spectral,
  )
  const master = process.bypass ? 1 : Math.pow(10, process.gainDb / 20)
  return {
    VOICE: (base.VOICE ?? 1) * voiceClarity * master,
    BACKGROUND_NOISE: (base.BACKGROUND_NOISE ?? 1) * noiseGain * master,
    TONE_1700: tone * master,
    VOCAL_DEBRIS: (base.VOCAL_DEBRIS ?? 1) * debrisGain * master,
    CLICKS: (base.CLICKS ?? 1) * master,
  }
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
    transcriptionNotes: ui.transcriptionNotes,
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

/** Abas sempre disponíveis — independentes do tipo de fonte. */
export function alwaysAvailableTabs(): ForensicUiState['inspectorTab'][] {
  return ['process', 'analysis', 'file', 'structure', 'packets', 'timing', 'compare', 'notes']
}
