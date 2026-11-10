import { useState, useCallback } from 'react'
import { useGameHub } from '../../app/GameHubContext'
import {
  augustoPhotosLibrary,
  marianaPhotosLibrary,
  type PhoneMediaItem,
} from '../../data/block01/phoneMedia'
import { contactAvatarSrc } from '../../lib/characterSprites'
import { assetPath } from '../../lib/assetPath'

interface PhotosAppProps {
  onBack: () => void
}

const MARIANA_EXTRA: PhoneMediaItem[] = [
  { id: 'mp-5', label: 'Café — manhã', folder: 'Câmera' },
  { id: 'mp-6', label: 'Corredor do hospital', folder: 'Câmera' },
  { id: 'mp-7', label: 'Tela bloqueada', folder: 'Câmera' },
  { id: 'mp-8', label: 'Selfie — plantão', spriteId: 'mariana', folder: 'Câmera' },
  { id: 'mp-9', label: 'Rua — chuva', folder: 'Câmera' },
  { id: 'mp-10', label: 'Documentos na mesa', folder: 'Câmera' },
]

export function PhotosApp({ onBack }: PhotosAppProps) {
  const { phoneDevice } = useGameHub()
  const base = phoneDevice === 'augusto' ? augustoPhotosLibrary : marianaPhotosLibrary
  const items = phoneDevice === 'mariana' ? [...base, ...MARIANA_EXTRA] : base
  const [viewer, setViewer] = useState<number | null>(null)

  const closeViewer = useCallback(() => setViewer(null), [])
  const step = useCallback(
    (delta: number) => {
      setViewer((v) => {
        if (v === null) return v
        return (v + delta + items.length) % items.length
      })
    },
    [items.length],
  )

  return (
    <div className="ios-photos" data-testid="photos-app">
      <header className="ios-app-header ios-app-header--photos">
        <button type="button" className="ios-app-header__back" onClick={onBack}>
          ‹ Início
        </button>
        <h1>Fotos</h1>
        <p className="ios-photos__sub">Biblioteca · {items.length}</p>
      </header>
      <ul className="ios-photos__grid ios-photos__grid--rich">
        {items.map((item, index) => (
          <MediaTile key={item.id} item={item} onOpen={() => setViewer(index)} />
        ))}
      </ul>
      {viewer !== null ? (
        <PhotoViewer
          item={items[viewer]}
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

function MediaTile({ item, onOpen }: { item: PhoneMediaItem; onOpen: () => void }) {
  const src = item.spriteId ? contactAvatarSrc(item.spriteId) : undefined
  return (
    <li className="ios-photos__tile">
      <button type="button" className="ios-photos__tile-btn" onClick={onOpen}>
        <figure>
          {src ? (
            <img src={src} alt="" className="ios-photos__img" />
          ) : (
            <span
              className="ios-photos__placeholder"
              style={{
                backgroundImage: `url(${assetPath('/assets/scene/hub-office-bg.jpg')})`,
              }}
              aria-hidden
            />
          )}
          <figcaption>{item.label}</figcaption>
        </figure>
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
  item: PhoneMediaItem
  index: number
  total: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const src = item.spriteId ? contactAvatarSrc(item.spriteId) : assetPath('/assets/scene/hub-office-bg.jpg')
  return (
    <div className="ios-photos-viewer" data-testid="photos-viewer" role="dialog">
      <header className="ios-photos-viewer__head">
        <button type="button" onClick={onClose} aria-label="Fechar">
          ‹
        </button>
        <span>
          {index + 1} / {total}
        </span>
      </header>
      <figure className="ios-photos-viewer__stage">
        <img src={src} alt={item.label} />
        <figcaption>
          <strong>{item.label}</strong>
          {item.folder ? <span>{item.folder}</span> : null}
        </figcaption>
      </figure>
      <nav className="ios-photos-viewer__nav" aria-label="Navegar fotos">
        <button type="button" onClick={onPrev}>
          Anterior
        </button>
        <button type="button" onClick={onNext}>
          Próxima
        </button>
      </nav>
    </div>
  )
}
