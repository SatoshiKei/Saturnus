import { AppIcon, appLabel } from '../components/AppIcon'
import { usePhoneSession } from '../app/PhoneSessionContext'
import { openApp } from '../lib/phoneRouter'
import type { PhoneAppId } from '../types/phone'

const gridApps: PhoneAppId[] = [
  'whatsapp',
  'notes',
  'calendar',
  'photos',
  'files',
  'phone',
  'settings',
]

const placeholders = new Set<PhoneAppId>(['photos', 'files', 'settings'])

export function PhoneHome() {
  const { push } = usePhoneSession()

  const launch = (id: PhoneAppId) => {
    if (placeholders.has(id)) return
    push(openApp(id))
  }

  return (
    <div className="phone-home" data-testid="phone-home">
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
        {(['whatsapp', 'notes', 'calendar'] as const).map((id) => (
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
