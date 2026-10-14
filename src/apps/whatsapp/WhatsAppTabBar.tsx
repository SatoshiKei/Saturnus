import { phoneFeatureLocks } from '../../data/phoneFeatures'
import type { WhatsAppTab } from '../../types/phone'

interface WhatsAppTabBarProps {
  active: WhatsAppTab
  onSelect: (tab: WhatsAppTab) => void
}

const tabs: { id: WhatsAppTab; label: string; locked?: boolean }[] = [
  { id: 'updates', label: 'Atualiz.', locked: phoneFeatureLocks.whatsappUpdates },
  { id: 'calls', label: 'Ligações' },
  { id: 'communities', label: 'Comunid.', locked: phoneFeatureLocks.whatsappCommunities },
  { id: 'chats', label: 'Conversas' },
  { id: 'settings', label: 'Ajustes' },
]

export function WhatsAppTabBar({ active, onSelect }: WhatsAppTabBarProps) {
  return (
    <nav className="wa-tabs" aria-label="WhatsApp">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`wa-tabs__item${active === tab.id ? ' wa-tabs__item--active' : ''}${
            tab.locked ? ' wa-tabs__item--locked' : ''
          }`}
          aria-current={active === tab.id ? 'page' : undefined}
          data-testid={`wa-tab-${tab.id}`}
          onClick={() => onSelect(tab.id)}
        >
          <TabIcon tab={tab.id} />
          <span className="wa-tabs__label">{tab.label}</span>
          {tab.locked ? <span className="wa-tabs__lock" aria-hidden>🔒</span> : null}
        </button>
      ))}
    </nav>
  )
}

function TabIcon({ tab }: { tab: WhatsAppTab }) {
  const common = { viewBox: '0 0 24 24', className: 'wa-tabs__svg', 'aria-hidden': true as const }
  switch (tab) {
    case 'updates':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
      )
    case 'calls':
      return (
        <svg {...common}>
          <path
            fill="currentColor"
            d="M6.6 10.8c1.4 2.8 3.4 5.2 6 6.8l2-2c.3-.3.8-.4 1.2-.2 1 .4 2.1.7 3.2.7.7 0 1.2.5 1.2 1.2V20c0 .7-.5 1.2-1.2 1.2C9.2 21.2 2.8 14.8 2.8 6.8 2.8 6.1 3.3 5.6 4 5.6c1.1 0 2.2.3 3.2.7.4.2.9.1 1.2-.2l2-2z"
          />
        </svg>
      )
    case 'communities':
      return (
        <svg {...common}>
          <path fill="currentColor" d="M12 3a4 4 0 110 8 4 4 0 010-8zm-7 14a3 3 0 013-3h8a3 3 0 013 3v1H5v-1z" />
        </svg>
      )
    case 'chats':
      return (
        <svg {...common}>
          <path
            fill="currentColor"
            d="M4 4h16a2 2 0 012 2v10a2 2 0 01-2 2H8l-4 3V6a2 2 0 012-2z"
          />
        </svg>
      )
    case 'settings':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" fill="currentColor" />
          <path
            fill="currentColor"
            d="M12 1v3M12 20v3M1 12h3M20 12h3M4 4l2 2M18 18l2 2M4 20l2-2M18 6l2-2"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      )
  }
}
