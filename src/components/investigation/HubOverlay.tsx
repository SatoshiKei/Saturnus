import type { HubPanel } from '../../game/types'
import { AudioWorkbench } from './panels/AudioLabPanel'
import { InvestigationNotebook } from './panels/CasebookPanel'
import { CaseFiles } from './panels/CaseFilesPanel'
import { LocationsMap } from './panels/LocationsPanel'
import { PoliceComputer } from './panels/PoliceComputerPanel'
import { PoliceLandline } from './panels/PoliceLandlinePanel'
import '../../styles/game-ui.css'

interface HubOverlayProps {
  panel: HubPanel
  onClose: () => void
}

/**
 * Roteia cada alvo da mesa para a sua própria interface.
 * (celulares são tratados pela `Scene` — nunca por aqui)
 */
export function HubOverlay({ panel, onClose }: HubOverlayProps) {
  switch (panel) {
    case 'computer':
      return <PoliceComputer onClose={onClose} />
    case 'case-files':
      return <CaseFiles onClose={onClose} />
    case 'casebook':
      return <InvestigationNotebook onClose={onClose} />
    case 'map':
      return <LocationsMap onClose={onClose} />
    case 'audio-lab':
      return <AudioWorkbench onClose={onClose} />
    case 'landline':
      return <PoliceLandline onClose={onClose} />
    default:
      return null
  }
}
