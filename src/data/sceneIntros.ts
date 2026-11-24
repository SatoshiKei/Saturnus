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
    lines: ['03 NOV 2026', '16:12', 'HOSPITAL MUNICIPAL. POSTO DE ENFERMAGEM'],
    ambience: 'ambience-hush',
  },
  vertice: {
    lines: ['04 NOV 2026', '09:40', 'BOATE VÉRTICE. SALÃO PRINCIPAL'],
    ambience: 'ambience-hush',
  },
  lucas: {
    lines: ['04 NOV 2026', '11:20', 'UNIVERSIDADE. CAMPUS CENTRAL, BLOCO B'],
    ambience: 'scene-in',
  },
  livia: {
    lines: ['04 NOV 2026', '14:05', 'RÁDIO COSTEIRA FM. REDAÇÃO'],
    ambience: 'scene-in',
  },
  nico: {
    lines: ['04 NOV 2026', '16:30', 'TITÃ CLUB. ANTES DA ABERTURA'],
    ambience: 'ambience-hush',
  },
  samuel: {
    lines: ['04 NOV 2026', '18:50', 'RUA DAS ACÁCIAS, 118. AP. 21'],
    ambience: 'scene-in',
  },
  andre: {
    lines: ['04 NOV 2026', '21:37', 'PENITENCIÁRIA ESTADUAL. SALA DE VISITAS'],
    ambience: 'ambience-hush',
  },
  jana: {
    lines: ['05 NOV 2026', '10:15', 'RUA DO SOL, 47'],
    ambience: 'scene-in',
  },
  geraldo: {
    lines: ['05 NOV 2026', '15:40', 'TRAVESSA DAS PALMEIRAS, 9'],
    ambience: 'scene-in',
  },
  operation: {
    lines: ['06 NOV 2026', '03:12', 'GALPÃO 17. PÁTIO NORTE'],
    ambience: 'ambience-hush',
  },
  miro: {
    lines: ['06 NOV 2026', '11:05', 'DETENÇÃO. SALA DE ENTREVISTA'],
    ambience: 'ambience-hush',
  },
  sandra: {
    lines: ['06 NOV 2026', '16:20', 'RUA DAS HORTÊNSIAS, 212'],
    ambience: 'scene-in',
  },
  cecilia: {
    lines: ['07 NOV 2026', '10:45', 'ALAMEDA NOVA, 88. AP. 14'],
    ambience: 'scene-in',
  },
  mauro: {
    lines: ['07 NOV 2026', '15:10', 'RUA DO CEDRO, 55'],
    ambience: 'scene-in',
  },
  denis: {
    lines: ['07 NOV 2026', '16:40', 'OFICINA DÊNIS. PÁTIO'],
    ambience: 'ambience-hush',
  },
  bia: {
    lines: ['07 NOV 2026', '18:05', 'TRAVESSA LESTE, 19'],
    ambience: 'scene-in',
  },
  rui: {
    lines: ['07 NOV 2026', '19:30', 'RUA DAS FIGUEIRAS, 301'],
    ambience: 'ambience-hush',
  },
  trail: {
    lines: ['08 NOV 2026', '02:17', 'GALPÃO DESATIVADO. SETOR NORTE'],
    ambience: 'ambience-hush',
  },
}

/**
 * Fundo da mesa/delegacia para reflexões de hub (raciocínio após documentos, bancada, etc.).
 * Mesmo asset da cena principal — não depende de `sceneBackgrounds` de visita.
 */
export const HUB_REFLECTION_BACKGROUND = '/assets/scene/hub-office-bg.jpg'

const BG = '/assets/backgrounds/processed'

/**
 * Fundos (processados) usados em cada cena — auditoria de backgrounds.
 * Só arquivos em `public/assets/backgrounds/processed/` são servidos.
 *
 * ATENÇÃO: conferir o JPEG em disco antes de apontar aqui — URLs Pexels com ID
 * errado devolvem foto aleatória. Use `scripts/verify-background-download.mjs`.
 * PNGs antigos (ex. `denis-workshop.png`, `warehouse-17-north-yard.png`) ficam
 * em `public/` só como backup; as cenas activas usam os JPG processados novos.
 */
export const sceneBackgrounds: Record<SceneId, string> = {
  hospital: `${BG}/hospital/hospital-02-corridor-chairs.jpg`,
  vertice: `${BG}/nightclub/nightclub-01-lights-haze.jpg`,
  lucas: `${BG}/university/university-03-classroom-empty.jpg`,
  livia: `${BG}/radio/costeira-01-newsroom.jpg`,
  // Titã Club ≠ Vértice: segunda variante de casa noturna (palco/fumaça vermelha).
  nico: `${BG}/nightclub/nightclub-02-dj-booth.jpg`,
  andre: `${BG}/prison/prison-01-visit-room.jpg`,
  // Miro: sala de entrevista da detenção / polícia civil.
  miro: `${BG}/police/miro-detention-01-cell.jpg`,

  // Residências / visitas — variantes distintas; Geraldo = boteco; Sandra = sala própria.
  samuel: `${BG}/apartment/apartment-01-living-room.jpg`,
  geraldo: `${BG}/bar/geraldo-01-boteco-backbar.jpg`,
  sandra: `${BG}/apartment/sandra-01-living-inside.jpg`,
  bia: `${BG}/apartment/apartment-bia-house.png`,
  jana: `${BG}/apartment/apartment-01-living-modest.jpg`,
  mauro: `${BG}/apartment/mauro-01-living-house.jpg`,
  rui: `${BG}/apartment/apartment-01-living-modest.jpg`,
  cecilia: `${BG}/apartment/apartment-04-hall-brazil-sp.jpg`,

  // Galpão 17 (prisão de Miro) ≠ galpão final (Mariana).
  operation: `${BG}/warehouse/operation-17-night-exterior.jpg`,
  denis: `${BG}/workshop/denis-01-garage-interior.jpg`,
  trail: `${BG}/warehouse/warehouse-final-north-sector.png`,
}

/** Cenas ainda sem fundo próprio definitivo. */
export const sceneBackgroundsPending: Partial<Record<SceneId, string>> = {}
