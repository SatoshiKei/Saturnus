import type { SceneId } from '../sceneIntros'

/** Núcleos do doc `VN_SCENES_MUSIC.md`. */
export type VnBgmFamily = 'A' | 'B' | 'C' | 'D'

export type VnMixProfile = 'DEFAULT' | 'HUB' | 'ECHO' | 'TENSE' | 'WIDE' | 'CLOSE'

export type VnMixPreset = 'bandLimited' | 'hospitalCold' | 'vertice2' | 'miro2' | 'miro3'

export type VnBgmSpec = {
  family: VnBgmFamily
  profile?: VnMixProfile
  mixPreset?: VnMixPreset
}

export const VN_BGM_FAMILY_SRC: Record<VnBgmFamily, string> = {
  A: '/assets/audio/vn/bgm/family-a.mp3',
  B: '/assets/audio/vn/bgm/family-b.mp3',
  C: '/assets/audio/vn/bgm/family-c.mp3',
  D: '/assets/audio/vn/bgm/family-d.mp3',
}

const SCENE_SPECS: Record<string, VnBgmSpec> = {
  opening: { family: 'A', profile: 'DEFAULT' },
  operation: { family: 'D', profile: 'TENSE' },
  trail: { family: 'D', profile: 'TENSE', mixPreset: 'vertice2' },
  'vn-hospital': { family: 'A', profile: 'DEFAULT', mixPreset: 'hospitalCold' },
  'hospital-deposit': { family: 'A', profile: 'CLOSE' },
  'vertice-1': { family: 'B', profile: 'DEFAULT' },
  'vertice-2': { family: 'B', profile: 'ECHO', mixPreset: 'vertice2' },
  'vn-lucas': { family: 'A', profile: 'DEFAULT' },
  'vn-livia': { family: 'A', profile: 'DEFAULT' },
  'vn-nico': { family: 'B', profile: 'DEFAULT' },
  'vn-samuel': { family: 'C', profile: 'DEFAULT' },
  'vn-jana': { family: 'C', profile: 'DEFAULT' },
  'vn-geraldo': { family: 'C', profile: 'DEFAULT' },
  'vn-sandra': { family: 'C', profile: 'ECHO' },
  'vn-cecilia': { family: 'C', profile: 'DEFAULT' },
  'vn-mauro': { family: 'C', profile: 'DEFAULT' },
  'vn-bia': { family: 'C', profile: 'DEFAULT' },
  'vn-rui': { family: 'C', profile: 'DEFAULT' },
  'vn-andre': { family: 'D', profile: 'DEFAULT' },
  'vn-miro': { family: 'D', profile: 'DEFAULT' },
  'vn-miro-2': { family: 'D', profile: 'TENSE', mixPreset: 'miro2' },
  'vn-miro-3': { family: 'D', profile: 'TENSE', mixPreset: 'miro3' },
  'vn-denis': { family: 'D', profile: 'TENSE' },
  'hex-call': { family: 'A', profile: 'HUB', mixPreset: 'bandLimited' },
}

const VISIT_SCENE_FAMILY: Record<SceneId, VnBgmFamily> = {
  hospital: 'A',
  lucas: 'A',
  nico: 'B',
  livia: 'A',
  samuel: 'C',
  andre: 'D',
  jana: 'C',
  geraldo: 'C',
  miro: 'D',
  sandra: 'C',
  cecilia: 'C',
  mauro: 'C',
  bia: 'C',
  rui: 'C',
  denis: 'D',
  vertice: 'B',
  operation: 'D',
  trail: 'D',
}

/** `testId` das cenas → chave em `SCENE_SPECS`. */
export const VN_BGM_BY_TEST_ID: Record<string, string> = {
  'block01-opening-vn': 'opening',
  'hospital-scene': 'vn-hospital',
  'hospital-deposit-scene': 'hospital-deposit',
  'vertice-scene': 'vertice-1',
  'lucas-scene': 'vn-lucas',
  'livia-scene': 'vn-livia',
  'nico-scene': 'vn-nico',
  'nico-early-scene': 'vn-nico',
  'nico-followup-scene': 'vn-nico',
  'samuel-scene': 'vn-samuel',
  'samuel-accidental-scene': 'vn-samuel',
  'andre-scene': 'vn-andre',
  'andre-followup-scene': 'vn-andre',
  'jana-scene': 'vn-jana',
  'jana-early-scene': 'vn-jana',
  'jana-followup-scene': 'vn-jana',
  'geraldo-scene': 'vn-geraldo',
  'geraldo-early-scene': 'vn-geraldo',
  'miro-scene': 'vn-miro',
  'miro-followup-scene': 'vn-miro-2',
  'miro-third-scene': 'vn-miro-3',
  'sandra-scene': 'vn-sandra',
  'cecilia-scene': 'vn-cecilia',
  'mauro-scene': 'vn-mauro',
  'bia-scene': 'vn-bia',
  'rui-scene': 'vn-rui',
  'denis-scene': 'vn-denis',
  'operation-scene': 'operation',
  'trail-scene': 'trail',
}

type ReflectionRow = { profile: VnMixProfile; mixPreset?: VnMixPreset; family?: VnBgmFamily }

const REFLECTION_ROWS: Record<string, ReflectionRow> = {
  'refl-theory-julia-pressure': { profile: 'HUB' },
  'refl-theory-andre-obsession': { profile: 'HUB' },
  'refl-theory-maralto-retaliation': { profile: 'HUB' },
  'refl-theory-human-manipulator': { profile: 'HUB' },
  'refl-theory-miro-killed-elisa': { profile: 'HUB' },
  'refl-lucas': { profile: 'ECHO' },
  'refl-aneis': { profile: 'ECHO' },
  'refl-livia': { profile: 'ECHO' },
  'refl-nico': { profile: 'ECHO' },
  'refl-samuel': { profile: 'ECHO' },
  'refl-andre': { profile: 'ECHO' },
  'refl-hex-call': { profile: 'HUB', mixPreset: 'bandLimited' },
  'refl-nico2': { profile: 'ECHO' },
  'refl-jana': { profile: 'ECHO' },
  'refl-b05-andre': { profile: 'ECHO' },
  'refl-b05-maralto': { profile: 'WIDE' },
  'refl-b05-path': { profile: 'HUB' },
  'refl-jana2': { profile: 'ECHO' },
  'refl-b06-geraldo': { profile: 'ECHO' },
  'refl-b06-miro': { profile: 'CLOSE' },
  'refl-b07-sandra': { profile: 'ECHO' },
  'refl-b07-ricardo-dead': { profile: 'TENSE' },
  'refl-b07-notebook': { profile: 'CLOSE' },
  'refl-b07-hv': { profile: 'CLOSE' },
  'refl-b07-henrique-reveal': { profile: 'TENSE' },
  'refl-b07-tech': { profile: 'TENSE' },
  'refl-b08-morsa': { profile: 'WIDE' },
  'refl-b08-miro-guardrail': { profile: 'WIDE' },
  'refl-b08-jaguar-lead': { profile: 'WIDE' },
  'refl-b08-andre': { profile: 'ECHO' },
  'refl-b08-accident': { profile: 'TENSE' },
  'refl-b08-omitido-bridge': { profile: 'HUB' },
  'refl-b08-final': { profile: 'TENSE' },
  'refl-b09-omitido': { profile: 'HUB' },
  'refl-b09-messages': { profile: 'CLOSE', family: 'A' },
  'refl-b09-death': { profile: 'CLOSE' },
  'refl-b09-augusto': { profile: 'CLOSE' },
  'refl-b09-final': { profile: 'CLOSE' },
  'refl-samuel-recontextualized': { profile: 'ECHO' },
}

export function resolveVnBgmScene(sceneKey: string): VnBgmSpec | null {
  return SCENE_SPECS[sceneKey] ?? null
}

export function vnBgmKeyFromTestId(testId: string): string | null {
  return VN_BGM_BY_TEST_ID[testId] ?? null
}

export function resolveReflectionBgm(reflectionId: string, sceneId?: SceneId): VnBgmSpec | null {
  const row = REFLECTION_ROWS[reflectionId]
  if (!row) return { family: 'A', profile: 'HUB' }
  let family: VnBgmFamily = row.family ?? 'A'
  if (row.profile === 'ECHO' && sceneId && VISIT_SCENE_FAMILY[sceneId]) {
    family = VISIT_SCENE_FAMILY[sceneId]
  }
  if (row.profile === 'TENSE' && !row.family) {
    family = 'D'
  }
  if (row.profile === 'WIDE' && !row.family) {
    family = 'A'
  }
  return { family, profile: row.profile, mixPreset: row.mixPreset }
}

export type VnBgmMixParams = {
  volume: number
  playbackRate: number
}

export function vnBgmMixParams(spec: VnBgmSpec): VnBgmMixParams {
  const profile = spec.profile ?? 'DEFAULT'
  let volume = 0.26
  let playbackRate = 1

  switch (profile) {
    case 'HUB':
      volume = 0.22
      break
    case 'ECHO':
      volume = 0.2
      playbackRate = 0.995
      break
    case 'TENSE':
      volume = 0.24
      break
    case 'WIDE':
      volume = 0.23
      break
    case 'CLOSE':
      volume = 0.21
      break
    default:
      volume = 0.26
  }

  if (spec.mixPreset === 'bandLimited') volume *= 0.92
  if (spec.mixPreset === 'hospitalCold') volume *= 0.94
  if (spec.mixPreset === 'vertice2') volume *= 0.9
  if (spec.mixPreset === 'miro2') volume *= 1.05
  if (spec.mixPreset === 'miro3') volume *= 0.88

  return { volume: Math.min(0.32, volume), playbackRate }
}