import type { Location } from '../../game/types'

export const seedLocations: Location[] = [
  {
    id: 'delegacia',
    name: 'Delegacia',
    description: 'Sala do delegado Augusto. Ponto de partida da investigação.',
    status: 'visited',
    relatedPersonIds: ['augusto'],
    relatedEvidenceIds: [],
    mapX: 0.55,
    mapY: 0.43,
  },
  {
    id: 'hospital',
    name: 'Hospital Municipal',
    description: 'Posto de enfermagem onde Mariana trabalhava.',
    status: 'unknown',
    relatedPersonIds: ['julia', 'camila', 'mariana'],
    relatedEvidenceIds: [],
    sceneId: 'hospital-corridor',
    mapX: 0.38,
    mapY: 0.52,
  },
  {
    id: 'vertice',
    name: 'Boate Vértice',
    description: '—',
    status: 'unknown',
    relatedPersonIds: [],
    relatedEvidenceIds: [],
    mapX: 0.74,
    mapY: 0.62,
  },
]
