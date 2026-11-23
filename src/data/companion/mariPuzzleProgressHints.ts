import type { ForensicUiState } from '../../forensic/forensicTypes'
import type { MariPuzzleHint } from './mariPuzzleHints'
import { mariHintsForPuzzle } from './mariPuzzleHints'

/** Snapshot mínimo da bancada — evita acoplar MariWorkbench ao ForensicWorkbench inteiro. */
export type MariForensicProgress = {
  recoveredCount: number
  notchReductionDb: number
  spectralReduction: number
  hasNoiseProfile: boolean
  inspectorTab: string
  containerRebuilt: boolean
  compareActive: boolean
  alignmentSaved: boolean
  loggerSourceOpen: boolean
  clipSequenceLen: number
  sequenceAssembled: boolean
  spectrogramViewedCount: number
  rfBandSelected: boolean
  rfHiddenListened: boolean
  similarRegionCount: number
  hasCommonPattern: boolean
  streamARecovered: boolean
  streamBRecovered: boolean
  packetSortIsSequence: boolean
  rotationCrossingSet: boolean
  rotationCadSet: boolean
  rotationCompareUsed: boolean
  memoryStrongHit: boolean
  memoryConfirmedCount: number
}

export type MariRingsProgress = {
  fpOk: boolean
  frOk: boolean
  routeResolved: boolean
  dvrInspected: boolean
  storageSearched: boolean
}

export type MariHintTriggerContext = {
  sessionOpenSec: number
  idleSec: number
  secSinceLastDismiss: number
  forensic?: MariForensicProgress
  rings?: MariRingsProgress
}

const H1_OPEN_DELAY_SEC = 0.8
const COOLDOWN_AFTER_DISMISS_SEC = 28
const H2_IDLE_FALLBACK_SEC = 55
const H2_SESSION_FALLBACK_SEC = 120
const H3_IDLE_FALLBACK_SEC = 75
const H3_SESSION_FALLBACK_SEC = 180

export function forensicUiToMariProgress(
  ui: ForensicUiState,
  activeSourceId: string | null,
): MariForensicProgress {
  return {
    recoveredCount: ui.recoveredSpeech.length,
    notchReductionDb: ui.process.notchReductionDb,
    spectralReduction: ui.process.spectralReduction,
    hasNoiseProfile: Boolean(ui.activeNoiseProfileId) || ui.noiseProfiles.length > 0,
    inspectorTab: ui.inspectorTab,
    containerRebuilt: ui.containerRebuilt,
    compareActive: Boolean(ui.compareSourceA && ui.compareSourceB),
    alignmentSaved: ui.findingUnlocked,
    loggerSourceOpen: activeSourceId === 'rc_logger_log',
    clipSequenceLen: ui.clipSequence.length,
    sequenceAssembled: ui.sequenceAssembled,
    spectrogramViewedCount: ui.spectrogramViewedSourceIds.length,
    rfBandSelected: ui.rfCenterMhz != null && ui.rfBandwidthMhz != null,
    rfHiddenListened: ui.rfHiddenChannelListened,
    similarRegionCount: ui.similarRegions.length,
    hasCommonPattern:
      ui.referenceCycleIndexes.length >= 3 &&
      ui.commonPatternQuality != null &&
      ui.commonPatternQuality > 0.2,
    streamARecovered: ui.streamARecovered,
    streamBRecovered: ui.streamBRecovered,
    packetSortIsSequence: ui.packetSort === 'sequence',
    rotationCrossingSet: Boolean(ui.rotationCrossingId || ui.rotationConsultedTags.length > 0),
    rotationCadSet: Boolean(ui.rotationCadId),
    rotationCompareUsed: Boolean(ui.rotationFingerprintVehicle || ui.rotationCompareStatus),
    memoryStrongHit: ui.memorySearchHits.some((h) => h.strong),
    memoryConfirmedCount: ui.memoryConfirmedSources.length,
  }
}

function milestoneTier2(puzzleId: string, ctx: MariHintTriggerContext): boolean {
  const f = ctx.forensic
  const r = ctx.rings

  switch (puzzleId) {
    case 'puzzle-01-cassini':
      return (
        (f?.recoveredCount ?? 0) >= 1 ||
        (f?.notchReductionDb ?? 0) >= 8 ||
        f?.inspectorTab === 'analysis'
      )
    case 'puzzle-02-iapetus':
      return f?.inspectorTab === 'structure' || f?.inspectorTab === 'file'
    case 'puzzle-03-anels':
      return Boolean(f?.hasNoiseProfile || (f?.spectralReduction ?? 0) >= 40)
    case 'puzzle-04-janus-epimetheus':
      return Boolean(f?.compareActive)
    case 'puzzle-05-saturnalia':
      return Boolean(
        f?.loggerSourceOpen ||
          f?.inspectorTab === 'structure' ||
          (f?.clipSequenceLen ?? 0) > 0,
      )
    case 'puzzle-06-hexagon':
      return (f?.spectrogramViewedCount ?? 0) >= 2
    case 'puzzle-07-shepherd-moons':
      return Boolean(f?.rfBandSelected)
    case 'puzzle-08-enceladus':
      return (f?.similarRegionCount ?? 0) >= 1
    case 'puzzle-09-cassini-huygens':
      return Boolean(f?.streamARecovered)
    case 'puzzle-10-rings':
      return Boolean(r?.fpOk)
    case 'puzzle-11-saturn-rotation':
      return Boolean(f?.rotationCrossingSet)
    case 'puzzle-12-memory':
      return Boolean(f?.memoryStrongHit)
    default:
      return false
  }
}

function milestoneTier3(puzzleId: string, ctx: MariHintTriggerContext): boolean {
  const f = ctx.forensic
  const r = ctx.rings

  switch (puzzleId) {
    case 'puzzle-01-cassini':
      return (
        (f?.recoveredCount ?? 0) >= 3 ||
        (f?.hasNoiseProfile && (f?.spectralReduction ?? 0) >= 50)
      )
    case 'puzzle-02-iapetus':
      return Boolean(f?.containerRebuilt)
    case 'puzzle-03-anels':
      return Boolean(
        f?.hasNoiseProfile &&
          (f?.spectralReduction ?? 0) >= 55 &&
          (f?.recoveredCount ?? 0) === 0,
      )
    case 'puzzle-04-janus-epimetheus':
      return Boolean(f?.alignmentSaved)
    case 'puzzle-05-saturnalia':
      return Boolean(f?.sequenceAssembled || (f?.clipSequenceLen ?? 0) >= 8)
    case 'puzzle-06-hexagon':
      return (f?.spectrogramViewedCount ?? 0) >= 5
    case 'puzzle-07-shepherd-moons':
      return Boolean(f?.rfHiddenListened)
    case 'puzzle-08-enceladus':
      return Boolean(f?.hasCommonPattern)
    case 'puzzle-09-cassini-huygens':
      return Boolean(f?.packetSortIsSequence && f?.streamARecovered && !f?.streamBRecovered)
    case 'puzzle-10-rings':
      return Boolean(
        r?.fpOk &&
          r?.frOk &&
          (r.routeResolved || r.dvrInspected || r.storageSearched),
      )
    case 'puzzle-11-saturn-rotation':
      return Boolean(f?.rotationCadSet)
    case 'puzzle-12-memory':
      return (f?.memoryConfirmedCount ?? 0) >= 1 && (f?.memoryConfirmedCount ?? 0) < 4
    default:
      return false
  }
}

function tier2Ready(ctx: MariHintTriggerContext, puzzleId: string): boolean {
  if (milestoneTier2(puzzleId, ctx)) return true
  return (
    ctx.sessionOpenSec >= H2_SESSION_FALLBACK_SEC &&
    ctx.idleSec >= H2_IDLE_FALLBACK_SEC
  )
}

function tier3Ready(ctx: MariHintTriggerContext, puzzleId: string): boolean {
  if (milestoneTier3(puzzleId, ctx)) return true
  if (puzzleId === 'puzzle-11-saturn-rotation' && ctx.forensic?.rotationCompareUsed) return true
  return (
    ctx.sessionOpenSec >= H3_SESSION_FALLBACK_SEC &&
    ctx.idleSec >= H3_IDLE_FALLBACK_SEC
  )
}

function cooldownOk(ctx: MariHintTriggerContext, tier: 2 | 3): boolean {
  if (ctx.secSinceLastDismiss < COOLDOWN_AFTER_DISMISS_SEC) return false
  if (tier === 2) return true
  return ctx.secSinceLastDismiss >= COOLDOWN_AFTER_DISMISS_SEC
}

export function nextMariPuzzleHintTier(
  puzzleId: string,
  flags: Record<string, boolean>,
  ctx: MariHintTriggerContext,
): MariPuzzleHint | null {
  const hints = mariHintsForPuzzle(puzzleId)
  if (!hints.length) return null

  const byTier = (tier: 1 | 2 | 3) => hints.find((h) => h.tier === tier)
  const h1 = byTier(1)
  const h2 = byTier(2)
  const h3 = byTier(3)

  if (h1 && !flags[h1.seenFlag]) {
    if (ctx.sessionOpenSec >= H1_OPEN_DELAY_SEC) return h1
    return null
  }

  if (h2 && !flags[h2.seenFlag]) {
    if (cooldownOk(ctx, 2) && tier2Ready(ctx, puzzleId)) return h2
    return null
  }

  if (h3 && !flags[h3.seenFlag]) {
    if (cooldownOk(ctx, 3) && tier3Ready(ctx, puzzleId)) return h3
    return null
  }

  return null
}