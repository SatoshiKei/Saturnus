import { AppIcon, appLabel } from '../components/AppIcon'
import { usePhoneSession } from '../app/PhoneSessionContext'
import { useGameHub } from '../app/GameHubContext'
import { useInvestigation } from '../game/hooks/useInvestigation'
import { visibleAppsForDevice } from '../lib/phoneApps'
import { openApp } from '../lib/phoneRouter'
import type { PhoneAppId } from '../types/phone'

const placeholders = new Set<PhoneAppId>(['photos', 'files', 'browser'])

export function PhoneHome() {
  const { push } = usePhoneSession()
  const { phoneDevice } = useGameHub()
  const inv = useInvestigation()
  const gridApps = visibleAppsForDevice(phoneDevice, inv)

  const launch = (id: PhoneAppId) => {
    if (placeholders.has(id)) return
    if (id === 'appstore') {
      push({ screen: 'appstore' })
      return
    }
    if (id === 'hidden-diary') {
      push({ screen: 'hidden-diary' })
      return
    }
    if (id === 'wavelab-mobile') {
      push({ screen: 'wavelab' })
      return
    }
    if (id === 'recorder') {
      push({ screen: 'recorder' })
      return
    }
    if (id === 'settings') {
      push({ screen: 'device-settings' })
      return
    }
    push(openApp(id))
  }

  return (
    <div className="phone-home" data-testid="phone-home">
      <p className="phone-home__device-label" data-testid="phone-device-label">
        {phoneDevice === 'mariana' ? 'Aparelho — Mariana' : 'Aparelho — Augusto'}
      </p>
      <div className="phone-home__wallpaper" />
      <p className="phone-home__clock" aria-hidden>
        22:14
      </p>
      <div className="phone-home__grid">
        {gridApps.map((id) => (
          <button
            key={id}
            type="button"
            className="phone-home__app"
            disabled={placeholders.has(id)}
            aria-label={appLabel(id)}
            data-testid={`app-${id}`}
            onClick={() => launch(id)}
          >
            <AppIcon appId={id} />
            <span className="phone-home__app-label">{appLabel(id)}</span>
          </button>
        ))}
      </div>
      <div className="phone-home__dock">
        {(['whatsapp', 'notes', 'calendar'] as const)
          .filter((id) => gridApps.includes(id))
          .map((id) => (
            <button
              key={id}
              type="button"
              className="phone-home__dock-app"
              aria-label={appLabel(id)}
              onClick={() => launch(id)}
            >
              <AppIcon appId={id} size="dock" />
            </button>
          ))}
      </div>
    </div>
  )
}
