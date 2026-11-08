import { seedDocuments } from '../../data/game/seedDocuments'
import { HEX_PIN } from '../../data/block04/hexagonPuzzle'
import type { ChatMessage } from '../../types/messaging'
import type { ChatProgress, InvestigationState, StoryActionRef, PersonStatus } from '../types'
import { repairInvestigationState } from '../personRegistryGates'
import { createInitialState, SAVE_KEY, STATE_VERSION } from './initialState'
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

/**
 * Abre um documento: garante a posse, marca como lido e dispara `onOpen` apenas na primeira leitura.
 * Telefones/endereços do documento são registrados pelas ações (contato, local no mapa).
 */
export function openDocument(docId: string) {
  const def = seedDocuments.find((d) => d.id === docId)
  if (!def) return
  const wasRead = Boolean(state.documents[docId]?.read)
  const prev = state.documents[docId] ?? { read: false, highlightedBlockIds: [] }
  let next = applyStoryActions(state, [{ type: 'addDocument', id: docId }])
  next = { ...next, documents: { ...next.documents, [docId]: { ...prev, read: true } } }
  if (!wasRead && def.onOpen?.length) next = applyStoryActions(next, def.onOpen)
  commit(next)
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

export function installMarianaApp(appId: string): 'ok' | 'needs-password' | 'already' {
  const phone = state.phones.mariana
  if (phone.installedAppIds.includes(appId)) return 'already'
  if (appId === 'wavelab-mobile' && !state.passwordsDiscovered.marianaAccount) {
    return 'needs-password'
  }
  dispatchActions([{ type: 'installApp', device: 'mariana', appId }])
  return 'ok'
}

/**
 * PIN do diário (Hexágono). Tentado no app do iPhone de Mariana, depois que a Perícia
 * restaurou o pacote no aparelho. Nada é preenchido automaticamente.
 */
export function tryDiaryPin(pin: string): 'locked' | 'wrong' | 'unlocked' {
  const revealed =
    state.flags.block04_forensics_access ||
    state.flags.block04_diary_icon_revealed ||
    state.phones.mariana.diaryUnlocked
  if (!revealed) return 'locked'
  const phone = state.phones.mariana
  if (phone.diaryUnlocked) return 'unlocked'
  if (pin.trim() !== HEX_PIN) {
    commit({
      ...state,
      phones: {
        ...state.phones,
        mariana: { ...phone, diaryPasswordAttempts: phone.diaryPasswordAttempts + 1 },
      },
    })
    return 'wrong'
  }
  commit(
    applyStoryActions(
      {
        ...state,
        phones: { ...state.phones, mariana: { ...phone, diaryUnlocked: true } },
      },
      [
        { type: 'discoverPassword', which: 'diary' },
        { type: 'addEvidence', id: 'hidden_diary_recovered' },
        { type: 'setFlag', id: 'block04_forensics_done', value: true },
        { type: 'completeTask', id: 'task_unlock_diary' },
        { type: 'addTask', id: 'task_read_diary', label: 'Ler o diário recuperado' },
      ],
    ),
  )
  return 'unlocked'
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

/** Remove um evento da fila de descobertas (X do cartão ou fim do aviso). */
export function dismissDiscovery(id: string) {
  if (!state.discoveries.some((d) => d.id === id)) return
  commit({ ...state, discoveries: state.discoveries.filter((d) => d.id !== id) })
}

/** Marca um áudio como visto na bancada (remove o selo NOVO). */
export function markAudioSeen(evidenceId: string) {
  if (state.audioSeen.includes(evidenceId)) return
  commit({ ...state, audioSeen: [...state.audioSeen, evidenceId] })
}

export function setChatProgress(chatId: string, progress: ChatProgress) {
  commit({ ...state, chatProgress: { ...state.chatProgress, [chatId]: progress } })
}

export function appendChatMessages(chatId: string, messages: ChatMessage[], step: number, done: boolean) {
  const prev = state.chatProgress[chatId] ?? { step: 0, done: false, messages: [] }
  setChatProgress(chatId, { step, done, messages: [...prev.messages, ...messages] })
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

/**
 * Migra saves antigos (v1) para o esquema atual sem alterar estados narrativos:
 *  - preenche campos novos (documentos, descobertas, conversas, ligações);
 *  - deriva `documentsOwned` a partir das evidências já obtidas;
 *  - converte o antigo desbloqueio de "apps ocultos" (removido) em acesso forense já concluído.
 */
export function migrateState(raw: InvestigationState): InvestigationState {
  const base = createInitialState()
  const owned = new Set<string>(raw.documentsOwned ?? ['doc-bo-inicial'])
  for (const doc of seedDocuments) {
    for (const a of doc.onOpen ?? []) {
      if (a.type === 'addEvidence' && raw.evidenceOwned?.includes(a.id)) owned.add(doc.id)
    }
  }
  if (raw.flags?.block01_bo_registered) {
    for (const id of ['doc-central-chamada', 'doc-entrada-apartamento', 'doc-apreensao-celular', 'doc-extracao-inicial']) {
      owned.add(id)
    }
  }
  if (raw.flags?.block02_vertice_archive) owned.add('doc-vertice-escala')
  const merged: InvestigationState = {
    ...base,
    ...raw,
    version: STATE_VERSION,
    documentsOwned: [...owned],
    discoveries: raw.discoveries ?? [],
    audioSeen: raw.audioSeen ?? raw.evidenceOwned?.filter((id) => raw.evidence?.[id]?.type === 'audio') ?? [],
    chatProgress: raw.chatProgress ?? {},
    callsDone: raw.callsDone ?? [],
    contacts: { ...base.contacts, ...(raw.contacts ?? {}) },
    locations: { ...base.locations, ...(raw.locations ?? {}) },
    toastQueue: [],
  }
  // Fluxo antigo de Bloco 4: o diário já aberto vira acesso concluído; o resto segue o novo fluxo.
  if (raw.phones?.mariana?.diaryUnlocked || raw.flags?.block04_forensics_done || raw.flags?.block04_diary_opened) {
    merged.flags = {
      ...merged.flags,
      block04_forensics_access: true,
      block04_forensics_done: true,
      block04_diary_icon_revealed: true,
    }
    const apps = merged.phones.mariana.installedAppIds
    if (!apps.includes('hidden-diary')) {
      merged.phones = {
        ...merged.phones,
        mariana: {
          ...merged.phones.mariana,
          diaryUnlocked: true,
          installedAppIds: [...apps, 'hidden-diary'],
        },
      }
    } else if (!merged.phones.mariana.diaryUnlocked) {
      merged.phones = {
        ...merged.phones,
        mariana: { ...merged.phones.mariana, diaryUnlocked: true },
      }
    }
  } else if (raw.flags?.block04_forensics_access) {
    // Perícia já feita, PIN ainda pendente — revelar ícone no aparelho.
    merged.flags = { ...merged.flags, block04_diary_icon_revealed: true }
    const apps = merged.phones.mariana.installedAppIds
    if (!apps.includes('hidden-diary')) {
      merged.phones = {
        ...merged.phones,
        mariana: {
          ...merged.phones.mariana,
          installedAppIds: [...apps, 'hidden-diary'],
        },
      }
    }
  }
  return merged
}

export function loadGame(): boolean {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw) as InvestigationState
    const migrated = parsed.version >= STATE_VERSION ? { ...createInitialState(), ...parsed } : migrateState(parsed)
    const repaired = repairInvestigationState(migrated)
    state = runStoryEngine(repaired)
    saveGame(state)
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

/** Aplica ações de checkpoint sem poluir a fila de descobertas. */
export function devApply(actions: StoryActionRef[]) {
  const before = state.discoveries
  state = { ...runStoryEngine(applyStoryActions(state, actions)), discoveries: before }
  saveGame(state)
  emit()
}

/** Test hook */
export function __setStateForTests(next: InvestigationState) {
  state = next
  emit()
}
