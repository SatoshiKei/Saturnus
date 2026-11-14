import { seedDocuments } from '../../data/game/seedDocuments'
import { HEX_PIN } from '../../data/block04/hexagonPuzzle'
import type { ChatMessage } from '../../types/messaging'
import type {
  ChatProgress,
  DevPuzzleCompletionRecord,
  ForensicDerivedArtifact,
  InvestigationState,
  StoryActionRef,
  PersonStatus,
} from '../types'
import { repairInvestigationState } from '../personRegistryGates'
import { createInitialState, SAVE_KEY, STATE_VERSION } from './initialState'
import {
  buildStateFromActions,
  createGameSaveSnapshot,
  parseSavePayload,
  stripEphemeralUi,
  type GameSaveSnapshot,
} from './gameSave'
import { applyStoryActions } from '../story/actions'
import { runStoryEngine } from '../story/engine'
import { resetLinkBoardSession } from '../../app/uiStore'
import { maxPersonStatus } from './personStatusOrder'
import { clearAutosaveStorage, writeAutosaveSnapshot } from './saveSlots'

type Listener = () => void

let state: InvestigationState = createInitialState()
const listeners = new Set<Listener>()
/** >0 enquanto handlers reais rodam sobre um estado isolado (replay DEV / testes). */
let sandboxDepth = 0

function emit() {
  listeners.forEach((l) => l())
}

function commit(next: InvestigationState, persist = true) {
  state = runStoryEngine(next)
  if (sandboxDepth > 0) return
  if (persist) saveGame(state)
  emit()
}

/**
 * Executa handlers reais (que leem/escrevem o store global) sobre `initial`, sem persistir,
 * sem notificar a UI e sem tocar no estado vivo. Devolve o estado resultante.
 */
export function runInStoreSandbox(initial: InvestigationState, fn: () => void): InvestigationState {
  const saved = state
  state = initial
  sandboxDepth++
  try {
    fn()
    return state
  } finally {
    sandboxDepth--
    state = saved
  }
}

/** DEV: substitui o estado vivo mantendo discoveries (cartões de conquista etc.). */
export function commitDevState(next: InvestigationState) {
  commit(next)
}

export function markDevPuzzleCompletion(record: DevPuzzleCompletionRecord) {
  commit({
    ...state,
    devPuzzleCompletions: { ...(state.devPuzzleCompletions ?? {}), [record.puzzleId]: record },
  })
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

/** Persiste edits/rebuild de Structure por evidência. */
export function markForensicContainerState(
  evidenceId: string,
  next: { rebuilt: boolean; sequences: Record<string, number> },
) {
  commit({
    ...state,
    forensicContainerState: {
      ...(state.forensicContainerState ?? {}),
      [evidenceId]: {
        rebuilt: next.rebuilt,
        sequences: { ...next.sequences },
      },
    },
  })
}

/** Persiste artifact derivado da bancada (ex.: stream B Cassini-Huygens). */
export function markForensicDerivedArtifact(artifact: ForensicDerivedArtifact) {
  commit({
    ...state,
    forensicDerivedArtifacts: {
      ...(state.forensicDerivedArtifacts ?? {}),
      [artifact.id]: artifact,
    },
  })
}

/** Registra um segmento de fala recuperado na bancada. Persistente; não apaga no Reset processing. */
export function markForensicSpeechRecovered(
  evidenceId: string,
  entry: { segmentId: string; text: string; startSec: number; unlockedAt?: number },
) {
  const bag = { ...(state.forensicRecoveredSpeech ?? {}) }
  const list = [...(bag[evidenceId] ?? [])]
  if (list.some((e) => e.segmentId === entry.segmentId)) return
  list.push({
    segmentId: entry.segmentId,
    text: entry.text,
    startSec: entry.startSec,
    unlockedAt: entry.unlockedAt ?? Date.now(),
  })
  list.sort((a, b) => a.startSec - b.startSec)
  commit({
    ...state,
    forensicRecoveredSpeech: { ...bag, [evidenceId]: list },
  })
}

/** DEV: limpa fragments/completion da evidência forense. */
export function resetForensicSpeechProgress(evidenceId: string) {
  const bag = { ...(state.forensicRecoveredSpeech ?? {}) }
  delete bag[evidenceId]
  const containers = { ...(state.forensicContainerState ?? {}) }
  delete containers[evidenceId]
  const flags = { ...state.flags }
  let evidenceOwned = state.evidenceOwned
  const achievementUnlocks = { ...(state.achievementUnlocks ?? {}) }
  if (evidenceId === 'emergency_call_raw') {
    flags.block01_emergency_provisional = false
    evidenceOwned = evidenceOwned.filter((id) => id !== 'emergency_call_restored')
    delete achievementUnlocks['ach-cassini-division']
  }
  if (evidenceId === 'rafael_voice_to_augusto' || evidenceId === 'rafael_audio_reply') {
    flags.block02_rafael_forward_provisional = false
    evidenceOwned = evidenceOwned.filter((id) => id !== 'rafael_recording_vertice_tag')
    delete achievementUnlocks['ach-iapetus']
    delete containers['rafael_voice_to_augusto']
    delete containers['rafael_audio_reply']
    delete bag['rafael_voice_to_augusto']
    delete bag['rafael_audio_reply']
  }
  let forensicDerivedArtifacts = { ...(state.forensicDerivedArtifacts ?? {}) }
  if (evidenceId === 'henrique_rtp_capture') {
    flags.block07_cassini_done = false
    evidenceOwned = evidenceOwned.filter((id) => id !== 'stream_b_reconstructed')
    delete achievementUnlocks['ach-cassini-huygens']
    delete bag['henrique_rtp_capture']
    delete forensicDerivedArtifacts['cassini-stream-b']
  }
  if (evidenceId === 'rec_vtx_old_01') {
    flags.block02_rings_provisional = false
    evidenceOwned = evidenceOwned.filter(
      (id) => id !== 'rec_vtx_set_nico_match' && id !== 'nico_dj_identified',
    )
    delete achievementUnlocks['ach-rings']
    delete bag['rec_vtx_old_01']
  }
  if (evidenceId === 'nico_recording_booth') {
    flags.block03_janus_done = false
    evidenceOwned = evidenceOwned.filter(
      (id) =>
        id !== 'vertice_clocks_unsynced' &&
        id !== 'vertice_timeline_inconsistent' &&
        id !== 'sandra_first_sighting_not_elisa',
    )
    delete achievementUnlocks['ach-janus-epimetheus']
    delete bag['nico_recording_booth']
  }
  if (evidenceId === 'livia_radio_archive_raw') {
    flags.block03_saturnalia_done = false
    flags.block03_complete = false
    evidenceOwned = evidenceOwned.filter(
      (id) => id !== 'protest_masked_core' && id !== 'morsa_unidentified',
    )
    delete achievementUnlocks['ach-saturnalia']
    delete bag['livia_radio_archive_raw']
  }
  commit({
    ...state,
    forensicRecoveredSpeech: bag,
    forensicContainerState: containers,
    forensicDerivedArtifacts,
    flags,
    evidenceOwned,
    achievementUnlocks,
  })
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
        { type: 'setFlag', id: 'block04_hexagon_done', value: true },
        { type: 'setFlag', id: 'block04_hex_spectrograms_inspected', value: true },
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

export { stripEphemeralUi }

export function saveGame(s = state) {
  try {
    writeAutosaveSnapshot(createGameSaveSnapshot(s, null))
  } catch {
    /* ignore quota */
  }
}

/** Restaura snapshot completo (save manual, autosave ou checkpoint DEV). */
export function restoreGameSnapshot(snapshot: GameSaveSnapshot, opts?: { persist?: boolean }) {
  const migrated =
    snapshot.investigation.version >= STATE_VERSION
      ? { ...createInitialState(), ...snapshot.investigation, version: STATE_VERSION }
      : migrateState(snapshot.investigation)
  const repaired = repairInvestigationState(migrated)
  state = stripEphemeralUi(runStoryEngine(repaired))
  if (opts?.persist !== false) saveGame(state)
  emit()
}

/** @deprecated Preferir `loadDevCheckpointState` com estado do manifesto canônico. */
export function loadDevCheckpoint(actions: StoryActionRef[]) {
  loadDevCheckpointState(buildStateFromActions(actions))
}

/**
 * Carrega um estado DEV já construído do zero pelo mesmo pipeline do Load normal
 * (snapshot → migração → repair → engine). O board é reconstruído a partir do estado.
 */
export function loadDevCheckpointState(built: InvestigationState) {
  resetLinkBoardSession()
  restoreGameSnapshot(createGameSaveSnapshot(built, null), { persist: true })
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

  // Evidence ID renames (semantic audit fix round).
  const EVIDENCE_ID_ALIASES: Record<string, string> = {
    rafael_forward_from_mariana: 'rafael_voice_to_augusto',
    police_clock_drift_logs: 'rui_police_approach_records',
  }
  const remapId = (id: string) => EVIDENCE_ID_ALIASES[id] ?? id
  const remappedOwned = (raw.evidenceOwned ?? []).map(remapId)
  const remappedBag = { ...(raw.evidence ?? {}) }
  for (const [oldId, newId] of Object.entries(EVIDENCE_ID_ALIASES)) {
    if (remappedBag[oldId] && !remappedBag[newId]) {
      remappedBag[newId] = { ...remappedBag[oldId], id: newId }
    }
    delete remappedBag[oldId]
  }
  const remappedSpeech = { ...(raw.forensicRecoveredSpeech ?? {}) }
  const remappedContainers = { ...(raw.forensicContainerState ?? {}) }
  for (const [oldId, newId] of Object.entries(EVIDENCE_ID_ALIASES)) {
    if (remappedSpeech[oldId] && !remappedSpeech[newId]) remappedSpeech[newId] = remappedSpeech[oldId]
    if (remappedContainers[oldId] && !remappedContainers[newId])
      remappedContainers[newId] = remappedContainers[oldId]
    delete remappedSpeech[oldId]
    delete remappedContainers[oldId]
  }

  const merged: InvestigationState = {
    ...base,
    ...raw,
    version: STATE_VERSION,
    evidenceOwned: [...new Set(remappedOwned)],
    evidence: remappedBag,
    documentsOwned: [...owned],
    discoveries: [],
    audioSeen: (raw.audioSeen ?? remappedOwned.filter((id) => remappedBag?.[id]?.type === 'audio')).map(
      remapId,
    ),
    chatProgress: raw.chatProgress ?? {},
    callsDone: raw.callsDone ?? [],
    playTimeMs: raw.playTimeMs ?? 0,
    achievementUnlocks: raw.achievementUnlocks ?? {},
    forensicRecoveredSpeech: remappedSpeech,
    forensicContainerState: remappedContainers,
    forensicDerivedArtifacts: raw.forensicDerivedArtifacts ?? {},
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
    merged.flags = { ...merged.flags, block04_diary_icon_revealed: true, diary_package_known: true }
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

  return repairInvestigationState(merged)
}

export function loadGame(): boolean {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return false
    const snap = parseSavePayload(JSON.parse(raw))
    if (!snap) return false
    restoreGameSnapshot(snap)
    return true
  } catch {
    return false
  }
}

export function addPlayTime(ms: number) {
  if (ms <= 0) return
  state = { ...state, playTimeMs: (state.playTimeMs ?? 0) + ms }
  saveGame(state)
}

export function applyLoadedState(next: InvestigationState | GameSaveSnapshot) {
  const snap =
    'investigation' in next && next.investigation
      ? (next as GameSaveSnapshot)
      : createGameSaveSnapshot(next as InvestigationState, null)
  restoreGameSnapshot(snap)
}

export function resetGame() {
  state = createInitialState()
  clearAutosaveStorage()
  resetLinkBoardSession()
  emit()
}

/**
 * @deprecated Preferir `loadDevCheckpoint` com actions cumulativas.
 * Mantido para compatibilidade pontual — aplica delta sobre o estado atual.
 */
export function devApply(actions: StoryActionRef[]) {
  state = stripEphemeralUi(runStoryEngine(applyStoryActions(state, actions)))
  saveGame(state)
  emit()
}

/** Test hook */
export function __setStateForTests(next: InvestigationState) {
  state = repairInvestigationState(next)
  emit()
}
