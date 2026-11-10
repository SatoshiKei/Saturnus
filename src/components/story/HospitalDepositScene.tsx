import { useState } from 'react'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { assetPath } from '../../lib/assetPath'
import { VisualNovelDialog, VNSceneShell } from './VisualNovelDialog'
import { HOSPITAL_DEPOSIT_BEATS } from '../../data/block07/hospitalDeposit'
import { onHospitalDepositDone } from '../../game/story/block07Handlers'
import '../../styles/visual-novel.css'

export function HospitalDepositScene({ onClose }: { onClose: () => void }) {
  const inv = useInvestigation()
  const done = Boolean(inv.flags.block07_hospital_deposit_done)
  const [i, setI] = useState(0)
  const bg = assetPath('/assets/backgrounds/processed/hospital/hospital-02-corridor-chairs.jpg')

  const step = () => {
    if (i + 1 < HOSPITAL_DEPOSIT_BEATS.length) setI(i + 1)
    else {
      if (!done) onHospitalDepositDone()
      onClose()
    }
  }

  const beat = HOSPITAL_DEPOSIT_BEATS[i]
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
