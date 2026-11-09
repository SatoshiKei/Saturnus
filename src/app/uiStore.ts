import { useSyncExternalStore } from 'react'

export type GameShell = 'title' | 'playing' | 'paused'

/** Estado puramente de interface (não faz parte do save da investigação). */
interface UiState {
  menuOpen: boolean
  /** Cena narrativa em tela cheia (ligação das seis gravações etc.): avisos de descoberta esperam. */
  fullscreenScene: boolean
  shell: GameShell
}

let state: UiState = { menuOpen: true, fullscreenScene: false, shell: 'title' }
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

export function setMenuOpen(menuOpen: boolean) {
  if (state.menuOpen === menuOpen) return
  state = { ...state, menuOpen }
  emit()
}

export function setFullscreenScene(fullscreenScene: boolean) {
  if (state.fullscreenScene === fullscreenScene) return
  state = { ...state, fullscreenScene }
  emit()
}

export function setGameShell(shell: GameShell) {
  if (state.shell === shell) return
  state = { ...state, shell, menuOpen: shell !== 'playing' }
  emit()
}

export function enterGameplay() {
  setGameShell('playing')
}

export function openTitleMenu() {
  setGameShell('title')
}

export function openPauseMenu() {
  if (state.shell !== 'playing') return
  setGameShell('paused')
}

export function resumeGameplay() {
  setGameShell('playing')
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useUiState(): UiState {
  return useSyncExternalStore(subscribe, () => state, () => state)
}

const HINT_KEY = 'saturnus-ui-hints-v1'

export function hintsAlreadySeen(): boolean {
  try {
    return localStorage.getItem(HINT_KEY) === '1'
  } catch {
    return true
  }
}

export function markHintsSeen() {
  try {
    localStorage.setItem(HINT_KEY, '1')
  } catch {
    /* ignore */
  }
}

/** Para "Novo jogo" / reset de desenvolvimento. */
export function resetHints() {
  try {
    localStorage.removeItem(HINT_KEY)
  } catch {
    /* ignore */
  }
}

/** Pedido de foco do caderno (ex.: "Ver no caderno" no cartão de evidência). Consumido uma vez. */
let notebookFocus: { tab: string; id?: string } | null = null

export function focusNotebook(tab: string, id?: string) {
  notebookFocus = { tab, id }
}

export function takeNotebookFocus() {
  const f = notebookFocus
  notebookFocus = null
  return f
}
