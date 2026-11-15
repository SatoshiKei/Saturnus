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
    .sort((a, b) => {
      const ua = a.unreadCount ?? 0
      const ub = b.unreadCount ?? 0
      if (ua !== ub) return ub - ua
      if (a.pinned && !b.pinned) return -1
      if (b.pinned && !a.pinned) return 1
      return 0
    })
}
