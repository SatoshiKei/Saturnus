import type { ReactNode } from 'react'
import type { LocationSceneId } from '../app/GameHubContext'
import { HospitalInterviewScene } from '../components/story/HospitalInterviewScene'
import { HospitalDepositScene } from '../components/story/HospitalDepositScene'
import { getInvestigationState } from '../game/state/investigationStore'
import { VerticeInterviewScene } from '../components/story/VerticeInterviewScene'
import { LucasInterviewScene } from '../components/story/LucasInterviewScene'
import { NicoInterviewScene } from '../components/story/NicoInterviewScene'
import { LiviaInterviewScene } from '../components/story/LiviaInterviewScene'
import { SamuelInterviewScene } from '../components/story/SamuelInterviewScene'
import { AndreInterviewScene } from '../components/story/AndreInterviewScene'
import { JanaInterviewScene } from '../components/story/JanaInterviewScene'
import { GeraldoInterviewScene } from '../components/story/GeraldoInterviewScene'
import { MiroInterviewScene } from '../components/story/MiroInterviewScene'
import { OperationScene } from '../components/story/OperationScene'
import { SandraInterviewScene } from '../components/story/SandraInterviewScene'
import { CeciliaInterviewScene } from '../components/story/CeciliaInterviewScene'
import { MauroInterviewScene } from '../components/story/MauroInterviewScene'
import { DenisInterviewScene } from '../components/story/DenisInterviewScene'
import { BiaInterviewScene } from '../components/story/BiaInterviewScene'
import { RuiInterviewScene } from '../components/story/RuiInterviewScene'
import { TrailDiscoveryScene } from '../components/story/TrailDiscoveryScene'
import { NicoEarlyInterviewScene } from '../components/story/NicoEarlyInterviewScene'
import { JanaEarlyInterviewScene } from '../components/story/JanaEarlyInterviewScene'
import { GeraldoEarlyInterviewScene } from '../components/story/GeraldoEarlyInterviewScene'
import { SamuelAccidentalScene } from '../components/story/SamuelAccidentalScene'

export type LocationSceneRenderOpts = {
  hospitalMode?: 'auto' | 'interview' | 'deposit'
  direct?:
    | 'nico-early'
    | 'jana-early'
    | 'geraldo-early'
    | 'samuel-accidental'
}

export function renderLocationScene(
  id: NonNullable<LocationSceneId>,
  close: () => void,
  opts?: LocationSceneRenderOpts,
): ReactNode {
  const hospitalMode = opts?.hospitalMode ?? 'auto'
  if (opts?.direct === 'nico-early') return <NicoEarlyInterviewScene onClose={close} />
  if (opts?.direct === 'jana-early') return <JanaEarlyInterviewScene onClose={close} />
  if (opts?.direct === 'geraldo-early') return <GeraldoEarlyInterviewScene onClose={close} />
  if (opts?.direct === 'samuel-accidental') return <SamuelAccidentalScene onClose={close} />

  switch (id) {
    case 'hospital': {
      if (hospitalMode === 'deposit') return <HospitalDepositScene onClose={close} />
      if (hospitalMode === 'interview') return <HospitalInterviewScene onClose={close} />
      const b7 = getInvestigationState().flags
      if (b7.block07_hospital_deposit_unlocked && !b7.block07_hospital_deposit_done) {
        return <HospitalDepositScene onClose={close} />
      }
      return <HospitalInterviewScene onClose={close} />
    }
    case 'vertice':
      return <VerticeInterviewScene onClose={close} />
    case 'lucas':
      return <LucasInterviewScene onClose={close} />
    case 'nico':
      return <NicoInterviewScene onClose={close} />
    case 'livia':
      return <LiviaInterviewScene onClose={close} />
    case 'samuel':
      return <SamuelInterviewScene onClose={close} />
    case 'andre':
      return <AndreInterviewScene onClose={close} />
    case 'jana':
      return <JanaInterviewScene onClose={close} />
    case 'geraldo':
      return <GeraldoInterviewScene onClose={close} />
    case 'operation':
      return <OperationScene onClose={close} />
    case 'miro':
      return <MiroInterviewScene onClose={close} />
    case 'sandra':
      return <SandraInterviewScene onClose={close} />
    case 'cecilia':
      return <CeciliaInterviewScene onClose={close} />
    case 'mauro':
      return <MauroInterviewScene onClose={close} />
    case 'denis':
      return <DenisInterviewScene onClose={close} />
    case 'bia':
      return <BiaInterviewScene onClose={close} />
    case 'rui':
      return <RuiInterviewScene onClose={close} />
    case 'trail':
      return <TrailDiscoveryScene onClose={close} />
  }
}