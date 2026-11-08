import { AppIcon, appLabel } from '../components/AppIcon'
import { usePhoneSession } from '../app/PhoneSessionContext'
import { useGameHub } from '../app/GameHubContext'
import { useInvestigation } from '../game/hooks/useInvestigation'
import { visibleAppsForDevice } from '../lib/phoneApps'
import { openApp } from '../lib/phoneRouter'
import { newContactIds } from '../lib/contactsSeen'
import type { PhoneAppId } from '../types/phone'

/** Apps comuns sem função no caso: tocar não faz nada (sem “bloqueado”). */
const COMMON_INERT = new Set<PhoneAppId>([
  'browser',
  'messages',
  'camera',
  'mail',
  'maps',
  'clock',
  'calculator',
  'weather',
])

/** No celular de Augusto só WhatsApp, Telefone e Ajustes têm função; o resto é cenário. */
const AUGUSTO_INERT = new Set<PhoneAppId>(['notes', 'photos', 'files', 'calendar'])

export function PhoneHome() {
  const { push } = usePhoneSession()
  const { phoneDevice } = useGameHub()
  const inv = useInvestigation()
  const gridApps = visibleAppsForDevice(phoneDevice, inv)
  const phoneBadge = phoneDevice === 'augusto' ? newContactIds(inv).length : 0

  const inert = (id: PhoneAppId) =>
    COMMON_INERT.has(id) || (phoneDevice === 'augusto' && AUGUSTO_INERT.has(id))

  const launch = (id: PhoneAppId) => {
    if (inert(id)) return
    if (id === 'appstore') {
      push({ screen: 'appstore' })
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
    if (id === 'photos') {
      push({ screen: 'photos' })
      return
    }
    if (id === 'files') {
      push({ screen: 'files' })
      return
    }
    if (id === 'hidden-diary') {
      push(openApp('hidden-diary'))
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
            aria-label={appLabel(id)}
            data-testid={`app-${id}`}
            data-inert={inert(id) || undefined}
            onClick={() => launch(id)}
          >
            <AppIcon appId={id} />
            {id === 'phone' && phoneBadge > 0 ? (
              <span className="phone-home__badge" data-testid="phone-badge">
                {phoneBadge}
              </span>
            ) : null}
            <span className="phone-home__app-label">{appLabel(id)}</span>
          </button>
        ))}
      </div>
      <div className="phone-home__dock">
        {(['phone', 'whatsapp', 'messages', 'settings'] as const)
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
              {id === 'phone' && phoneBadge > 0 ? <span className="phone-home__badge">{phoneBadge}</span> : null}
            </button>
          ))}
      </div>
    </div>
  )
}
