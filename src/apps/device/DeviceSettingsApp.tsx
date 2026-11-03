import { revealHiddenApps } from '../../game/state/investigationStore'

interface DeviceSettingsAppProps {
  onBack: () => void
}

export function DeviceSettingsApp({ onBack }: DeviceSettingsAppProps) {
  return (
    <div className="device-app" data-testid="device-settings">
      <button type="button" onClick={onBack}>
        ‹ Início
      </button>
      <h2>Ajustes</h2>
      <button type="button" data-testid="settings-show-hidden-apps" onClick={() => revealHiddenApps()}>
        Armazenamento — mostrar apps ocultos
      </button>
    </div>
  )
}
