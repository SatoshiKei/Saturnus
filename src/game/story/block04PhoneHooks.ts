import { dispatchActions, getInvestigationState } from '../state/investigationStore'

/** Jogador viu o MSISDN no histórico ou no perfil do contato (aparelho de Mariana). */
export function onUnknownCallerNumberSeen() {
  const s = getInvestigationState()
  if (s.flags.block04_unknown_number_seen) return
  if (!s.flags.block04_chronology_search_unlocked) return
  dispatchActions([{ type: 'setFlag', id: 'block04_unknown_number_seen', value: true }])
}
