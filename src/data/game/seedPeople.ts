import type { Person } from '../../game/types'

export const seedPeople: Person[] = [
  {
    id: 'mariana',
    name: 'Mariana Silva',
    status: 'identified',
    occupation: 'Estudante',
    notes: ['Desaparecida — caso em aberto'],
    relatedEvidenceIds: [],
    relatedPersonIds: ['julia', 'camila'],
  },
  {
    id: 'augusto',
    name: 'Delegado Augusto',
    status: 'identified',
    occupation: 'Investigador',
    relatedEvidenceIds: [],
    relatedPersonIds: [],
  },
  {
    id: 'julia',
    name: 'Júlia',
    status: 'mentioned',
    relatedEvidenceIds: [],
    relatedPersonIds: ['mariana'],
  },
  {
    id: 'camila',
    name: 'Camila',
    status: 'mentioned',
    relatedEvidenceIds: [],
    relatedPersonIds: ['mariana'],
  },
  {
    id: 'rafael',
    name: 'Rafael',
    status: 'mentioned',
    relatedEvidenceIds: [],
    relatedPersonIds: [],
  },
  {
    id: 'nico',
    name: 'Nico',
    status: 'mentioned',
    relatedEvidenceIds: [],
    relatedPersonIds: [],
  },
]
