import type { LocationSceneId } from '../app/GameHubContext'

export type SceneId = NonNullable<LocationSceneId>

export interface SceneIntro {
  /** Linhas digitadas, estilo terminal (data / hora / lugar). */
  lines: string[]
  /** Ambiência curta (id de SFX) tocada durante a abertura. */
  ambience?: 'scene-in' | 'ambience-hush'
}

/**
 * Cabeçalhos de abertura das cenas de visita. Só situam o jogador (data, hora, lugar) —
 * nenhuma informação de investigação entra aqui.
 */
export const sceneIntros: Record<SceneId, SceneIntro> = {
  hospital: {
    lines: ['03 NOV 2026', '16:12', 'HOSPITAL MUNICIPAL — POSTO DE ENFERMAGEM'],
    ambience: 'ambience-hush',
  },
  vertice: {
    lines: ['04 NOV 2026', '09:40', 'BOATE VÉRTICE — SALÃO PRINCIPAL'],
    ambience: 'ambience-hush',
  },
  lucas: {
    lines: ['04 NOV 2026', '11:20', 'UNIVERSIDADE — CAMPUS CENTRAL, BLOCO B'],
    ambience: 'scene-in',
  },
  livia: {
    lines: ['04 NOV 2026', '14:05', 'RÁDIO COSTEIRA FM — REDAÇÃO'],
    ambience: 'scene-in',
  },
  nico: {
    lines: ['04 NOV 2026', '16:30', 'TITÃ CLUB — ANTES DA ABERTURA'],
    ambience: 'ambience-hush',
  },
  samuel: {
    lines: ['04 NOV 2026', '18:50', 'RUA DAS ACÁCIAS, 118 — AP. 21'],
    ambience: 'scene-in',
  },
  andre: {
    lines: ['04 NOV 2026', '21:37', 'PENITENCIÁRIA ESTADUAL — SALA DE VISITAS'],
    ambience: 'ambience-hush',
  },
}

/** Fundos (processados) usados em cada cena — auditoria de backgrounds. */
export const sceneBackgrounds: Record<SceneId, string> = {
  hospital: '/assets/backgrounds/processed/hospital/hospital-02-corridor-chairs.jpg',
  vertice: '/assets/backgrounds/processed/nightclub/nightclub-01-lights-haze.jpg',
  lucas: '/assets/backgrounds/processed/university/university-03-classroom-empty.jpg',
  livia: '/assets/backgrounds/processed/radio/radio-01-newsroom.jpg',
  nico: '/assets/backgrounds/processed/nightclub/nightclub-01-lights-haze.jpg',
  samuel: '/assets/backgrounds/processed/apartment/apartment-01-living-room.jpg',
  andre: '/assets/backgrounds/processed/prison/prison-01-visit-room.jpg',
}
