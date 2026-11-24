import { useMemo } from 'react'
import {
  buildSceneGalleryEntries,
  galleryThumbnailFor,
  isSceneGalleryEntryUnlocked,
} from '../../data/sceneGalleryCatalog'
import type { SceneGalleryEntry } from '../../data/sceneGalleryCatalog'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { assetPath } from '../../lib/assetPath'

export function SceneGalleryScreen({
  onBack,
  onPlay,
}: {
  onBack: () => void
  onPlay: (entry: SceneGalleryEntry) => void
}) {
  const inv = useInvestigation()
  const entries = useMemo(() => buildSceneGalleryEntries(), [])
  const unlockedCount = entries.filter((e) => isSceneGalleryEntryUnlocked(e, inv.flags)).length

  return (
    <div className="inv-gallery" data-testid="scene-gallery">
      <header className="inv-saves__head inv-gallery__head">
        <button type="button" className="inv-saves__back" data-testid="gallery-back" onClick={onBack}>
          ‹ Voltar
        </button>
        <h2>Galeria</h2>
        <p className="inv-gallery__count">
          {unlockedCount} / {entries.length} cenas
        </p>
      </header>
      <div className="inv-gallery__grid" role="list">
        {entries.map((entry, index) => {
          const unlocked = isSceneGalleryEntryUnlocked(entry, inv.flags)
          const thumb = assetPath(galleryThumbnailFor(entry))
          return (
            <button
              key={entry.id}
              type="button"
              role="listitem"
              className="inv-gallery__card"
              data-testid={`gallery-item-${entry.id}`}
              data-locked={!unlocked || undefined}
              disabled={!unlocked}
              onClick={() => {
                if (unlocked) onPlay(entry)
              }}
            >
              <div className="inv-gallery__screen" aria-hidden>
                <img
                  src={thumb}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className={unlocked ? undefined : 'inv-gallery__screen--locked'}
                />
                <span className="inv-gallery__screen-glass" />
                {!unlocked ? <span className="inv-gallery__lock" aria-hidden /> : null}
              </div>
              <div className="inv-gallery__meta">
                <span className="inv-gallery__index">{String(index + 1).padStart(2, '0')}</span>
                <div className="inv-gallery__copy">
                  <strong>{unlocked ? entry.title : 'Ainda não revelada'}</strong>
                  {unlocked && entry.subtitle ? <p>{entry.subtitle}</p> : null}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}