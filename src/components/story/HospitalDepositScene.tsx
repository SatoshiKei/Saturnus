import { useState } from 'react'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { assetPath } from '../../lib/assetPath'
import { VisualNovelDialog, VNSceneShell } from './VisualNovelDialog'
import { onHospitalDepositDone } from '../../game/story/block07Handlers'
import '../../styles/visual-novel.css'

const BEATS = [
  { speaker: 'Augusto', text: 'Corredor de serviço. O depósito cheira a papel guardado.' },
  { speaker: 'Júlia', text: 'Eu nunca vim aqui embaixo.' },
  { speaker: 'Júlia', text: 'Na ficha: Ricardo Freitas. Camisa, cinto, carteira vazia, carregador, chaves.' },
  { speaker: 'Júlia', text: 'Consta “computador portátil preto”. Não está na caixa. Sem baixa nem retirada.' },
  { speaker: 'Augusto', text: 'Num lenço escuro, bordado nas bordas: H.V.' },
  { speaker: 'Augusto', text: '“Ricardo Freitas” continua sendo a única coisa sobre ele sem prova além da palavra dele.' },
]

export function HospitalDepositScene({ onClose }: { onClose: () => void }) {
  const inv = useInvestigation()
  const done = Boolean(inv.flags.block07_hospital_deposit_done)
  const [i, setI] = useState(0)
  const bg = assetPath('/assets/backgrounds/processed/hospital/hospital-02-corridor-chairs.jpg')

  const step = () => {
    if (i + 1 < BEATS.length) setI(i + 1)
    else {
      if (!done) onHospitalDepositDone()
      onClose()
    }
  }

  const beat = BEATS[i]
  return (
    <VNSceneShell
      title="Hospital — depósito"
      onClose={onClose}
      testId="hospital-deposit-scene"
      backgroundStyle={{
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.7)), url(${bg})`,
      }}
    >
      <VisualNovelDialog speaker={beat.speaker} text={beat.text} onContinue={step} />
    </VNSceneShell>
  )
}
