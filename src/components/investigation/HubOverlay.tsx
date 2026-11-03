import type { HubPanel } from '../../game/types'
import { AudioLabPanel } from './panels/AudioLabPanel'
import { CasebookPanel } from './panels/CasebookPanel'
import { CaseFilesPanel } from './panels/CaseFilesPanel'
import { LocationsPanel } from './panels/LocationsPanel'
import { PoliceComputerPanel } from './panels/PoliceComputerPanel'
import '../../styles/investigation.css'

interface HubOverlayProps {
  panel: HubPanel
  onClose: () => void
}

export function HubOverlay({ panel, onClose }: HubOverlayProps) {
  if (!panel || panel === 'mariana-phone' || panel === 'augusto-phone') return null

  const title =
    panel === 'computer'
      ? 'Terminal policial'
      : panel === 'case-files'
        ? 'Pasta do caso'
        : panel === 'casebook'
          ? 'Caderno de investigação'
          : panel === 'map'
            ? 'Locais'
            : 'Estação de áudio'

  return (
    <div className="inv-hub" data-testid={`hub-${panel}`}>
      <div className="inv-hub__backdrop" onClick={onClose} aria-hidden />
      <div className="inv-hub__panel" role="dialog" aria-label={title}>
        <header className="inv-hub__header">
          <h2>{title}</h2>
          <button type="button" className="inv-hub__close" data-testid="hub-close" onClick={onClose}>
            Voltar à mesa
          </button>
        </header>
        <div className="inv-hub__body">
          {panel === 'computer' ? <PoliceComputerPanel /> : null}
          {panel === 'case-files' ? <CaseFilesPanel /> : null}
          {panel === 'casebook' ? <CasebookPanel /> : null}
          {panel === 'map' ? <LocationsPanel /> : null}
          {panel === 'audio-lab' ? <AudioLabPanel /> : null}
        </div>
      </div>
    </div>
  )
}
