import type { PhoneAppId } from '../types/phone'

const labels: Record<PhoneAppId, string> = {
  whatsapp: 'WhatsApp',
  notes: 'Notas',
  calendar: 'Calendário',
  photos: 'Fotos',
  files: 'Arquivos',
  phone: 'Telefone',
  settings: 'Ajustes',
  recorder: 'Gravador',
  browser: 'Navegador',
  appstore: 'Loja',
  'hidden-diary': 'Diário',
  'wavelab-mobile': 'WaveLab',
}

interface AppIconProps {
  appId: PhoneAppId
  size?: 'grid' | 'dock'
}

export function AppIcon({ appId, size = 'grid' }: AppIconProps) {
  return (
    <span
      className={`app-icon app-icon--${appId} app-icon--${size}`}
      aria-hidden
      data-app-icon={appId}
    >
      <AppGlyph appId={appId} />
    </span>
  )
}

export function appLabel(appId: PhoneAppId): string {
  return labels[appId]
}

function AppGlyph({ appId }: { appId: PhoneAppId }) {
  switch (appId) {
    case 'whatsapp':
      return (
        <svg viewBox="0 0 48 48" className="app-icon__svg">
          <path
            fill="currentColor"
            d="M24 4C13.5 4 5 12.1 5 22.4c0 3.6 1 7 2.8 10L5 44l11.8-2.7c2.9 1.6 6.2 2.5 9.7 2.5 10.5 0 19-8.1 19-18.4S34.5 4 24 4zm0 33.5c-2.9 0-5.6-.8-8-2.2l-.6-.3-7 1.6 1.5-6.8-.4-.6c-1.6-2.5-2.5-5.4-2.5-8.5 0-8.7 7.4-15.8 16.5-15.8S39.5 13.5 39.5 22.2 32.1 37.5 24 37.5z"
          />
          <path
            fill="currentColor"
            d="M31.2 27.5c-.4-.2-2.4-1.2-2.8-1.3-.4-.2-.7-.2-1 .2-.3.4-1.1 1.3-1.4 1.6-.3.3-.5.4-1 .1-.4-.2-1.8-.7-3.4-2.1-1.3-1.1-2.1-2.5-2.4-2.9-.3-.4 0-.6.2-.8.2-.2.4-.5.6-.7.2-.2.3-.4.4-.6.1-.2.1-.4 0-.6-.1-.2-.9-2.3-1.3-3.1-.3-.8-.7-.7-1-.7h-.9c-.3 0-.8.1-1.2.6-.4.5-1.6 1.5-1.6 3.7s1.6 4.3 1.9 4.6c.2.3 3.2 4.9 7.8 6.7 1.1.5 2 .7 2.7.9 1.1.4 2.1.3 2.9.2 1-.1 2.4-1 2.7-2 .3-1 .3-1.8.2-2-.1-.2-.4-.3-.8-.5z"
          />
        </svg>
      )
    case 'notes':
      return (
        <svg viewBox="0 0 48 48" className="app-icon__svg">
          <rect x="10" y="6" width="28" height="36" rx="3" fill="#fff" opacity="0.95" />
          <line x1="16" y1="14" x2="32" y2="14" stroke="#c4a000" strokeWidth="2" />
          <line x1="16" y1="22" x2="32" y2="22" stroke="#ddd" strokeWidth="2" />
          <line x1="16" y1="28" x2="28" y2="28" stroke="#ddd" strokeWidth="2" />
        </svg>
      )
    case 'calendar':
      return (
        <svg viewBox="0 0 48 48" className="app-icon__svg">
          <rect x="8" y="10" width="32" height="32" rx="6" fill="#fff" opacity="0.95" />
          <rect x="8" y="10" width="32" height="10" rx="6" fill="#e74c3c" />
          <text x="24" y="18" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="700">
            OUT
          </text>
          <text x="24" y="34" textAnchor="middle" fill="#333" fontSize="14" fontWeight="700">
            13
          </text>
        </svg>
      )
    case 'photos':
      return (
        <svg viewBox="0 0 48 48" className="app-icon__svg">
          <circle cx="18" cy="18" r="6" fill="#fff" opacity="0.9" />
          <path fill="#fff" opacity="0.85" d="M6 38l12-14 8 8 6-6 10 12H6z" />
        </svg>
      )
    case 'files':
      return (
        <svg viewBox="0 0 48 48" className="app-icon__svg">
          <path fill="#fff" d="M14 8h14l8 8v24a4 4 0 01-4 4H14a4 4 0 01-4-4V12a4 4 0 014-4z" opacity="0.9" />
          <path fill="currentColor" opacity="0.35" d="M28 8v8h8" />
        </svg>
      )
    case 'phone':
      return (
        <svg viewBox="0 0 48 48" className="app-icon__svg">
          <path
            fill="#fff"
            d="M16 10c1.2 3.2 2.8 6.1 4.8 8.6l-3 3c1.8 3.6 4.2 6.9 7.2 9.8 2.9 2.9 6.2 5.3 9.8 7.2l3-3c2.5 2 5.4 3.6 8.6 4.8l1.4-5.2c-3.8-1.2-7.3-3-10.5-5.3-3.2-2.3-6-5.1-8.3-8.3-2.3-3.2-4.1-6.7-5.3-10.5L16 10z"
          />
        </svg>
      )
    case 'settings':
      return (
        <svg viewBox="0 0 48 48" className="app-icon__svg">
          <circle cx="24" cy="24" r="8" fill="none" stroke="#fff" strokeWidth="3" />
          <path
            fill="#fff"
            d="M24 4v6M24 38v6M4 24h6M38 24h6M9 9l4 4M35 35l4 4M9 39l4-4M35 13l4-4"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      )
    default:
      return null
  }
}
