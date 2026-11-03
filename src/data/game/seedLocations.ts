import type { Location } from '../../game/types'

export const seedLocations: Location[] = [
  {
    id: 'delegacia',
    name: 'Sala do delegado',
    description: 'Hub da investigação',
    status: 'visited',
    relatedPersonIds: ['augusto'],
    relatedEvidenceIds: [],
  },
  {
    id: 'universidade',
    name: 'Universidade',
    description: 'Campus frequentado por Mariana',
    status: 'known',
    relatedPersonIds: ['mariana'],
    relatedEvidenceIds: [],
    sceneId: 'university-03',
  },
  {
    id: 'vertice',
    name: 'Boate Vértice',
    description: 'Casa noturna — referência futura',
    status: 'unknown',
    relatedPersonIds: ['nico'],
    relatedEvidenceIds: [],
  },
]
