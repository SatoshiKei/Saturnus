import { currentBlockLabel, hubLocationLabel, playTimeOf } from '../../lib/caseProgress'
import type { InvestigationState, StoryActionRef } from '../types'
import { applyStoryActions } from '../story/actions'
import { runStoryEngine } from '../story/engine'
import { repairInvestigationState } from '../personRegistryGates'
import { createInitialState, SAVE_KEY, STATE_VERSION } from './initialState'

/** Versão do envelope de save (metadados + estado). */
export const SAVE_SNAPSHOT_VERSION = 1

export interface GameSaveMetadata {
  savedAt: number
  playTimeMs: number
  blockLabel: string
  locationLabel: string
  thumbnailSceneSrc?: string | null
}

export interface GameSaveSnapshot {
  version: number
  metadata: GameSaveMetadata
  investigation: InvestigationState
  thumbnail: string | null
}

export function stripEphemeralUi(s: InvestigationState): InvestigationState {
  return { ...s, discoveries: [], toastQueue: [] }
}

export function buildMetadata(
  state: InvestigationState,
  extras?: { thumbnailSceneSrc?: string | null },
): GameSaveMetadata {
  return {
    savedAt: Date.now(),
    playTimeMs: playTimeOf(state),
    blockLabel: currentBlockLabel(state.flags),
    locationLabel: hubLocationLabel(),
    thumbnailSceneSrc: extras?.thumbnailSceneSrc ?? null,
  }
}

/** Snapshot pronto para persistir (sem UI efêmera). */
export function createGameSaveSnapshot(
  state: InvestigationState,
  thumbnail: string | null,
  extras?: { thumbnailSceneSrc?: string | null },
): GameSaveSnapshot {
  const investigation = stripEphemeralUi(state)
  return {
    version: SAVE_SNAPSHOT_VERSION,
    metadata: buildMetadata(investigation, extras),
    investigation,
    thumbnail,
  }
}

/**
 * Normaliza payload antigo (só InvestigationState) ou novo (GameSaveSnapshot).
 */
export function parseSavePayload(raw: unknown): GameSaveSnapshot | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  if (obj.investigation && typeof obj.investigation === 'object') {
    const inv = obj.investigation as InvestigationState
    const meta = (obj.metadata as GameSaveMetadata | undefined) ?? buildMetadata(inv)
    return {
      version: typeof obj.version === 'number' ? obj.version : SAVE_SNAPSHOT_VERSION,
      metadata: meta,
      investigation: inv,
      thumbnail: (obj.thumbnail as string | null | undefined) ?? null,
    }
  }
  if (typeof obj.version === 'number' && obj.flags && obj.evidenceOwned) {
    const inv = obj as unknown as InvestigationState
    return {
      version: SAVE_SNAPSHOT_VERSION,
      metadata: buildMetadata(inv),
      investigation: inv,
      thumbnail: null,
    }
  }
  return null
}

/**
 * Constrói estado canônico: initial + actions (reducers) + engine uma vez.
 * Usado por checkpoints DEV (sempre a partir do zero — permite voltar no tempo).
 */
export function buildStateFromActions(actions: StoryActionRef[]): InvestigationState {
  let next = createInitialState()
  if (actions.length) next = applyStoryActions(next, actions)
  next = stripEphemeralUi(runStoryEngine(next))
  return repairInvestigationState(next)
}

export function readAutosaveSnapshot(): GameSaveSnapshot | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    return parseSavePayload(JSON.parse(raw))
  } catch {
    return null
  }
}

export { STATE_VERSION, SAVE_KEY }
