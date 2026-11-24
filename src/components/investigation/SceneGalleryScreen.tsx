import { useMemo } from 'react'
import { buildSceneGalleryEntries, galleryThumbnailFor } from '../../data/sceneGalleryCatalog'
import type { SceneGalleryEntry } from '../../data/sceneGalleryCatalog'
import { assetPath } from '../../lib/assetPath'

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
      <header className="inv-saves__head inv-gallery__head">
        <button type="button" className="inv-saves__back" data-testid="gallery-back" onClick={onBack}>
          ‹ Voltar
        </button>
        <h2>Galeria</h2>
        <p className="inv-gallery__count">{entries.length} cenas</p>
      </header>
      <div className="inv-gallery__grid" role="list">
        {entries.map((entry, index) => {
          const thumb = assetPath(galleryThumbnailFor(entry))
          return (
            <button
              key={entry.id}
              type="button"
              role="listitem"
              className="inv-gallery__card"
              data-testid={`gallery-item-${entry.id}`}
              onClick={() => onPlay(entry)}
            >
              <div className="inv-gallery__screen" aria-hidden>
                <img src={thumb} alt="" loading="lazy" decoding="async" />
                <span className="inv-gallery__screen-glass" />
              </div>
              <div className="inv-gallery__meta">
                <span className="inv-gallery__index">{String(index + 1).padStart(2, '0')}</span>
                <div className="inv-gallery__copy">
                  <strong>{entry.title}</strong>
                  {entry.subtitle ? <p>{entry.subtitle}</p> : null}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}