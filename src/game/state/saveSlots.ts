import type { InvestigationState } from '../types'
import { currentBlockLabel, hubLocationLabel, playTimeOf } from '../../lib/caseProgress'
import {
  createGameSaveSnapshot,
  parseSavePayload,
  SAVE_KEY,
  type GameSaveSnapshot,
} from './gameSave'

export const SAVE_INDEX_KEY = 'saturnus-save-index-v1'
export const SLOT_KEY_PREFIX = 'saturnus-save-slot-'
export const MANUAL_SLOT_IDS = ['1', '2', '3'] as const

export type SaveSlotId = 'auto' | (typeof MANUAL_SLOT_IDS)[number]

export interface SaveSlotMeta {
  id: SaveSlotId
  kind: 'auto' | 'manual' | 'legacy'
  savedAt: number
  playTimeMs: number
  blockLabel: string
  locationLabel: string
  thumbnail: string | null
}

export interface SaveIndex {
  version: 1
  slots: Partial<Record<SaveSlotId, SaveSlotMeta>>
}

function emptyIndex(): SaveIndex {
  return { version: 1, slots: {} }
}

export function readSaveIndex(): SaveIndex {
  try {
    const raw = localStorage.getItem(SAVE_INDEX_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as SaveIndex
      if (parsed?.version === 1 && parsed.slots) return parsed
    }
  } catch {
    /* ignore */
  }
  return migrateLegacyIndex()
}

function migrateLegacyIndex(): SaveIndex {
  const index = emptyIndex()
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return index
    const snap = parseSavePayload(JSON.parse(raw))
    if (!snap) return index
    index.slots.auto = metaFromSnapshot(snap, 'auto', 'legacy')
    writeSaveIndex(index)
  } catch {
    /* ignore */
  }
  return index
}

export function writeSaveIndex(index: SaveIndex) {
  try {
    localStorage.setItem(SAVE_INDEX_KEY, JSON.stringify(index))
  } catch {
    /* quota */
  }
}

export function hasAnySave(): boolean {
  const index = readSaveIndex()
  if (Object.keys(index.slots).length > 0) return true
  try {
    return Boolean(localStorage.getItem(SAVE_KEY))
  } catch {
    return false
  }
}

export function hasAutosave(): boolean {
  try {
    if (localStorage.getItem(SAVE_KEY)) return true
  } catch {
    /* ignore */
  }
  return Boolean(readSaveIndex().slots.auto)
}

export function metaFromState(
  state: InvestigationState,
  id: SaveSlotId,
  kind: SaveSlotMeta['kind'],
  thumbnail: string | null,
): SaveSlotMeta {
  return {
    id,
    kind,
    savedAt: Date.now(),
    playTimeMs: playTimeOf(state),
    blockLabel: currentBlockLabel(state.flags),
    locationLabel: hubLocationLabel(),
    thumbnail,
  }
}

export function metaFromSnapshot(
  snap: GameSaveSnapshot,
  id: SaveSlotId,
  kind: SaveSlotMeta['kind'],
): SaveSlotMeta {
  return {
    id,
    kind,
    savedAt: snap.metadata.savedAt,
    playTimeMs: snap.metadata.playTimeMs,
    blockLabel: snap.metadata.blockLabel,
    locationLabel: snap.metadata.locationLabel,
    thumbnail: snap.thumbnail,
  }
}

export function syncAutosaveMeta(state: InvestigationState, thumbnail?: string | null) {
  const index = readSaveIndex()
  const prev = index.slots.auto
  index.slots.auto = metaFromState(
    state,
    'auto',
    prev?.kind === 'legacy' ? 'legacy' : 'auto',
    thumbnail ?? prev?.thumbnail ?? null,
  )
  writeSaveIndex(index)
}

export function writeAutosaveSnapshot(snap: GameSaveSnapshot) {
  const index = readSaveIndex()
  const prev = index.slots.auto
  const thumb = snap.thumbnail ?? prev?.thumbnail ?? null
  const toStore: GameSaveSnapshot = { ...snap, thumbnail: thumb }
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(toStore))
  } catch {
    /* quota */
  }
  index.slots.auto = {
    ...metaFromSnapshot(toStore, 'auto', prev?.kind === 'legacy' ? 'legacy' : 'auto'),
    thumbnail: thumb,
  }
  writeSaveIndex(index)
}

export function writeManualSlot(
  id: Exclude<SaveSlotId, 'auto'>,
  state: InvestigationState,
  thumbnail: string | null,
) {
  const snap = createGameSaveSnapshot(state, thumbnail)
  const meta = metaFromSnapshot(snap, id, 'manual')
  try {
    localStorage.setItem(`${SLOT_KEY_PREFIX}${id}`, JSON.stringify({ meta, snapshot: snap, state: snap.investigation }))
  } catch {
    /* quota */
  }
  const index = readSaveIndex()
  index.slots[id] = meta
  writeSaveIndex(index)
  return meta
}

/** Retorna InvestigationState (compat) a partir do slot. */
export function readManualSlot(id: Exclude<SaveSlotId, 'auto'>): InvestigationState | null {
  const snap = readManualSnapshot(id)
  return snap?.investigation ?? null
}

export function readManualSnapshot(id: Exclude<SaveSlotId, 'auto'>): GameSaveSnapshot | null {
  try {
    const raw = localStorage.getItem(`${SLOT_KEY_PREFIX}${id}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { snapshot?: GameSaveSnapshot; state?: InvestigationState; meta?: SaveSlotMeta }
    if (parsed.snapshot) return parsed.snapshot
    if (parsed.state) {
      return createGameSaveSnapshot(parsed.state, parsed.meta?.thumbnail ?? null)
    }
    return parseSavePayload(parsed)
  } catch {
    return null
  }
}

export function clearAutosaveStorage() {
  try {
    localStorage.removeItem(SAVE_KEY)
  } catch {
    /* ignore */
  }
  const index = readSaveIndex()
  delete index.slots.auto
  writeSaveIndex(index)
}
