import type { InvestigationState } from '../../game/types'
import { isPersonVisibleInRegistry } from '../../game/personRegistryGates'

/** Ordem aproximada dos contatos que Mariana procurou — só quem já está no caderno. */
const CONTACT_ORDER: { personId: string; label: string }[] = [
  { personId: 'rafael', label: 'Rafael (hospital)' },
  { personId: 'nico', label: 'Nico / Vértice' },
  { personId: 'paula', label: 'Paula' },
  { personId: 'lucas', label: 'Lucas Moreira' },
  { personId: 'livia', label: 'Lívia Serrano' },
  { personId: 'samuel', label: 'Samuel Teixeira' },
  { personId: 'jana', label: 'Jana Ribeiro' },
  { personId: 'andre', label: 'André (unidade)' },
]

export function visibleMarianaContactChronology(inv: InvestigationState) {
  return CONTACT_ORDER.filter((c) => isPersonVisibleInRegistry(c.personId, inv))
}
