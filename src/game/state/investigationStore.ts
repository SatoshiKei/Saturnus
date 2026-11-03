import { contradictionDefs } from '../../data/game/seedStory'
import type { InvestigationState, StoryActionRef, PersonStatus } from '../types'
import { repairInvestigationState } from '../personRegistryGates'
import { createInitialState, SAVE_KEY } from './initialState'
import { applyStoryActions } from '../story/actions'
import { runStoryEngine } from '../story/engine'
import { maxPersonStatus } from './personStatusOrder'

type Listener = () => void

let state: InvestigationState = createInitialState()
const listeners = new Set<Listener>()

function emit() {
  listeners.forEach((l) => l())
}

function commit(next: InvestigationState, persist = true) {
  state = runStoryEngine(next)
  if (persist) saveGame(state)
  emit()
}

export function getInvestigationState(): InvestigationState {
  return state
}

export function subscribeInvestigation(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function dispatchActions(actions: StoryActionRef[]) {
  commit(applyStoryActions(state, actions))
}

export function discoverPerson(id: string, status?: PersonStatus) {
  dispatchActions([{ type: 'discoverPerson', id, status }])
}

export function addEvidence(id: string) {
  dispatchActions([{ type: 'addEvidence', id }])
}

export function unlockContact(contactId: string) {
  dispatchActions([{ type: 'unlockContact', contactId }])
}

export function setFlag(id: string, value = true) {
  dispatchActions([{ type: 'setFlag', id, value }])
}

export function markDocumentRead(docId: string) {
  const prev = state.documents[docId] ?? { read: false, highlightedBlockIds: [] }
  commit({
    ...state,
    documents: { ...state.documents, [docId]: { ...prev, read: true } },
  })
}

export function extractFromDocument(blockId: string, docId: string, actions: StoryActionRef[]) {
  const prev = state.documents[docId] ?? { read: true, highlightedBlockIds: [] }
  const highlighted = prev.highlightedBlockIds.includes(blockId)
    ? prev.highlightedBlockIds
    : [...prev.highlightedBlockIds, blockId]
  commit(
    applyStoryActions(
      { ...state, documents: { ...state.documents, [docId]: { ...prev, highlightedBlockIds: highlighted } } },
      actions,
    ),
  )
}

export function tryConfirmContradiction(evidenceA: string, evidenceB: string): boolean {
  const def = contradictionDefs.find(
    (c) =>
      (c.evidenceAId === evidenceA && c.evidenceBId === evidenceB) ||
      (c.evidenceAId === evidenceB && c.evidenceBId === evidenceA),
  )
  if (!def) return false
  dispatchActions([
    { type: 'confirmContradiction', id: def.id },
    ...(def.actions ?? []),
  ])
  return true
}

export function installMarianaApp(appId: string): 'ok' | 'needs-password' | 'already' {
  const phone = state.phones.mariana
  if (phone.installedAppIds.includes(appId)) return 'already'
  if (appId === 'wavelab-mobile' && !state.passwordsDiscovered.marianaAccount) {
    return 'needs-password'
  }
  dispatchActions([{ type: 'installApp', device: 'mariana', appId }])
  return 'ok'
}

export function tryDiaryPassword(_password: string): 'wrong' | 'needs-discovery' | 'unlocked' {
  const phone = state.phones.mariana
  if (!state.passwordsDiscovered.diary) {
    return 'needs-discovery'
  }
  // Senha definitiva não definida — dev flag ou future puzzle
  if (_password !== 'demo-diary') {
    commit({
      ...state,
      phones: {
        ...state.phones,
        mariana: { ...phone, diaryPasswordAttempts: phone.diaryPasswordAttempts + 1 },
      },
    })
    return 'wrong'
  }
  commit({
    ...state,
    phones: {
      ...state.phones,
      mariana: { ...phone, diaryUnlocked: true },
    },
  })
  return 'unlocked'
}

export function revealHiddenApps() {
  dispatchActions([{ type: 'revealHiddenApps', device: 'mariana' }])
}

export function advancePerson(id: string, status: PersonStatus) {
  const p = state.people[id]
  if (!p) return
  commit({
    ...state,
    people: { ...state.people, [id]: { ...p, status: maxPersonStatus(p.status, status) } },
  })
}

export function completeTask(id: string) {
  dispatchActions([{ type: 'completeTask', id }])
}

export function popToast(): string | undefined {
  if (state.toastQueue.length === 0) return undefined
  const [first, ...rest] = state.toastQueue
  state = { ...state, toastQueue: rest }
  emit()
  return first
}

export function dismissProvocation(id: string) {
  commit({
    ...state,
    provocationsPending: state.provocationsPending.filter((p) => p !== id),
    provocationsSeen: [...state.provocationsSeen, id],
  })
}

export function deriveEvidenceFromAudio(sourceId: string, derivedId: string) {
  if (state.evidenceOwned.includes(derivedId)) return
  dispatchActions([{ type: 'addEvidence', id: derivedId }])
  setFlag(`derived_from_${sourceId}`, true)
}

export function saveGame(s = state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(s))
  } catch {
    /* ignore quota */
  }
}

export function loadGame(): boolean {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw) as InvestigationState
    const repaired = repairInvestigationState(parsed)
    state = runStoryEngine(repaired)
    if (
      repaired.flags.block02_paula_chat_done !== parsed.flags.block02_paula_chat_done ||
      repaired.flags.block02_lucas_available !== parsed.flags.block02_lucas_available
    ) {
      saveGame(state)
    }
    emit()
    return true
  } catch {
    return false
  }
}

export function resetGame() {
  state = createInitialState()
  localStorage.removeItem(SAVE_KEY)
  emit()
}

export function devApply(actions: StoryActionRef[]) {
  dispatchActions(actions)
}

/** Test hook */
export function __setStateForTests(next: InvestigationState) {
  state = next
  emit()
}
