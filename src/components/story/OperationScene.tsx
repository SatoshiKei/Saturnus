import { useState } from 'react'
import { assetPath } from '../../lib/assetPath'
import { sceneBackgrounds } from '../../data/sceneIntros'
import { finishPoliceOperation } from '../../game/story/block06Handlers'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { VisualNovelDialog, VNSceneShell } from './VisualNovelDialog'
import '../../styles/visual-novel.css'

const BEATS = [
  { speaker: 'Augusto', text: 'Equipes posicionadas. Galpão 17 — Pátio Norte. Entrada coordenada.' },
  { speaker: 'Rádio', text: 'Unidade dois no perímetro. Sem movimento na frente.' },
  { speaker: undefined, text: 'Sirene curta. Passos. Metal. Alguém tenta sair pelo pátio.' },
  { speaker: 'Augusto', text: 'Miro identificado. Contido. Sem disparos.' },
  { speaker: 'Rádio', text: 'Custódia confirmada. Material apreendido no local.' },
  { speaker: 'Augusto', text: 'Prisão por crimes atuais. Levar à detenção. Entrevista depois.' },
]

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

  const beat = BEATS[i]
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
          if (i + 1 < BEATS.length) setI(i + 1)
          else {
            finishPoliceOperation()
            onClose()
          }
        }}
      />
    </VNSceneShell>
  )
}
