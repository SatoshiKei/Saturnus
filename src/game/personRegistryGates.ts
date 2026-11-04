import type { InvestigationState } from './types'

/**
 * Flags que precisam estar ativas antes de uma pessoa aparecer no caderno / terminal (Pessoas).
 * (A visibilidade no caderno NÃO libera conversa: chegar até a pessoa depende de telefone,
 * endereço ou instituição descobertos por documentos.)
 */
export const personRegistryFlag: Record<string, string> = {
  elisa: 'block02_elisa_search_unlocked',
  andre: 'block02_elisa_search_unlocked',
  nico: 'block02_vertice_archive',
  lucas: 'block02_paula_chat_done',
  iara: 'block02_vertice_iara',
  sandro: 'block02_vertice_sandro',
  caio: 'block02_vertice_caio',
  livia: 'block03_maralto_researched',
  morsa: 'block03_saturnalia_done',
  samuel: 'block03_saturnalia_done',
  jana: 'block05_jana_search_unlocked',
  geraldo: 'block06_geraldo_search_unlocked',
  valter: 'block06_jana_followup_done',
  miro: 'block06_valter_trail_done',
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
      inv.people.lucas?.status === 'contactable' ||
      inv.people.lucas?.status === 'interviewed'
    )
  }
  // Lívia pode já ter sido identificada em saves antigos.
  if (personId === 'livia') return inv.people.livia?.status !== 'mentioned'
  return false
}

/** Corrige estado quando a evidência existe mas flags de Bloco 2 não foram gravadas. */
export function repairInvestigationState(state: InvestigationState): InvestigationState {
  if (!state.evidenceOwned.includes('paula_leads_lucas')) return state
  if (state.flags.block02_paula_chat_done) return state

  const lucas = state.people.lucas
  return {
    ...state,
    flags: { ...state.flags, block02_paula_chat_done: true },
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
