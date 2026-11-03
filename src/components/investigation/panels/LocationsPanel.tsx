import { useMemo, useState } from 'react'
import { seedLocations } from '../../../data/game/seedLocations'
import { useInvestigation } from '../../../game/hooks/useInvestigation'
import type { Evidence, Location } from '../../../game/types'
import { assetPath } from '../../../lib/assetPath'
import { locationStatusLabel } from '../../../lib/labels'
import { useGameHub } from '../../../app/GameHubContext'
import { GamePanel } from '../../ui/GamePanel'

/** posição do marcador: usa o estado salvo ou, em saves antigos, o seed */
function markerPos(l: Location) {
  const seed = seedLocations.find((s) => s.id === l.id)
  const x = l.mapX ?? seed?.mapX
  const y = l.mapY ?? seed?.mapY
  return x === undefined || y === undefined ? null : { x, y }
}

/**
 * Mapa da cidade (LocationsMap). Locais desconhecidos simplesmente não aparecem.
 * Cada local pode abrir uma Scene no futuro — hoje o botão informa que a visita ainda
 * não está disponível nesta versão.
 */
export function LocationsMap({ onClose }: { onClose: () => void }) {
  const inv = useInvestigation()
  const { openLocationScene } = useGameHub()
  const places = useMemo(
    () => Object.values(inv.locations).filter((l) => l.status !== 'unknown' && markerPos(l)),
    [inv.locations],
  )
  const [sel, setSel] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const place = places.find((l) => l.id === sel) ?? null

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
                  setNote(null)
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
              ) : (
                <button
                  type="button"
                  className="lm-visit"
                  data-testid={`visit-${place.id}`}
                  disabled={place.status !== 'visitAvailable'}
                  onClick={() => {
                    if (place.id === 'hospital') {
                      onClose()
                      openLocationScene('hospital')
                      return
                    }
                    setNote('A cena deste local ainda não está disponível nesta versão.')
                  }}
                >
                  {place.status === 'visited' ? 'Revisitar' : 'Visitar'}
                </button>
              )}
              {place.id !== 'delegacia' && place.status === 'known' ? (
                <p className="lm-card__hint">Ainda não há motivo para ir até lá.</p>
              ) : null}
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
