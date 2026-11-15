import { useMemo } from 'react'
import { buildSceneGalleryEntries } from '../../data/sceneGalleryCatalog'
import type { SceneGalleryEntry } from '../../data/sceneGalleryCatalog'

export function SceneGalleryScreen({
  onBack,
  onPlay,
}: {
  onBack: () => void
  onPlay: (entry: SceneGalleryEntry) => void
}) {
  const entries = useMemo(() => buildSceneGalleryEntries(), [])

  return (
    <div className="inv-gallery" data-testid="scene-gallery">
      <header className="inv-saves__head">
        <button type="button" className="inv-saves__back" data-testid="gallery-back" onClick={onBack}>
          ‹ Voltar
        </button>
        <h2>Galeria</h2>
        <p className="inv-gallery__count">{entries.length} cenas</p>
      </header>
      <ol className="inv-gallery__list">
        {entries.map((entry, index) => (
          <li key={entry.id} className="inv-gallery__item" data-testid={`gallery-item-${entry.id}`}>
            <span className="inv-gallery__index" aria-hidden>
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="inv-gallery__copy">
              <strong>{entry.title}</strong>
              {entry.subtitle ? <p>{entry.subtitle}</p> : null}
            </div>
            <button type="button" className="inv-gallery__play" data-testid={`gallery-play-${entry.id}`} onClick={() => onPlay(entry)}>
              Reproduzir
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}