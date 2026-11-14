import { useCallback, useEffect, useState } from 'react'
import { useGameHub } from '../../app/GameHubContext'
import { photosForDevice, type PhonePhotoItem } from '../../data/block01/phoneMedia'
import { contactAvatarSrc } from '../../lib/characterSprites'

interface PhotosAppProps {
  onBack: () => void
}

/**
 * Fotos: carrega SOMENTE o acervo do aparelho ativo (`photosForDevice`).
 * Miniaturas não têm texto sobreposto; metadados ficam no cabeçalho e no painel do visualizador.
 */
export function PhotosApp({ onBack }: PhotosAppProps) {
  const { phoneDevice } = useGameHub()
  const items = photosForDevice(phoneDevice)
  const [viewer, setViewer] = useState<number | null>(null)

  // Trocar de aparelho nunca mantém um índice de foto do outro acervo.
  useEffect(() => setViewer(null), [phoneDevice])

  const closeViewer = useCallback(() => setViewer(null), [])
  const step = useCallback(
    (delta: number) => {
      setViewer((v) => {
        if (v === null || items.length === 0) return v
        return (v + delta + items.length) % items.length
      })
    },
    [items.length],
  )

  const current = viewer !== null ? items[viewer] : undefined

  return (
    <div className="ios-photos" data-testid="photos-app" data-device={phoneDevice}>
      <header className="ios-app-header ios-app-header--photos">
        <button type="button" className="ios-app-header__back" data-testid="photos-back" onClick={onBack}>
          ‹ Início
        </button>
        <h1>Fotos</h1>
        <p className="ios-photos__sub">
          {items.length} {items.length === 1 ? 'item' : 'itens'}
        </p>
      </header>
      <div className="ios-photos__scroll" data-testid="photos-scroll">
        <ul className="ios-photos__grid" data-testid="photos-grid">
          {items.map((item, index) => (
            <PhotoTile key={item.id} item={item} onOpen={() => setViewer(index)} />
          ))}
        </ul>
        {items.length === 0 ? <p className="ios-photos__empty">Nenhuma foto.</p> : null}
      </div>
      {current && viewer !== null ? (
        <PhotoViewer
          item={current}
          index={viewer}
          total={items.length}
          onClose={closeViewer}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
        />
      ) : null}
    </div>
  )
}

function PhotoTile({ item, onOpen }: { item: PhonePhotoItem; onOpen: () => void }) {
  const src = contactAvatarSrc(item.spriteId)
  return (
    <li className="ios-photos__tile" data-photo-id={item.id}>
      <button
        type="button"
        className="ios-photos__tile-btn"
        data-testid={`photo-tile-${item.id}`}
        aria-label={`Abrir foto: ${item.label}`}
        onClick={onOpen}
      >
        {src ? (
          <img src={src} alt="" className="ios-photos__img" loading="lazy" draggable={false} />
        ) : (
          <span className="ios-photos__placeholder" aria-hidden />
        )}
      </button>
    </li>
  )
}

function PhotoViewer({
  item,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  item: PhonePhotoItem
  index: number
  total: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const src = contactAvatarSrc(item.spriteId)
  return (
    <div className="ios-photos-viewer" data-testid="photos-viewer" data-photo-id={item.id} role="dialog" aria-label={item.label}>
      <header className="ios-photos-viewer__head">
        <button type="button" className="ios-photos-viewer__back" data-testid="photos-viewer-back" onClick={onClose}>
          ‹ Fotos
        </button>
        <span className="ios-photos-viewer__count">
          {index + 1} de {total}
        </span>
      </header>
      <div className="ios-photos-viewer__stage">
        {src ? <img src={src} alt={item.label} draggable={false} /> : null}
      </div>
      <footer className="ios-photos-viewer__info">
        <strong>{item.label}</strong>
        {item.folder ? <span>{item.folder}</span> : null}
      </footer>
      {total > 1 ? (
        <nav className="ios-photos-viewer__nav" aria-label="Navegar fotos">
          <button type="button" data-testid="photos-viewer-prev" onClick={onPrev}>
            Anterior
          </button>
          <button type="button" data-testid="photos-viewer-next" onClick={onNext}>
            Próxima
          </button>
        </nav>
      ) : null}
    </div>
  )
}
