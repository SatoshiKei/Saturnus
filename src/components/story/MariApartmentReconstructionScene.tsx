import { useCallback, useEffect, useRef, useState } from 'react'
import { useGalleryPlayback } from '../../app/GalleryPlaybackContext'
import {
  MARI_APARTMENT_RECONSTRUCTION_ALL,
  MARI_APT_MELODIE_START_BEAT_ID,
  melodieVolumeForApartmentBeat,
  type ApartmentReconstructionBeat,
} from '../../data/block01/mariApartmentReconstructionBeats'
import {
  MELODIE_PHONE_AUDIO_SRC,
  apartmentReconstructionBackgroundStyle,
  mariApartmentPresentBackgroundStyle,
  type MariAptBgKey,
} from '../../data/block01/mariApartmentSceneAssets'
import { setFlag } from '../../game/state/investigationStore'
import { assetPath } from '../../lib/assetPath'
import { portraitSrcForStory } from '../../lib/characterSprites'
import { VisualNovelDialog, VNSceneShell } from './VisualNovelDialog'
import '../../styles/visual-novel.css'
import '../../styles/investigation.css'

const REC_START_INDEX = MARI_APARTMENT_RECONSTRUCTION_ALL.findIndex((b) => b.id === 'apt-rec-1')

function beatOrder(id: string): number {
  return MARI_APARTMENT_RECONSTRUCTION_ALL.findIndex((b) => b.id === id)
}

function sceneTitle(inReconstruction: boolean): string {
  if (!inReconstruction) return 'Delegacia — gabinete'
  return 'Apartamento 402 — 03/11'
}

function isReconstructionBeat(beat: ApartmentReconstructionBeat, index: number): boolean {
  return index >= REC_START_INDEX && beat.kind !== 'present'
}

/**
 * Reconstrução da entrada (08:21) — Mari na base; visual = relato do rádio.
 */
export function MariApartmentReconstructionScene({ onDone }: { onDone: () => void }) {
  const gallery = useGalleryPlayback()
  const [beatIndex, setBeatIndex] = useState(0)
  const [bgKey, setBgKey] = useState<MariAptBgKey>('door')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const beat = MARI_APARTMENT_RECONSTRUCTION_ALL[beatIndex]
  const inReconstruction = isReconstructionBeat(beat, beatIndex)
  const last = beatIndex >= MARI_APARTMENT_RECONSTRUCTION_ALL.length - 1

  const finish = useCallback(() => {
    const a = audioRef.current
    if (a) {
      a.pause()
      a.currentTime = 0
    }
    if (!gallery) {
      setFlag('mari_flashback_apt_0803_seen', true)
      setFlag('mari_apartment_scene_pending', false)
    }
    onDone()
  }, [gallery, onDone])

  useEffect(() => {
    if (beat.bg) setBgKey(beat.bg)
  }, [beat.bg, beatIndex])

  useEffect(() => {
    const a = new Audio(assetPath(MELODIE_PHONE_AUDIO_SRC))
    a.loop = true
    a.volume = 0
    audioRef.current = a
    return () => {
      a.pause()
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    const a = audioRef.current
    if (!a) return

    if (!inReconstruction || beatOrder(beat.id) < beatOrder(MARI_APT_MELODIE_START_BEAT_ID)) {
      a.pause()
      a.currentTime = 0
      a.volume = 0
      return
    }

    const vol = melodieVolumeForApartmentBeat(beat.id)
    if (vol <= 0) {
      a.pause()
      return
    }
    a.volume = vol
    void a.play().catch(() => {})
  }, [beat, beatIndex, inReconstruction])

  const backgroundStyle = inReconstruction
    ? apartmentReconstructionBackgroundStyle(bgKey)
    : mariApartmentPresentBackgroundStyle()

  const isNarration = beat.kind === 'narration'
  const side =
    beat.portraitId === 'mari' ? 'right' : beat.portraitId === 'augusto' ? 'left' : 'none'

  return (
    <VNSceneShell
      title={sceneTitle(inReconstruction)}
      onClose={finish}
      testId="mari-apartment-reconstruction"
      backgroundStyle={backgroundStyle}
    >
      <VisualNovelDialog
        speaker={isNarration ? undefined : beat.speaker}
        text={beat.text}
        narration={isNarration}
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