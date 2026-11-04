import { useSyncExternalStore } from 'react'

/** Estado puramente de interface (não faz parte do save da investigação). */
interface UiState {
  menuOpen: boolean
  /** Cena narrativa em tela cheia (ligação das seis gravações etc.): avisos de descoberta esperam. */
  fullscreenScene: boolean
}

let state: UiState = { menuOpen: false, fullscreenScene: false }
const listeners = new Set<() => void>()

export function setMenuOpen(menuOpen: boolean) {
  if (state.menuOpen === menuOpen) return
  state = { ...state, menuOpen }
  listeners.forEach((l) => l())
}

export function setFullscreenScene(fullscreenScene: boolean) {
  if (state.fullscreenScene === fullscreenScene) return
  state = { ...state, fullscreenScene }
  listeners.forEach((l) => l())
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
