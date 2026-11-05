import { useState } from 'react'
import { assetPath } from '../../lib/assetPath'
import { sceneBackgrounds } from '../../data/sceneIntros'
import { TRAIL_DISCOVERY_BEATS } from '../../data/block09/trailDiscovery'
import { finishTrailDiscovery } from '../../game/story/block09Handlers'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { VisualNovelDialog, VNSceneShell } from './VisualNovelDialog'
import '../../styles/visual-novel.css'

export function TrailDiscoveryScene({ onClose }: { onClose: () => void }) {
  const inv = useInvestigation()
  const [i, setI] = useState(0)
  const done = Boolean(inv.flags.block09_mariana_dead)
  const bg = assetPath(sceneBackgrounds.trail)

  if (done) {
    return (
      <VNSceneShell
        title="Galpão — setor norte"
        onClose={onClose}
        testId="trail-scene"
        backgroundStyle={{
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.45), rgba(0,0,0,.75)), url(${bg})`,
        }}
      >
        <VisualNovelDialog speaker="Augusto" text="Não há mais o que encontrar aqui." onContinue={onClose} />
      </VNSceneShell>
    )
  }

  const beat = TRAIL_DISCOVERY_BEATS[i]
  return (
    <VNSceneShell
      title="Galpão — setor norte"
      onClose={onClose}
      testId="trail-scene"
      backgroundStyle={{
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.45), rgba(0,0,0,.75)), url(${bg})`,
      }}
    >
      <VisualNovelDialog
        speaker={beat.speaker}
        text={beat.text}
        onContinue={() => {
          if (i + 1 < TRAIL_DISCOVERY_BEATS.length) setI(i + 1)
          else {
            finishTrailDiscovery()
            onClose()
          }
        }}
      />
    </VNSceneShell>
  )
}
