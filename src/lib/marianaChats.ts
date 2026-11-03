import { mockChats } from '../data/mockChats'
import type { InvestigationState } from '../game/types'

/** Chats visible on Mariana's phone — gated by investigation unlocks. */
export function marianaVisibleChats(state: InvestigationState) {
  const unlocked = new Set(state.phones.mariana.unlockedChatIds)
  return mockChats.filter((c) => !c.archived && unlocked.has(c.id))
}

export function augustoVisibleChats(_state: InvestigationState) {
  return mockChats.filter((c) => c.contactId === 'camila' && !c.archived)
}
