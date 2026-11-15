import type { LocationSceneId } from '../app/GameHubContext'
import type { InvestigationState } from '../game/types'
import {
  CANONICAL_STORY_MANIFEST,
  buildCanonicalCheckpointStateBefore,
  type CanonicalInterviewId,
} from '../game/story/canonicalStoryManifest'
import type { SceneId } from './sceneIntros'
import type { LocationSceneRenderOpts } from '../scene/locationSceneRender'

const VN_SCENE: Record<CanonicalInterviewId, SceneId> = {
  hospital: 'hospital',
  lucas: 'lucas',
  nico: 'nico',
  livia: 'livia',
  samuel: 'samuel',
  andre: 'andre',
  nicoFollowup: 'nico',
  jana: 'jana',
  janaFollowup: 'jana',
  geraldo: 'geraldo',
  miro: 'miro',
  miroFollowup: 'miro',
  sandra: 'sandra',
  cecilia: 'cecilia',
  andreFollowup: 'andre',
  miroThird: 'miro',
  denis: 'denis',
  mauro: 'mauro',
  bia: 'bia',
  rui: 'rui',
}

const VN_TITLES: Record<CanonicalInterviewId, string> = {
  hospital: 'Hospital, entrevistas iniciais',
  lucas: 'Universidade. Lucas',
  nico: 'Titã Club. Nico',
  livia: 'Rádio Costeira. Lívia',
  samuel: 'Residência. Samuel Teixeira',
  andre: 'Penitenciária. André Silva',
  nicoFollowup: 'Titã Club. Nico (retorno)',
  jana: 'Casa de Jana Ribeiro',
  janaFollowup: 'Jana, segundo contato',
  geraldo: 'Geraldo, primeira conversa',
  miro: 'Detenção. Miro',
  miroFollowup: 'Miro, segundo interrogatório',
  sandra: 'Residência. Sandra',
  cecilia: 'Residência. Cecília',
  andreFollowup: 'André, confronto',
  miroThird: 'Miro, última conversa',
  denis: 'Oficina. Dênis',
  mauro: 'Residência. Mauro',
  bia: 'Bia',
  rui: 'Rui',
}

export type SceneGalleryKind =
  | 'opening'
  | 'scene-runner'
  | 'vertice'
  | 'hospital-deposit'
  | 'morsa-cctv'
  | 'early'

export interface SceneGalleryEntry {
  id: string
  title: string
  subtitle?: string
  kind: SceneGalleryKind
  /** Checkpoint canônico imediatamente antes da cena (base de preparação). */
  prepBeforeCheckpoint: string
  sceneId?: SceneId
  locationId?: NonNullable<LocationSceneId>
  renderOpts?: LocationSceneRenderOpts
  /** Ajustes finos ao estado preparado (galeria / rotas antecipadas). */
  patchPrep?: (state: InvestigationState) => void
}

function pushEntry(list: SceneGalleryEntry[], entry: SceneGalleryEntry) {
  if (list.some((e) => e.id === entry.id)) return
  list.push(entry)
}

export function buildSceneGalleryEntries(): SceneGalleryEntry[] {
  const list: SceneGalleryEntry[] = []

  pushEntry(list, {
    id: 'opening',
    title: 'Abertura',
    subtitle: '3 de novembro de 2026',
    kind: 'opening',
    prepBeforeCheckpoint: 'b01-start',
  })

  for (const cp of CANONICAL_STORY_MANIFEST) {
    for (const step of cp.steps) {
      if ('vertice' in step) {
        const second = step.vertice.includes('set_crossref')
        pushEntry(list, {
          id: second ? 'vertice-2' : 'vertice-1',
          title: second ? 'Boate Vértice, cruzamento' : 'Boate Vértice, primeira visita',
          kind: 'vertice',
          prepBeforeCheckpoint: cp.id,
          sceneId: 'vertice',
          locationId: 'vertice',
        })
      }
      if ('vn' in step) {
        const vn = step.vn
        pushEntry(list, {
          id: `vn-${vn}`,
          title: VN_TITLES[vn],
          kind: 'scene-runner',
          prepBeforeCheckpoint: cp.id,
          sceneId: VN_SCENE[vn],
          locationId: VN_SCENE[vn],
          renderOpts:
            vn === 'hospital'
              ? { hospitalMode: 'interview' }
              : undefined,
        })
      }
      if ('h' in step && step.h === 'finishPoliceOperation') {
        pushEntry(list, {
          id: 'operation',
          title: 'Operação no galpão',
          kind: 'scene-runner',
          prepBeforeCheckpoint: cp.id,
          sceneId: 'operation',
          locationId: 'operation',
        })
      }
      if ('h' in step && step.h === 'finishTrailDiscovery') {
        pushEntry(list, {
          id: 'trail',
          title: 'Galpão, achado final',
          kind: 'scene-runner',
          prepBeforeCheckpoint: cp.id,
          sceneId: 'trail',
          locationId: 'trail',
        })
      }
    }

    if (cp.id === 'b03-nico-located') {
      pushEntry(list, {
        id: 'early-nico',
        title: 'Titã Club. Nico (visita antecipada)',
        kind: 'early',
        prepBeforeCheckpoint: 'b03-after-nico',
        sceneId: 'nico',
        locationId: 'nico',
        renderOpts: { direct: 'nico-early' },
        patchPrep: (st) => {
          st.flags.block02_elisa_search_unlocked = false
          st.flags.block03_nico_interview_done = false
          st.searchTermsDiscovered = st.searchTermsDiscovered.filter((t) => t.toLowerCase() !== 'elisa')
          if (st.locations.titan) st.locations.titan = { ...st.locations.titan, status: 'visitAvailable' }
        },
      })
    }

    if (cp.id === 'b04-samuel-ready') {
      pushEntry(list, {
        id: 'early-samuel',
        title: 'Samuel Teixeira (visita antecipada)',
        kind: 'early',
        prepBeforeCheckpoint: 'b04-after-samuel',
        sceneId: 'samuel',
        locationId: 'samuel',
        renderOpts: { direct: 'samuel-accidental' },
        patchPrep: (st) => {
          st.flags.block04_samuel_interview_done = false
          st.flags.block04_samuel_search_unlocked = false
          st.flags.marcelo_address_found = true
          if (st.locations['samuel-casa']) {
            st.locations['samuel-casa'] = { ...st.locations['samuel-casa'], status: 'visitAvailable' }
          }
        },
      })
    }

    if (cp.id === 'b05-after-nico2') {
      pushEntry(list, {
        id: 'early-jana',
        title: 'Jana Ribeiro (visita antecipada)',
        kind: 'early',
        prepBeforeCheckpoint: 'b05-after-jana',
        sceneId: 'jana',
        locationId: 'jana',
        renderOpts: { direct: 'jana-early' },
        patchPrep: (st) => {
          st.flags.block05_jana_interview_done = false
          st.flags.block05_nico_followup_done = false
          st.flags.block05_jana_search_unlocked = false
          if (st.locations['jana-casa']) {
            st.locations['jana-casa'] = { ...st.locations['jana-casa'], status: 'visitAvailable' }
          }
        },
      })
    }

    if (cp.id === 'b06-geraldo-ready') {
      pushEntry(list, {
        id: 'early-geraldo',
        title: 'Geraldo (visita antecipada)',
        kind: 'early',
        prepBeforeCheckpoint: 'b06-after-geraldo',
        sceneId: 'geraldo',
        locationId: 'geraldo',
        renderOpts: { direct: 'geraldo-early' },
        patchPrep: (st) => {
          st.flags.block06_geraldo_interview_done = false
          st.flags.block06_geraldo_search_unlocked = false
          st.flags.geraldo_vertice_known = false
          if (st.locations['geraldo-casa']) {
            st.locations['geraldo-casa'] = { ...st.locations['geraldo-casa'], status: 'visitAvailable' }
          }
        },
      })
    }

    if (cp.id === 'b07-ricardo-henrique') {
      pushEntry(list, {
        id: 'hospital-deposit',
        title: 'Hospital, depósito de pertences',
        kind: 'hospital-deposit',
        prepBeforeCheckpoint: cp.id,
        sceneId: 'hospital',
        locationId: 'hospital',
        renderOpts: { hospitalMode: 'deposit' },
        patchPrep: (st) => {
          st.flags.block07_hospital_deposit_unlocked = true
          st.flags.block07_hospital_deposit_done = false
          if (st.locations.hospital) {
            st.locations.hospital = { ...st.locations.hospital, status: 'visitAvailable' }
          }
        },
      })
    }

    if (cp.id === 'b08-rings-done') {
      pushEntry(list, {
        id: 'morsa-cctv',
        title: 'Revelação, imagem CAM11',
        kind: 'morsa-cctv',
        prepBeforeCheckpoint: cp.id,
      })
    }
  }

  return list
}

export function prepGalleryEntryState(entry: SceneGalleryEntry): InvestigationState {
  const st = buildCanonicalCheckpointStateBefore(entry.prepBeforeCheckpoint)
  entry.patchPrep?.(st)
  return st
}