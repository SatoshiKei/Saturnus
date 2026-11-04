import type { InvestigationState } from './types'

/** Flags that must be set before a person appears in Caderno / terminal (Pessoas). */
export const personRegistryFlag: Record<string, string> = {
  elisa: 'block02_elisa_search_unlocked',
  andre: 'block02_elisa_search_unlocked',
  nico: 'block02_vertice_archive',
  lucas: 'block02_paula_chat_done',
  iara: 'block02_vertice_iara',
  sandro: 'block02_vertice_sandro',
  caio: 'block02_vertice_caio',
  livia: 'block03_livia_search_unlocked',
  morsa: 'block03_saturnalia_done',
  samuel: 'block03_saturnalia_done',
}

export function isPersonVisibleInRegistry(personId: string, inv: InvestigationState): boolean {
  if (personId === 'augusto') return false
  const need = personRegistryFlag[personId]
  if (!need) return true
  if (inv.flags[need]) return true
  // Lucas: evidência e flag são aplicados juntos; reparar saves antigos ou desync.
  if (personId === 'lucas') {
    return (
      inv.evidenceOwned.includes('paula_leads_lucas') ||
      Boolean(inv.flags.block02_lucas_available) ||
      inv.people.lucas?.status === 'contactable' ||
      inv.people.lucas?.status === 'interviewed'
    )
  }
  return false
}

export function canInterviewLucas(inv: InvestigationState): boolean {
  return (
    Boolean(inv.flags.block02_lucas_available) ||
    inv.evidenceOwned.includes('paula_leads_lucas') ||
    inv.people.lucas?.status === 'contactable'
  )
}

export function canInterviewNico(inv: InvestigationState): boolean {
  return (
    Boolean(inv.flags.block03_nico_located) ||
    inv.people.nico?.status === 'contactable' ||
    inv.people.nico?.status === 'located'
  )
}

export function canInterviewLivia(inv: InvestigationState): boolean {
  return (
    Boolean(inv.flags.block03_livia_located) ||
    inv.people.livia?.status === 'contactable' ||
    inv.people.livia?.status === 'located'
  )
}

export function canInterviewSamuel(inv: InvestigationState): boolean {
  return (
    Boolean(inv.flags.block04_samuel_located) ||
    inv.people.samuel?.status === 'contactable' ||
    inv.people.samuel?.status === 'located'
  )
}

export function canInterviewAndre(inv: InvestigationState): boolean {
  return (
    Boolean(inv.flags.block04_andre_visit_found) ||
    inv.people.andre?.status === 'contactable' ||
    inv.locations.presidio?.status === 'visitAvailable' ||
    inv.locations.presidio?.status === 'visited'
  )
}

/** Corrige estado quando a evidência existe mas flags de Bloco 2 não foram gravadas. */
export function repairInvestigationState(state: InvestigationState): InvestigationState {
  if (!state.evidenceOwned.includes('paula_leads_lucas')) return state
  if (state.flags.block02_paula_chat_done && state.flags.block02_lucas_available) return state

  const lucas = state.people.lucas
  return {
    ...state,
    flags: {
      ...state.flags,
      block02_paula_chat_done: true,
      block02_lucas_available: true,
    },
    people: lucas
      ? {
          ...state.people,
          lucas: {
            ...lucas,
            status: lucas.status === 'mentioned' ? 'contactable' : lucas.status,
          },
        }
      : state.people,
  }
}
