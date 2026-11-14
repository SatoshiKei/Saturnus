import { useEffect, useMemo, useState } from 'react'
import { seedLocations } from '../../../data/game/seedLocations'
import { useInvestigation } from '../../../game/hooks/useInvestigation'
import { dispatchActions } from '../../../game/state/investigationStore'
import type { Evidence, Location, StoryActionRef } from '../../../game/types'
import { assetPath } from '../../../lib/assetPath'
import { locationStatusLabel } from '../../../lib/labels'
import { useGameHub, type LocationSceneId } from '../../../app/GameHubContext'
import { GamePanel } from '../../ui/GamePanel'

/** Cena concluída → pino deixa de ser visitável (repara saves antigos). */
const SCENE_DONE_LOCATION: { flag: string; locationId: string }[] = [
  { flag: 'block01_hospital_done', locationId: 'hospital' },
  { flag: 'block02_vertice_visit_done', locationId: 'vertice' },
  { flag: 'block02_lucas_interview_done', locationId: 'universidade' },
  { flag: 'block03_nico_interview_done', locationId: 'titan' },
  { flag: 'block03_livia_interview_done', locationId: 'radio' },
  { flag: 'block04_samuel_interview_done', locationId: 'samuel-casa' },
  { flag: 'block04_andre_interview_done', locationId: 'presidio' },
  { flag: 'block05_jana_interview_done', locationId: 'jana-casa' },
  { flag: 'block05_nico_followup_done', locationId: 'titan' },
  { flag: 'block06_geraldo_interview_done', locationId: 'geraldo-casa' },
  { flag: 'block06_jana_followup_done', locationId: 'jana-casa' },
  { flag: 'block06_operation_done', locationId: 'galpao-17' },
  { flag: 'block06_miro_interview_done', locationId: 'detencao-miro' },
  { flag: 'block07_miro_followup_done', locationId: 'detencao-miro' },
  { flag: 'block07_sandra_interview_done', locationId: 'sandra-casa' },
  { flag: 'block07_cecilia_interview_done', locationId: 'cecilia-casa' },
  { flag: 'block08_andre_followup_done', locationId: 'presidio' },
  { flag: 'block08_miro_third_done', locationId: 'detencao-miro' },
  { flag: 'block08_mauro_interview_done', locationId: 'mauro-casa' },
  { flag: 'block08_denis_interview_done', locationId: 'oficina-denis' },
  { flag: 'block08_bia_interview_done', locationId: 'bia-casa' },
  { flag: 'block08_rui_interview_done', locationId: 'rui-casa' },
  { flag: 'block09_mariana_dead', locationId: 'trilha-final' },
]

/** posição do marcador: usa o estado salvo ou, em saves antigos, o seed */
function markerPos(l: Location) {
  const seed = seedLocations.find((s) => s.id === l.id)
  const x = l.mapX ?? seed?.mapX
  const y = l.mapY ?? seed?.mapY
  return x === undefined || y === undefined ? null : { x, y }
}

/** Cena de visita do local (hospital, universidade, boate…). */
function sceneOf(l: Location): NonNullable<LocationSceneId> | undefined {
  return (l.sceneId ?? seedLocations.find((s) => s.id === l.id)?.sceneId) as NonNullable<LocationSceneId> | undefined
}

/**
 * Mapa da cidade (LocationsMap). Locais desconhecidos não aparecem. Um endereço descoberto ganha um
 * pino; o jogador abre o mapa e escolhe ir até lá — nada acontece sozinho.
 */
export function LocationsMap({ onClose }: { onClose: () => void }) {
  const inv = useInvestigation()
  const { openLocationScene } = useGameHub()
  const places = useMemo(
    () => Object.values(inv.locations).filter((l) => l.status !== 'unknown' && markerPos(l)),
    [inv.locations],
  )
  const [sel, setSel] = useState<string | null>(null)
  const [note] = useState<string | null>(null)
  const place = places.find((l) => l.id === sel) ?? null

  useEffect(() => {
    const fixes: StoryActionRef[] = []
    for (const row of SCENE_DONE_LOCATION) {
      if (!inv.flags[row.flag]) continue
      if (inv.locations[row.locationId]?.status !== 'visitAvailable') continue
      // 2ª visita ao Vértice após P3 técnico (cruzamento A→B → Nico).
      if (
        row.locationId === 'vertice' &&
        inv.flags.block02_rings_provisional &&
        !inv.flags.block02_vertice_set_crossref
      ) {
        continue
      }
      // Bloco 5 reabre o Titã; Bloco 6 reabre Jana após Geraldo.
      if (
        row.locationId === 'titan' &&
        inv.flags.block05_started &&
        !inv.flags.block05_nico_followup_done
      ) {
        continue
      }
      if (
        row.locationId === 'jana-casa' &&
        inv.flags.block06_geraldo_reflection_done &&
        !inv.flags.block06_jana_followup_done
      ) {
        continue
      }
      if (
        row.locationId === 'detencao-miro' &&
        inv.flags.block07_started &&
        !inv.flags.block07_miro_followup_done
      ) {
        continue
      }
      if (
        row.locationId === 'presidio' &&
        inv.flags.block08_morsa_reflection_done &&
        !inv.flags.block08_andre_followup_done
      ) {
        continue
      }
      if (
        row.locationId === 'detencao-miro' &&
        inv.flags.block08_andre_reflection_done &&
        !inv.flags.block08_miro_third_done
      ) {
        continue
      }
      fixes.push({ type: 'unlockLocation', id: row.locationId, status: 'visited' })
    }
    if (fixes.length) dispatchActions(fixes)
  }, [inv.flags, inv.locations])

  const people = place
    ? (place.relatedPersonIds.map((id) => inv.people[id]?.name).filter(Boolean) as string[])
    : []
  const evidence = place
    ? inv.evidenceOwned
        .map((id) => inv.evidence[id])
        .filter((e): e is Evidence => Boolean(e) && e.relatedLocationIds.includes(place.id))
        .map((e) => e.title)
    : []

  return (
    <GamePanel
      title="Mapa da cidade"
      kicker="Locais conhecidos"
      variant="map"
      testId="hub-map"
      onClose={onClose}
    >
      <div className="lm" data-testid="locations-panel">
        <div className="lm-map" style={{ backgroundImage: `url(${assetPath('/assets/scene/hub/city-map.svg')})` }}>
          {places.map((l) => {
            const p = markerPos(l)!
            return (
              <button
                key={l.id}
                type="button"
                className="lm-pin"
                data-active={l.id === place?.id}
                data-status={l.status}
                data-testid={`map-pin-${l.id}`}
                style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
                aria-label={l.name}
                onClick={() => {
                  setSel(l.id)
                }}
              >
                <span className="lm-pin__dot" />
                <span className="lm-pin__name">{l.name}</span>
              </button>
            )
          })}
        </div>

        <aside className="lm-card" aria-live="polite">
          {place ? (
            <>
              <p className="lm-card__status">{locationStatusLabel[place.status]}</p>
              <h3 className="lm-card__name">{place.name}</h3>
              {place.description ? <p>{place.description}</p> : null}

              <h4>Pessoas relacionadas</h4>
              <p className="lm-card__list">{people.length ? people.join(' · ') : '—'}</p>
              {evidence.length ? (
                <>
                  <h4>Evidências</h4>
                  <p className="lm-card__list">{evidence.join(' · ')}</p>
                </>
              ) : null}

              {place.id === 'delegacia' ? (
                <p className="lm-card__here">Você está aqui.</p>
              ) : sceneOf(place) && place.status === 'visitAvailable' ? (
                <button
                  type="button"
                  className="lm-visit"
                  data-testid={`visit-${place.id}`}
                  onClick={() => {
                    const scene = sceneOf(place)
                    if (!scene) return
                    onClose()
                    openLocationScene(scene)
                  }}
                >
                  Ir até lá
                </button>
              ) : place.status === 'visited' ? (
                <p className="lm-card__hint">Visita concluída. Não há motivo para voltar agora.</p>
              ) : (
                <p className="lm-card__hint">Local anotado. Ainda não há motivo para ir até lá.</p>
              )}
              {note ? <p className="lm-card__hint">{note}</p> : null}
            </>
          ) : (
            <p className="lm-card__empty">Selecione um local no mapa.</p>
          )}
        </aside>
      </div>
    </GamePanel>
  )
}
