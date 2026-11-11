import type {
  ForensicSession,
  ForensicSource,
  ForensicUiState,
  NoiseProfileState,
  NoiseRegion,
  ProcessParams,
  SelectionRange,
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

/** Efeito do Notch sobre o stem TONE_1700 (0 = sem efeito, 1 = máximo). */
export function notchToneEffect(centerHz: number, reductionDb: number): number {
  if (reductionDb >= -0.5) return 0
  const dist = Math.abs(centerHz - 1700)
  let strength = 0
  if (dist <= 100) strength = 1
  else if (dist <= 200) strength = 1 - (dist - 100) / 100
  else strength = 0
  const depth = Math.min(1, Math.abs(reductionDb) / 18)
  return strength * depth
}

/** Ganho linear do stem TONE a partir do efeito de notch. */
export function toneStemGain(baseGain: number, process: ProcessParams): number {
  if (process.bypass) return baseGain
  const effect = notchToneEffect(process.notchCenterHz, process.notchReductionDb)
  // Reduz até ~-40 dB no stem quando efeito máximo.
  const atten = Math.pow(10, (-40 * effect) / 20)
  return baseGain * atten
}

/**
 * Mapeia Spectral Reduction % → atenuação dB do BACKGROUND_NOISE.
 * Profile contaminado reduz menos ruído e também atenua VOICE levemente.
 */
export function spectralStemGains(
  process: ProcessParams,
  profile: NoiseProfileState | null,
): { noiseGain: number; voiceClarity: number } {
  if (process.bypass || process.spectralReduction <= 0 || !profile) {
    return { noiseGain: 1, voiceClarity: 1 }
  }
  const t = process.spectralReduction / 100
  const noiseDbGood = -4 * t - 8 * t * t // ~0 → -12 at 100%
  const noiseDbContam = noiseDbGood * 0.45
  const noiseDb = profile.quality === 'good' ? noiseDbGood : noiseDbContam
  const voiceClarity =
    profile.quality === 'contaminated' ? Math.pow(10, (-3 * t) / 20) : 1
  return {
    noiseGain: Math.pow(10, noiseDb / 20),
    voiceClarity,
  }
}

export function overlapRatio(sel: SelectionRange, region: NoiseRegion): number {
  const a0 = sel.startSec
  const a1 = sel.endSec
  const b0 = region.startSec
  const b1 = region.endSec
  const overlap = Math.max(0, Math.min(a1, b1) - Math.max(a0, b0))
  const selDur = Math.max(0.001, a1 - a0)
  return overlap / selDur
}

/** Classifica perfil internamente; não revela ao jogador. */
export function classifyNoiseProfile(
  sel: SelectionRange,
  regions: NoiseRegion[] | undefined,
): 'good' | 'contaminated' {
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
): { ok: false; reason: 'no-selection' } | { ok: true; profile: NoiseProfileState } {
  if (!sel || sel.endSec - sel.startSec < 0.05) {
    return { ok: false, reason: 'no-selection' }
  }
  const quality = classifyNoiseProfile(sel, regions)
  const profile: NoiseProfileState = {
    id: `np-${existing.length + 1}-${Date.now()}`,
    name: `Profile ${existing.length + 1}`,
    startSec: sel.startSec,
    endSec: sel.endSec,
    quality,
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
    return entries.some((e) =>
      accepted.some((a) => e === a || e.includes(a) || a.includes(e)),
    )
  })
}

/** Ganhos efetivos por stem (simulação determinística + process real parcial). */
export function computeStemGains(
  base: Record<StemId, number>,
  process: ProcessParams,
  profile: NoiseProfileState | null,
): Record<StemId, number> {
  const tone = toneStemGain(base.TONE_1700 ?? 1, process)
  const { noiseGain, voiceClarity } = spectralStemGains(process, profile)
  const master = process.bypass ? 1 : Math.pow(10, process.gainDb / 20)
  return {
    VOICE: (base.VOICE ?? 1) * voiceClarity * master,
    BACKGROUND_NOISE: (base.BACKGROUND_NOISE ?? 1) * noiseGain * master,
    TONE_1700: tone * master,
    VOCAL_DEBRIS: (base.VOCAL_DEBRIS ?? 1) * master,
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
