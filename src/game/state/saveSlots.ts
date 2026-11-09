import type { InvestigationState } from '../types'
import { currentBlockLabel, hubLocationLabel, playTimeOf } from '../../lib/caseProgress'
import { SAVE_KEY } from './initialState'

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
    const parsed = JSON.parse(raw) as InvestigationState
    index.slots.auto = metaFromState(parsed, 'auto', 'legacy', null)
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

export function syncAutosaveMeta(state: InvestigationState, thumbnail?: string | null) {
  const index = readSaveIndex()
  const prev = index.slots.auto
  index.slots.auto = metaFromState(state, 'auto', prev?.kind === 'legacy' ? 'legacy' : 'auto', thumbnail ?? prev?.thumbnail ?? null)
  writeSaveIndex(index)
}

export function writeManualSlot(id: Exclude<SaveSlotId, 'auto'>, state: InvestigationState, thumbnail: string | null) {
  const meta = metaFromState(state, id, 'manual', thumbnail)
  try {
    localStorage.setItem(`${SLOT_KEY_PREFIX}${id}`, JSON.stringify({ meta, state }))
  } catch {
    /* quota */
  }
  const index = readSaveIndex()
  index.slots[id] = meta
  writeSaveIndex(index)
  return meta
}

export function readManualSlot(id: Exclude<SaveSlotId, 'auto'>): InvestigationState | null {
  try {
    const raw = localStorage.getItem(`${SLOT_KEY_PREFIX}${id}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { state?: InvestigationState }
    return parsed.state ?? null
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
