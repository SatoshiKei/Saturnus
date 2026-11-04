import { getChatById, mockChats } from '../data/mockChats'
import type { InvestigationState } from '../game/types'

/** Chats visible on Mariana's phone — gated by investigation unlocks. */
export function marianaVisibleChats(state: InvestigationState) {
  const unlocked = new Set(state.phones.mariana.unlockedChatIds)
  return mockChats.filter((c) => !c.archived && unlocked.has(c.id))
}

export function augustoVisibleChats(state: InvestigationState) {
  const unlocked = new Set(state.phones.augusto.unlockedChatIds)
  return mockChats
    .filter((c) => !c.archived && unlocked.has(c.id))
    .map((c) => getChatById(c.id, state) ?? c)
}
