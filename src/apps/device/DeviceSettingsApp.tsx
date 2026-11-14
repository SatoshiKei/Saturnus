import { UiGlyph, type UiGlyphName } from '../../components/UiGlyph'

interface DeviceSettingsAppProps {
  onBack: () => void
}

const rows: { label: string; value?: string; icon: UiGlyphName }[] = [
  { icon: 'wifi', label: 'Wi-Fi', value: 'Rede_Casa_5G' },
  { icon: 'bluetooth', label: 'Bluetooth', value: 'Ativado' },
  { icon: 'bell', label: 'Notificações' },
  { icon: 'gear', label: 'Geral' },
  { icon: 'contrast', label: 'Tela e brilho' },
  { icon: 'lock', label: 'Privacidade' },
  { icon: 'battery', label: 'Bateria', value: '63%' },
  { icon: 'storage', label: 'Armazenamento', value: '41 GB de 128 GB' },
]

/** Ajustes comuns: nenhuma linha leva a lugar nenhum. O diário não está aqui nem em nenhum fluxo normal. */
export function DeviceSettingsApp({ onBack }: DeviceSettingsAppProps) {
  return (
    <div className="device-app device-settings" data-testid="device-settings">
      <button type="button" className="device-settings__back" onClick={onBack}>
        ‹ Início
      </button>
      <h2>Ajustes</h2>
      <ul className="device-settings__list">
        {rows.map((r) => (
          <li key={r.label} className="device-settings__row">
            <span className="device-settings__icon" aria-hidden>
              <UiGlyph name={r.icon} />
            </span>
            <span className="device-settings__label">{r.label}</span>
            {r.value ? <span className="device-settings__value">{r.value}</span> : null}
            <span className="device-settings__chev" aria-hidden>
              ›
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
