import { useState } from 'react'
import { assetPath } from '../../lib/assetPath'
import { sceneBackgrounds } from '../../data/sceneIntros'
import { finishPoliceOperation } from '../../game/story/block06Handlers'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { OPERATION_SCENE_BEATS } from '../../data/block06/operationSceneBeats'
import { VisualNovelDialog, VNSceneShell } from './VisualNovelDialog'
import '../../styles/visual-novel.css'

export function OperationScene({ onClose }: { onClose: () => void }) {
  const inv = useInvestigation()
  const [i, setI] = useState(0)
  const done = Boolean(inv.flags.block06_operation_done)
  const bg = assetPath(sceneBackgrounds.operation)

  if (done) {
    return (
      <VNSceneShell
        title="Operação — Galpão 17"
        onClose={onClose}
        testId="operation-scene"
        backgroundStyle={{
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.4), rgba(0,0,0,.7)), url(${bg})`,
        }}
      >
        <VisualNovelDialog speaker="Augusto" text="Operação encerrada. Miro está na detenção." onContinue={onClose} />
      </VNSceneShell>
    )
  }

  const beat = OPERATION_SCENE_BEATS[i]
  return (
    <VNSceneShell
      title="Operação — Galpão 17"
      onClose={onClose}
      testId="operation-scene"
      backgroundStyle={{
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.4), rgba(0,0,0,.7)), url(${bg})`,
      }}
    >
      <VisualNovelDialog
        speaker={beat.speaker}
        text={beat.text}
        onContinue={() => {
          if (i + 1 < OPERATION_SCENE_BEATS.length) setI(i + 1)
          else {
            finishPoliceOperation()
            onClose()
          }
        }}
      />
    </VNSceneShell>
  )
}
