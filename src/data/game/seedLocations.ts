import type { Location } from '../../game/types'

/**
 * `mapX/mapY` posicionam o marcador sobre o mapa (0–1).
 * Locais com status `unknown` não aparecem na interface.
 */
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
    id: 'universidade',
    name: 'Universidade',
    description: 'Campus frequentado por Mariana.',
    status: 'known',
    relatedPersonIds: ['mariana'],
    relatedEvidenceIds: [],
    sceneId: 'university-03',
    mapX: 0.22,
    mapY: 0.24,
  },
  {
    id: 'vertice',
    name: 'Boate Vértice',
    description: 'Casa noturna — referência futura.',
    status: 'unknown',
    relatedPersonIds: ['nico'],
    relatedEvidenceIds: [],
    mapX: 0.74,
    mapY: 0.62,
  },
]
