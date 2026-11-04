import { seedContacts } from '../data/game/seedContacts'
import { setFlag } from '../game/state/investigationStore'
import type { InvestigationState } from '../game/types'

const initiallyUnlocked = new Set(seedContacts.filter((c) => c.unlocked).map((c) => c.id))

/** Contatos descobertos que o jogador ainda não viu na agenda do celular de Augusto. */
export function newContactIds(inv: InvestigationState): string[] {
  return Object.values(inv.contacts)
    .filter((c) => c.unlocked && !initiallyUnlocked.has(c.id) && !inv.flags[`contact_seen_${c.id}`])
    .map((c) => c.id)
}

export function markContactSeen(id: string) {
  setFlag(`contact_seen_${id}`, true)
}
