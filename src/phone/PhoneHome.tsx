import type { PhoneAppDef } from '../types/phone'
import { usePhoneSession } from '../app/PhoneSessionContext'
import { openApp } from '../lib/phoneRouter'

const apps: PhoneAppDef[] = [
  { id: 'whatsapp', label: 'Conversas', iconClass: 'app-icon--whatsapp' },
  { id: 'notes', label: 'Notas', iconClass: 'app-icon--notes' },
  { id: 'calendar', label: 'Calendário', iconClass: 'app-icon--calendar' },
  { id: 'photos', label: 'Fotos', iconClass: 'app-icon--photos', placeholder: true },
  { id: 'files', label: 'Arquivos', iconClass: 'app-icon--files', placeholder: true },
  { id: 'phone', label: 'Telefone', iconClass: 'app-icon--phone', placeholder: true },
  { id: 'settings', label: 'Ajustes', iconClass: 'app-icon--settings', placeholder: true },
]

export function PhoneHome() {
  const { push } = usePhoneSession()

  return (
    <div className="phone-home" data-testid="phone-home">
      <div className="phone-home__wallpaper" />
      <div className="phone-home__grid">
        {apps.map((app) => (
          <button
            key={app.id}
            type="button"
            className="phone-home__app"
            disabled={app.placeholder}
            aria-label={app.label}
            data-testid={`app-${app.id}`}
            onClick={() => !app.placeholder && push(openApp(app.id))}
          >
            <span className={`app-icon ${app.iconClass}`} />
            <span className="phone-home__app-label">{app.label}</span>
          </button>
        ))}
      </div>
      <div className="phone-home__dock">
        {['whatsapp', 'notes', 'calendar'].map((id) => {
          const app = apps.find((a) => a.id === id)!
          return (
            <button
              key={id}
              type="button"
              className="phone-home__dock-app"
              aria-label={app.label}
              onClick={() => push(openApp(app.id))}
            >
              <span className={`app-icon ${app.iconClass}`} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
