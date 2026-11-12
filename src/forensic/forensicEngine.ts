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
  StructurePage,
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
  const sourceOffsets: Record<string, number> = {}
  for (const s of session.sources) {
    sourceOffsets[s.id] = 0
  }
  const audioSources = session.sources.filter((s) => s.audio)
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
    compareSourceA: audioSources[0]?.id ?? null,
    compareSourceB: audioSources[1]?.id ?? null,
    waveformZoomY: 1,
    structureSequences: {},
    selectedStructurePageId: first?.structure?.pages?.[0]?.id ?? null,
    containerRebuilt: false,
    rebuildStatus: null,
    rebuildCount: 0,
    tempoEstimate: null,
    linkStatus: null,
    linkedSetSourceId: null,
    sourceOffsets,
    timingReferenceSourceId: audioSources[0]?.id ?? null,
    formalizedClockOffsetSec: null,
    correctedSetTime: null,
    findingUnlocked: false,
    clipSequence: session.sources.filter((s) => s.audio).map((s) => s.id),
    sequenceAssembled: false,
    assembleStatus: null,
  }
}

export function clipSequenceMatchesExpected(
  current: string[],
  expected: string[] | undefined,
): boolean {
  if (!expected?.length) return false
  if (current.length !== expected.length) return false
  return current.every((id, i) => id === expected[i])
}

export function assembleClipSequence(
  session: ForensicSession,
  currentOrder: string[],
): { ok: boolean; message: string } {
  const expected = session.completion?.expectedSourceOrder
  if (!expected?.length) {
    return { ok: false, message: 'No sequence definition for this session.' }
  }
  if (currentOrder.length !== expected.length) {
    return { ok: false, message: 'Sequence incomplete — include every clip once.' }
  }
  const set = new Set(currentOrder)
  if (set.size !== currentOrder.length) {
    return { ok: false, message: 'Sequence has duplicate clips.' }
  }
  if (!clipSequenceMatchesExpected(currentOrder, expected)) {
    return {
      ok: false,
      message: 'Sequence assembled. Continuity check failed — order still inconsistent.',
    }
  }
  return { ok: true, message: 'Sequence assembled. Continuity check passed.' }
}

export function clipSequenceComplete(session: ForensicSession, ui: ForensicUiState): boolean {
  if (session.completion?.kind !== 'clip-sequence') return false
  if (!ui.sequenceAssembled) return false
  return clipSequenceMatchesExpected(ui.clipSequence, session.completion.expectedSourceOrder)
}

/** Posição absoluta da fonte na timeline compartilhada. */
export function sourceTimelinePlacement(
  source: ForensicSource | undefined,
  offsets: Record<string, number>,
): number {
  if (!source) return 0
  return (source.timelineOriginSec ?? 0) + (offsets[source.id] ?? 0)
}

/** Diferença de placement entre duas fontes (B − A). */
export function relativeSourceOffsetSec(
  a: ForensicSource | undefined,
  b: ForensicSource | undefined,
  offsets: Record<string, number>,
): number {
  return sourceTimelinePlacement(b, offsets) - sourceTimelinePlacement(a, offsets)
}

/**
 * Correlação aproximada 0..1 a partir do desalinhamento de placement.
 * Pico quando as faixas se sobrepõem no conteúdo (placement relativo ≈ 0).
 */
export function approximateTrackCorrelation(
  placementDeltaSec: number,
  toleranceSec = 0.2,
): number {
  const d = Math.abs(placementDeltaSec)
  if (d <= toleranceSec) return 0.94 + Math.max(0, (toleranceSec - d) / Math.max(toleranceSec, 1e-6)) * 0.05
  if (d <= 1) return 0.62 + (1 - d) * 0.3
  if (d <= 5) return 0.31 * (1 - (d - 1) / 4)
  return Math.max(0.02, 0.12 * Math.exp(-(d - 5) / 40))
}

export function clockSyncOffsetValid(
  session: ForensicSession,
  ui: ForensicUiState,
): boolean {
  const completion = session.completion
  if (!completion || completion.kind !== 'clock-sync') return false
  const expected = completion.expectedOffsetSec ?? 450
  const tol = completion.offsetToleranceSec ?? 0.2
  const audio = session.sources.filter((s) => s.audio)
  if (audio.length < 2) return false
  const a = audio[0]
  const b = audio[1]
  // Placement alinhado ⇒ origemA + offA ≈ origemB + offB
  // Offset de relógio formal = (origemA − origemB) quando alinhados (canônico +450).
  const placementDelta = Math.abs(relativeSourceOffsetSec(a, b, ui.sourceOffsets))
  if (placementDelta > tol) return false
  const clockOffset = Math.abs((a.timelineOriginSec ?? 0) - (b.timelineOriginSec ?? 0))
  return Math.abs(clockOffset - expected) <= tol
}

export function clockSyncComplete(session: ForensicSession, ui: ForensicUiState): boolean {
  const completion = session.completion
  if (!completion || completion.kind !== 'clock-sync') return false
  if (!clockSyncOffsetValid(session, ui)) return false
  if (ui.formalizedClockOffsetSec == null) return false
  const expected = completion.expectedOffsetSec ?? 450
  if (Math.abs(ui.formalizedClockOffsetSec - expected) > (completion.offsetToleranceSec ?? 0.2))
    return false
  if (ui.correctedSetTime !== (completion.correctedRealTime ?? null)) return false
  if (!ui.findingUnlocked) return false
  return true
}

export function fmtClockOffset(sec: number): string {
  const sign = sec >= 0 ? '+' : '−'
  const abs = Math.abs(sec)
  const h = Math.floor(abs / 3600)
  const m = Math.floor((abs % 3600) / 60)
  const s = Math.floor(abs % 60)
  if (h > 0) {
    return `${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${sign}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** Estimate tempo from selection overlapping dataset tempoRegions. */
export function estimateTempoFromSelection(
  source: ForensicSource | undefined,
  selection: SelectionRange | null,
): { ok: false; reason: string } | { ok: true; bpm: number; confidence: string; windowSec: number } {
  if (!selection) return { ok: false, reason: 'Select a timeline region first.' }
  const a0 = Math.min(selection.startSec, selection.endSec)
  const a1 = Math.max(selection.startSec, selection.endSec)
  const windowSec = a1 - a0
  if (windowSec < 4) return { ok: false, reason: 'Selection too short for tempo estimate (min ~4 s).' }
  const regions = source?.tempoRegions ?? []
  if (!regions.length) return { ok: false, reason: 'No tempo analysis data for this source.' }
  let best: { bpm: number; confidence: string; overlap: number } | null = null
  for (const r of regions) {
    const overlap = Math.max(0, Math.min(a1, r.endSec) - Math.max(a0, r.startSec))
    if (overlap / windowSec < 0.45) continue
    if (!best || overlap > best.overlap) {
      best = { bpm: r.bpm, confidence: r.confidence, overlap }
    }
  }
  if (!best) return { ok: false, reason: 'Selection does not overlap a stable tempo region.' }
  return { ok: true, bpm: best.bpm, confidence: best.confidence, windowSec }
}

/** LINK SOURCE — gravação ↔ registro (ordem A/B indiferente). Não revela o campo errado. */
export function linkSources(
  session: ForensicSession,
  sourceAId: string | null,
  sourceBId: string | null,
): { ok: boolean; message: string; complete: boolean; linkedSetId: string | null } {
  if (!sourceAId || !sourceBId) {
    return { ok: false, message: 'Select two sources to link.', complete: false, linkedSetId: null }
  }
  const a = session.sources.find((s) => s.id === sourceAId)
  const b = session.sources.find((s) => s.id === sourceBId)
  const recording = a?.audio ? a : b?.audio ? b : undefined
  const setSrc = a?.setRecord ? a : b?.setRecord ? b : undefined
  if (!recording?.audio || !setSrc?.setRecord) {
    return {
      ok: false,
      message: 'Link requires the capture on one side and a set record on the other.',
      complete: false,
      linkedSetId: null,
    }
  }
  const correctId = session.completion?.correctSetSourceId
  if (correctId && setSrc.id === correctId && setSrc.setRecord.isCorrectMatch) {
    return {
      ok: true,
      message: 'Source characteristics correspond. Link registered.',
      complete: true,
      linkedSetId: setSrc.id,
    }
  }
  return {
    ok: false,
    message: 'Observed timing characteristics do not fully correspond.',
    complete: false,
    linkedSetId: null,
  }
}

/** CRC simulado a partir dos campos atuais da page. */
export function simulatePageCrc(page: Pick<StructurePage, 'index' | 'sequence' | 'flags'>): string {
  let h = (page.index + 1) * 0x45d9f3b
  h ^= page.sequence * 0x27d4eb2d
  const flags = page.flags === '—' ? '' : page.flags
  for (let i = 0; i < flags.length; i++) h = (h * 33 + flags.charCodeAt(i)) >>> 0
  return `0x${(h >>> 0).toString(16).padStart(8, '0')}`
}

/** Sequências efetivas (dataset + edits) — sem recalcular CRC. */
function effectiveSequences(
  source: ForensicSource | undefined,
  sequences: Record<string, number>,
): { id: string; sequence: number; expectedSequence?: number; originalSequence: number }[] {
  return (source?.structure?.pages ?? []).map((p) => ({
    id: p.id,
    sequence: sequences[p.id] ?? p.sequence,
    expectedSequence: p.expectedSequence,
    originalSequence: p.sequence,
  }))
}

export function structureSequenceValid(
  source: ForensicSource | undefined,
  sequences: Record<string, number>,
): boolean {
  const rule = source?.structure?.rebuildRule
  if (!rule || rule.kind !== 'sequence-repair') return true
  return effectiveSequences(source, sequences).every((p) => {
    if (p.expectedSequence == null) return true
    return p.sequence === p.expectedSequence
  })
}

/**
 * Pages efetivas com edits de sequence da UI.
 * CRC só é recalculado / marcado valid após rebuild bem-sucedido.
 * Editar sequence sozinho não “conserta” o CRC.
 */
export function resolveStructurePages(
  source: ForensicSource | undefined,
  sequences: Record<string, number>,
  containerRebuilt = false,
): StructurePage[] {
  const pages = source?.structure?.pages ?? []
  const allValid = structureSequenceValid(source, sequences)
  return pages.map((p) => {
    const sequence = sequences[p.id] ?? p.sequence
    if (containerRebuilt && allValid) {
      return {
        ...p,
        sequence,
        storedCrc: simulatePageCrc({ index: p.index, sequence, flags: p.flags }),
        crcStatus: 'valid' as const,
      }
    }
    const edited = sequences[p.id] != null && sequences[p.id] !== p.sequence
    const sequenceValid = p.expectedSequence == null || sequence === p.expectedSequence
    // Dataset já marca mismatch na page corrompida; edits também invalidam até rebuild.
    const crcStatus: StructurePage['crcStatus'] =
      p.crcStatus === 'mismatch' || edited || !sequenceValid ? 'mismatch' : 'valid'
    return {
      ...p,
      sequence,
      storedCrc: p.storedCrc,
      crcStatus,
    }
  })
}

export function effectivePlayableUntil(
  source: ForensicSource | undefined,
  containerRebuilt: boolean,
): number {
  const cfg = source?.containerPlayback
  if (!cfg) return source?.durationSec ?? 0
  return containerRebuilt ? cfg.containerDurationSec : cfg.damagedPlayableUntilSec
}

export interface RebuildResult {
  ok: boolean
  message: string
  pages: StructurePage[]
}

/**
 * REBUILD CONTAINER — genérico.
 * Usa valores atuais; não “adivinha” a correção.
 */
export function rebuildContainer(
  source: ForensicSource | undefined,
  sequences: Record<string, number>,
): RebuildResult {
  const pages = resolveStructurePages(source, sequences)
  if (!source?.structure?.canRebuild) {
    return { ok: false, message: 'No rebuildable structure for this source.', pages }
  }
  const valid = structureSequenceValid(source, sequences)
  if (!valid) {
    return {
      ok: false,
      message: 'Container rebuilt with structural warnings.',
      pages,
    }
  }
  return {
    ok: true,
    message: 'Container rebuilt. Decode map reconstructed.',
    pages: pages.map((p) => ({ ...p, crcStatus: 'valid' as const })),
  }
}

export function fileMetadataForContainer(
  source: ForensicSource | undefined,
  containerRebuilt: boolean,
): { key: string; label: string; value: string }[] {
  const meta = [...(source?.metadata ?? [])]
  const cfg = source?.containerPlayback
  if (!cfg) return meta
  const decoded = containerRebuilt ? cfg.containerDurationSec : cfg.damagedPlayableUntilSec
  const fmt = (sec: number) => {
    const m = Math.floor(sec / 60)
    const r = sec - m * 60
    return `${String(m).padStart(2, '0')}:${r.toFixed(3).padStart(6, '0')}`
  }
  return meta.map((f) => {
    if (f.key === 'decodedDuration') {
      return { ...f, value: fmt(decoded) }
    }
    if (f.key === 'decodeNote') {
      return {
        ...f,
        value: containerRebuilt ? 'Decode complete.' : 'Decode ended before container EOF.',
      }
    }
    return f
  })
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
  maxNoiseCutDb: 32,
  noiseFloor: 0.24,
  maxDebrisCutDb: 20,
  debrisFloor: 0.34,
  /** Corte máximo da voz limpa quando o perfil está contaminado. */
  maxVoiceCutDb: 28,
}

/** Teto perceptivo da voz limpa — inteligível ≠ cristalina. */
export const CLEAN_VOICE_MAX_GAIN = 0.62

function profileQualityOf(profile: NoiseProfileState): number {
  if (typeof profile.qualityScore === 'number') {
    return clamp01(profile.qualityScore)
  }
  return profile.quality === 'good' ? 1 : 0.28
}

function profileContaminationOf(profile: NoiseProfileState | null): number {
  if (!profile) return 0
  if (typeof profile.voiceContamination === 'number') return clamp01(profile.voiceContamination)
  return profile.quality === 'good' ? 0 : 0.75
}

/**
 * Contaminação por voz na seleção do perfil (0..1).
 * Usa timestamps conhecidos dos segmentos — sem análise espectral.
 */
export function voiceContaminationScore(
  sel: SelectionRange,
  spans: { startSec: number; endSec: number }[],
): number {
  const a0 = Math.min(sel.startSec, sel.endSec)
  const a1 = Math.max(sel.startSec, sel.endSec)
  const dur = Math.max(0.001, a1 - a0)
  let voiceOverlap = 0
  let totalVoice = 0
  for (const s of spans) {
    const spanDur = Math.max(0, s.endSec - s.startSec)
    totalVoice += spanDur
    voiceOverlap += Math.max(0, Math.min(a1, s.endSec) - Math.max(a0, s.startSec))
  }
  const voiceFrac = Math.min(1, voiceOverlap / dur)
  const voiceCoverage = totalVoice > 0 ? Math.min(1, voiceOverlap / totalVoice) : 0
  // Select-all cobre quase toda a fala → contamination alta mesmo com voiceFrac ~15%.
  return clamp01(Math.max(voiceFrac * 2.4, voiceCoverage * 0.98, voiceFrac >= 0.08 ? voiceCoverage * 0.85 + voiceFrac : voiceFrac * 1.6))
}

/** Qualidade por duração da amostra de ruído. */
export function profileDurationQuality(durationSec: number): number {
  if (durationSec < 0.2) return lerp(0.15, 0.45, durationSec / 0.2)
  if (durationSec < 0.5) return lerp(0.45, 1, (durationSec - 0.2) / 0.3)
  if (durationSec <= 2.5) return 1
  if (durationSec <= 8) return lerp(1, 0.78, (durationSec - 2.5) / 5.5)
  return lerp(0.78, 0.5, Math.min(1, (durationSec - 8) / 30))
}

/**
 * Efeito útil de redução de ruído (0..1).
 * requestedReduction * quality * curvas de sens/smooth.
 */
export function noiseReductionEffect(
  process: ProcessParams,
  profile: NoiseProfileState | null,
): number {
  if (process.bypass || process.spectralReduction <= 0 || !profile) return 0
  const q = profileQualityOf(profile)
  const contam = profileContaminationOf(profile)
  const r = clamp01(process.spectralReduction / 100)
  const sens = process.spectralSensitivity
  const smooth = process.spectralSmoothing
  const sensScore = 1 - Math.min(1, Math.abs(sens - 55) / 70)
  const smoothScore = 1 - Math.min(1, Math.abs(smooth - 30) / 80)
  const overdrivePenalty = r > 0.9 ? lerp(1, 0.72, (r - 0.9) / 0.1) : 1
  // Contaminação reduz o benefício líquido sobre o ruído.
  const cleanFactor = (0.32 + 0.68 * q) * (1 - 0.72 * contam)
  return clamp01(
    r *
      cleanFactor *
      (0.55 + 0.45 * sensScore) *
      (0.6 + 0.4 * smoothScore) *
      overdrivePenalty *
      1.12,
  )
}

/**
 * Dano à voz limpa quando o perfil contém fala.
 * voiceDamage ≈ requestedReduction * voiceContamination * curvas.
 */
export function voiceDamageAmount(
  process: ProcessParams,
  profile: NoiseProfileState | null,
): number {
  if (process.bypass || process.spectralReduction <= 0 || !profile) return 0
  const contam = profileContaminationOf(profile)
  if (contam <= 0.02) return 0
  const r = clamp01(process.spectralReduction / 100)
  const sens = 0.55 + 0.45 * (1 - Math.min(1, Math.abs(process.spectralSensitivity - 55) / 70))
  return clamp01(r * contam * sens)
}

/**
 * Spectral Reduction: ruído/debris descem com NRE; voz cai com voiceDamage.
 */
export function spectralStemGains(
  process: ProcessParams,
  profile: NoiseProfileState | null,
  rule: SpectralRule = GENERIC_SPECTRAL_RULE,
): {
  noiseGain: number
  debrisGain: number
  voiceClarity: number
  effectiveNoiseReduction: number
  voiceDamage: number
} {
  const nre = noiseReductionEffect(process, profile)
  const damage = voiceDamageAmount(process, profile)
  if (nre <= 0 && damage <= 0) {
    return {
      noiseGain: 1,
      debrisGain: 1,
      voiceClarity: 1,
      effectiveNoiseReduction: 0,
      voiceDamage: 0,
    }
  }
  const noiseDb = -rule.maxNoiseCutDb * nre
  const debrisDb = -rule.maxDebrisCutDb * nre
  // Contaminação alta → corte forte da voz (tudo no perfil vira "ruído").
  const voiceDb = -rule.maxVoiceCutDb * damage
  return {
    noiseGain: Math.max(rule.noiseFloor, Math.pow(10, noiseDb / 20)),
    debrisGain: Math.max(rule.debrisFloor, Math.pow(10, debrisDb / 20)),
    voiceClarity: Math.pow(10, voiceDb / 20),
    effectiveNoiseReduction: nre,
    voiceDamage: damage,
  }
}

export interface RecoveryMetrics {
  centerAccuracy: number
  notchDepthEffect: number
  notchWidthQuality: number
  notchEffectiveness: number
  noiseProfileQuality: number
  noiseReductionEffect: number
  voiceContamination: number
  voiceDamage: number
  profileDuration: number
  /** Métrica auxiliar — não é o mecanismo principal de unlock. */
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
  const contam = profileContaminationOf(profile)
  const dur = profile ? (profile.durationSec ?? Math.max(0, profile.endSec - profile.startSec)) : 0
  if (process.bypass) {
    return {
      centerAccuracy: 0,
      notchDepthEffect: 0,
      notchWidthQuality: 0,
      notchEffectiveness: 0,
      noiseProfileQuality: q,
      noiseReductionEffect: 0,
      voiceContamination: contam,
      voiceDamage: 0,
      profileDuration: dur,
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
  const damage = voiceDamageAmount(process, profile)
  const recoveryAmount = clamp01(0.22 * center + 0.22 * depth + 0.18 * width + 0.38 * nre)
  return {
    centerAccuracy: center,
    notchDepthEffect: depth,
    notchWidthQuality: width,
    notchEffectiveness: notch,
    noiseProfileQuality: q,
    noiseReductionEffect: nre,
    voiceContamination: contam,
    voiceDamage: damage,
    profileDuration: dur,
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
 * Qualidade do perfil a partir de contamination + duração.
 * Qualquer intervalo sem fala e com duração razoável pode ser bom
 * (00:00.30–00:01.80 é só a região mais óbvia).
 */
export function profileQualityScore(
  sel: SelectionRange,
  spans: { startSec: number; endSec: number }[],
  _ideal?: { startSec: number; endSec: number },
): number {
  const a0 = Math.min(sel.startSec, sel.endSec)
  const a1 = Math.max(sel.startSec, sel.endSec)
  const dur = Math.max(0.001, a1 - a0)
  const contam = voiceContaminationScore(sel, spans)
  const durationQ = profileDurationQuality(dur)
  // Sem voz → qualidade alta limitada pela duração.
  const clean = clamp01(1 - contam)
  let q = clean * durationQ
  if (contam <= 0.02 && durationQ >= 0.9) q = Math.max(q, 0.94)
  if (contam >= 0.35) q = Math.min(q, 0.28)
  if (contam >= 0.7) q = Math.min(q, 0.12)
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
  const startSec = Math.min(sel.startSec, sel.endSec)
  const endSec = Math.max(sel.startSec, sel.endSec)
  const durationSec = endSec - startSec
  const voiceContamination = spans?.length ? voiceContaminationScore(sel, spans) : 0.5
  const qualityScore = spans?.length
    ? profileQualityScore(sel, spans, ideal)
    : classifyNoiseProfile(sel, regions) === 'good'
      ? 0.98
      : 0.22
  const quality: NoiseProfileState['quality'] = qualityScore >= 0.72 ? 'good' : 'contaminated'
  const profile: NoiseProfileState = {
    id: `np-${existing.length + 1}-${Date.now()}`,
    name: `Profile ${existing.length + 1}`,
    startSec,
    endSec,
    quality,
    qualityScore,
    voiceContamination,
    durationSec,
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
 * Voz limpa por frase: clipRecoveryGain (teto CLEAN_VOICE_MAX_GAIN).
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
  const notchProg = clamp01(
    metrics.centerAccuracy * 0.45 + metrics.notchDepthEffect * 0.35 + metrics.notchWidthQuality * 0.2,
  )
  const recovery = clamp01(0.55 * notchProg + 0.45 * metrics.noiseReductionEffect)
  // Residuais altos de propósito — solução final ainda parece telefone degradado.
  const corrupted = lerp(1, 0.44, recovery)
  const cleanBus = lerp(0.22, 0.52, recovery) * voiceClarity
  const toneAtten =
    process.bypass || !rules?.notch
      ? 1
      : Math.pow(10, (-(rules.notch.maxAttenuationDb) * metrics.notchEffectiveness) / 20)
  // Piso residual de interferência — nunca some por completo.
  const tone = (base.TONE_1700 ?? 1) * Math.max(0.14, toneAtten)

  return {
    FILE: (base.FILE ?? 1) * master,
    CORRUPTED_BASE: (base.CORRUPTED_BASE ?? 1) * corrupted * master,
    VOICE: (base.VOICE ?? 1) * cleanBus * master,
    BACKGROUND_NOISE: (base.BACKGROUND_NOISE ?? 1) * noiseGain * master,
    TONE_1700: tone * master,
    VOCAL_DEBRIS: (base.VOCAL_DEBRIS ?? 1) * debrisGain * master,
    CLICKS: (base.CLICKS ?? 1) * lerp(1, 0.55, recovery) * master,
  }
}

export interface SegmentClarity {
  segmentId: string
  centerContribution: number
  depthContribution: number
  widthContribution: number
  noiseContribution: number
  clarityScore: number
  threshold: number
  unlocked: boolean
  effectiveVoiceGain: number
  effectiveMaskGain: number
  clarityDb: number
  thresholdDb: number
}

/**
 * Score de recuperação por segmento — pesos do dataset.
 * Contínuo. Contaminação do perfil reduz o benefício de noise e a voz efetiva.
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
  const spectral = spectralStemGains(process, profile, rules?.spectral)
  const w = segment.recoveryWeights
  // Noise útil só conta se o perfil não destrói a voz daquele trecho.
  const noiseUseful = metrics.noiseReductionEffect * (1 - 0.85 * metrics.voiceContamination)
  const centerContribution = w.center * metrics.centerAccuracy
  const depthContribution = w.depth * metrics.notchDepthEffect
  const widthContribution = w.width * metrics.notchWidthQuality
  const noiseContribution = w.noise * noiseUseful
  let clarityScore = clamp01(
    centerContribution + depthContribution + widthContribution + noiseContribution,
  )
  if (w.center >= 0.25 && metrics.centerAccuracy < 0.28) {
    clarityScore *= lerp(0.35, 1, metrics.centerAccuracy / 0.28)
  }
  if (w.depth >= 0.35 && metrics.notchDepthEffect < 0.2) {
    clarityScore *= lerp(0.45, 1, metrics.notchDepthEffect / 0.2)
  }
  if (w.width >= 0.25 && metrics.notchWidthQuality < 0.35) {
    clarityScore *= lerp(0.4, 1, metrics.notchWidthQuality / 0.35)
  }
  if (w.noise >= 0.5 && noiseUseful < 0.25) {
    clarityScore *= lerp(0.3, 1, noiseUseful / 0.25)
  }
  // Perfil contaminado não pode empurrar o score de fala via redução.
  if (metrics.voiceContamination >= 0.35 && w.noise >= 0.4) {
    clarityScore = Math.min(clarityScore, segment.clarityThreshold * 0.82)
  }
  clarityScore = clamp01(clarityScore)

  const voiceMul = clipRecoveryGain(clarityScore, segment.voiceWeight) * spectral.voiceClarity
  const toneMask =
    lerp(1, 0.18, metrics.notchEffectiveness) * (segment.toneWeight ?? 1) * 0.35
  const noiseMask = spectral.noiseGain * (segment.noiseWeight ?? 1) * 0.4
  const debrisMask = spectral.debrisGain * (segment.debrisWeight ?? 1) * 0.35
  const corruptedMask = lerp(0.9, 0.4, clarityScore) * 0.45
  const effectiveMaskGain = Math.sqrt(
    toneMask * toneMask + noiseMask * noiseMask + debrisMask * debrisMask + corruptedMask * corruptedMask,
  )

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
    effectiveVoiceGain: voiceMul,
    effectiveMaskGain,
    clarityDb: clarityScore * 10,
    thresholdDb: threshold * 10,
  }
}

/**
 * Presença limpa progressiva (cadência → sílabas → palavras → frase).
 * Teto ~0.62 — nunca master limpo.
 */
export function clipRecoveryGain(score: number, voiceWeight = 1): number {
  const s = clamp01(score)
  // Curva suave: 0.3→cadência, 0.5→sílabas, 0.7→palavras, ≥thr→frase.
  const shaped = s * s * (3 - 2 * s)
  const eased = lerp(shaped * 0.85, shaped, s)
  return Math.min(CLEAN_VOICE_MAX_GAIN, lerp(0.012, CLEAN_VOICE_MAX_GAIN, eased) * Math.min(1.15, voiceWeight))
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
    // Structure / container repair is a finding — Reset processing does not undo it.
    structureSequences: ui.structureSequences,
    containerRebuilt: ui.containerRebuilt,
    selectedStructurePageId: ui.selectedStructurePageId,
    rebuildStatus: ui.rebuildStatus,
    rebuildCount: ui.rebuildCount,
    tempoEstimate: null,
    linkStatus: ui.linkStatus,
    linkedSetSourceId: ui.linkedSetSourceId,
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
