import { useCallback, useEffect, useRef } from 'react'
import { GalleryPlaybackProvider } from '../../app/GalleryPlaybackContext'
import { Block01Opening } from '../story/Block01Opening'
import { MariApartmentReconstructionScene } from '../story/MariApartmentReconstructionScene'
import { SceneRunner } from '../story/vn/SceneTransitions'
import { MorsaCctvReveal } from './MorsaCctvReveal'
import { renderLocationScene } from '../../scene/locationSceneRender'
import {
  prepGalleryEntryState,
  type SceneGalleryEntry,
} from '../../data/sceneGalleryCatalog'
import {
  createGameSaveSnapshot,
  type GameSaveSnapshot,
} from '../../game/state/gameSave'
import { getInvestigationState, restoreGameSnapshot } from '../../game/state/investigationStore'
import '../../styles/scene-transitions.css'
import '../../styles/visual-novel.css'

export function SceneGalleryPlayer({ entry, onDone }: { entry: SceneGalleryEntry; onDone: () => void }) {
  const backupRef = useRef<GameSaveSnapshot | null>(null)
  const returnedRef = useRef(false)

  const finish = useCallback(() => {
    if (returnedRef.current) return
    returnedRef.current = true
    const snap = backupRef.current
    if (snap) restoreGameSnapshot(snap, { persist: false })
    onDone()
  }, [onDone])

  useEffect(() => {
    backupRef.current = createGameSaveSnapshot(getInvestigationState(), null)
    const prep = prepGalleryEntryState(entry)
    restoreGameSnapshot(createGameSaveSnapshot(prep, null), { persist: false })
    returnedRef.current = false
    return () => {
      const snap = backupRef.current
      if (snap && !returnedRef.current) restoreGameSnapshot(snap, { persist: false })
    }
  }, [entry])

  const content = (() => {
    switch (entry.kind) {
      case 'opening':
        return (
          <div className="inv-gallery-player" data-testid="gallery-player-opening">
            <Block01Opening onDone={finish} />
          </div>
        )
      case 'mari-apartment':
        return (
          <div className="inv-gallery-player" data-testid="gallery-player-mari-apartment">
            <MariApartmentReconstructionScene onDone={finish} />
          </div>
        )
      case 'morsa-cctv':
        return (
          <div className="inv-gallery-player inv-gallery-player--cctv" data-testid="gallery-player-morsa">
            <MorsaCctvReveal onComplete={finish} />
          </div>
        )
      case 'scene-runner':
      case 'vertice':
      case 'hospital-deposit':
      case 'early':
        if (!entry.sceneId || !entry.locationId) return null
        return (
          <div className="inv-gallery-player" data-testid={`gallery-player-${entry.id}`}>
            <SceneRunner
              sceneId={entry.sceneId}
              onReturn={finish}
              renderScene={(close) => renderLocationScene(entry.locationId!, close, entry.renderOpts)}
            />
          </div>
        )
      default:
        return null
    }
  })()

  return (
    <GalleryPlaybackProvider active>
      <div className="inv-gallery-player__shell" data-testid="gallery-player" aria-label={entry.title}>
        {content}
      </div>
    </GalleryPlaybackProvider>
  )
}