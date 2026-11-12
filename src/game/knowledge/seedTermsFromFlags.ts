import type { InvestigationState } from '../types'

/** Flags legadas / de progresso que implicam termos já conhecidos. */
export const FLAG_KNOWN_TERM_SEEDS: { flag: string; terms: string[] }[] = [
  { flag: 'block02_elisa_search_unlocked', terms: ['elisa', 'andre'] },
  { flag: 'block02_paula_chat_done', terms: ['lucas'] },
  { flag: 'block02_vertice_archive', terms: ['nico'] },
  { flag: 'block03_nico_search_unlocked', terms: ['nico'] },
  { flag: 'block03_maralto_search_unlocked', terms: ['maralto'] },
  { flag: 'block03_maralto_recording_found', terms: ['maralto'] },
  { flag: 'block03_saturnalia_done', terms: ['morsa', 'protesto'] },
  { flag: 'block04_samuel_search_unlocked', terms: ['samuel'] },
  { flag: 'block04_andre_records_unlocked', terms: ['andre'] },
  { flag: 'block05_jana_search_unlocked', terms: ['jana'] },
  { flag: 'calendar_jana_examined', terms: ['jana'] },
  { flag: 'block06_geraldo_search_unlocked', terms: ['geraldo'] },
  { flag: 'calendar_geraldo_examined', terms: ['geraldo'] },
  { flag: 'geraldo_vertice_known', terms: ['geraldo'] },
  { flag: 'block07_sandra_search_unlocked', terms: ['sandra'] },
  { flag: 'block07_forum_search_unlocked', terms: ['hvalenca'] },
  { flag: 'hvalenca_note_known', terms: ['hvalenca'] },
  { flag: 'block07_aster_search_unlocked', terms: ['aster'] },
  { flag: 'marcelo_address_found', terms: ['marcelo'] },
]

/** Garante searchTermsDiscovered a partir de flags (saves, checkpoints, testes). */
export function withKnownTermsFromFlags(state: InvestigationState): InvestigationState {
  const discovered = new Set((state.searchTermsDiscovered ?? []).map((t) => t.toLowerCase()))
  let changed = false
  const nextTerms = [...(state.searchTermsDiscovered ?? [])]
  for (const row of FLAG_KNOWN_TERM_SEEDS) {
    if (!state.flags[row.flag]) continue
    for (const term of row.terms) {
      if (discovered.has(term.toLowerCase())) continue
      discovered.add(term.toLowerCase())
      nextTerms.push(term)
      changed = true
    }
  }
  if (!changed) return state
  return { ...state, searchTermsDiscovered: nextTerms }
}
