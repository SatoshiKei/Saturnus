import { useCallback, useEffect, useState } from 'react'
import { useGalleryPlayback } from '../../app/GalleryPlaybackContext'
import { OPENING_SCENE_BEATS } from '../../data/block01/openingSceneBeats'
import { HUB_REFLECTION_BACKGROUND } from '../../data/sceneIntros'
import { setFlag } from '../../game/state/investigationStore'
import { assetPath } from '../../lib/assetPath'
import { unlockSfxAudio } from '../../lib/sfx'
import { portraitSrcForStory } from '../../lib/characterSprites'
import { VisualNovelDialog, VNSceneShell } from './VisualNovelDialog'
import '../../styles/visual-novel.css'
import '../../styles/investigation.css'

const SHOW_MS = 220
const HOLD_MS = 1100
const FADE_MS = 420

type Phase = 'black' | 'title' | 'out' | 'vn'

/**
 * Abertura do Bloco 1 — cartão de data, depois VN Augusto + Mari.
 */
export function Block01Opening({ onDone }: { onDone: () => void }) {
  const gallery = useGalleryPlayback()
  const [phase, setPhase] = useState<Phase>('black')
  const [beatIndex, setBeatIndex] = useState(0)

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase('title'), SHOW_MS)
    const t2 = window.setTimeout(() => setPhase('out'), SHOW_MS + HOLD_MS)
    const t3 = window.setTimeout(() => setPhase('vn'), SHOW_MS + HOLD_MS + FADE_MS)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
    }
  }, [])

  const finish = useCallback(() => {
    if (!gallery) setFlag('block01_opening_seen', true)
    onDone()
  }, [gallery, onDone])

  if (phase !== 'vn') {
    return (
      <div
        className={`block01-opening${phase === 'out' ? ' block01-opening--out' : ''}`}
        data-testid="block01-opening"
        onPointerDown={() => unlockSfxAudio()}
      >
        {phase === 'title' || phase === 'out' ? (
          <p className="block01-opening__date">3 de novembro de 2026 — 08:42</p>
        ) : null}
      </div>
    )
  }

  const beat = OPENING_SCENE_BEATS[beatIndex]
  const bg = assetPath(HUB_REFLECTION_BACKGROUND)
  const last = beatIndex >= OPENING_SCENE_BEATS.length - 1
  const side = beat.portraitId === 'mari' ? 'right' : beat.portraitId === 'augusto' ? 'left' : 'none'

  return (
    <VNSceneShell
      title="Delegacia — gabinete"
      onClose={finish}
      testId="block01-opening-vn"
      backgroundStyle={{
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.32), rgba(0,0,0,.58)), url(${bg})`,
      }}
    >
      <VisualNovelDialog
        speaker={beat.speaker}
        text={beat.text}
        narration={beat.narration}
        portraitId={beat.portraitId}
        portraitSrc={beat.portraitId ? portraitSrcForStory(beat.portraitId) : undefined}
        portraitSide={side}
        forcePortrait={Boolean(beat.portraitId)}
        terminalBeat={last}
        onContinue={() => {
          if (!last) setBeatIndex((i) => i + 1)
          else finish()
        }}
      />
    </VNSceneShell>
  )
}
