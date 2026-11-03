import { useState } from 'react'
import { archivedChats } from '../../data/mockChats'
import { phoneFeatureLocks } from '../../data/phoneFeatures'
import { usePhoneSession } from '../../app/PhoneSessionContext'
import { useGameHub } from '../../app/GameHubContext'
import { useInvestigation } from '../../game/hooks/useInvestigation'
import { augustoVisibleChats, marianaVisibleChats } from '../../lib/marianaChats'
import { openWhatsAppArchived } from '../../lib/phoneRouter'
import type { WhatsAppTab } from '../../types/phone'
import { CallList } from './CallList'
import { ChatList } from './ChatList'
import { WhatsAppTabBar } from './WhatsAppTabBar'

interface WhatsAppShellProps {
  initialTab?: WhatsAppTab
  onBackToPhone: () => void
}

export function WhatsAppShell({ initialTab = 'chats', onBackToPhone }: WhatsAppShellProps) {
  const { push } = usePhoneSession()
  const { phoneDevice } = useGameHub()
  const inv = useInvestigation()
  const activeChats =
    phoneDevice === 'augusto' ? augustoVisibleChats(inv) : marianaVisibleChats(inv)
  const [tab, setTab] = useState<WhatsAppTab>(initialTab)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2200)
  }

  const onTab = (next: WhatsAppTab) => {
    if (next === 'updates' && phoneFeatureLocks.whatsappUpdates) {
      showToast('Atualizações indisponíveis nesta fase.')
      return
    }
    if (next === 'communities' && phoneFeatureLocks.whatsappCommunities) {
      showToast('Comunidades indisponíveis nesta fase.')
      return
    }
    if (next === 'settings') {
      showToast('Ajustes do WhatsApp — em breve.')
      return
    }
    setTab(next)
  }

  return (
    <div className="wa-shell" data-testid="whatsapp-home">
      <header className="wa-shell-header">
        <div className="wa-shell-header__row">
          {tab === 'chats' ? (
            <button type="button" className="wa-shell-header__back-ios" onClick={onBackToPhone}>
              ‹ Início
            </button>
          ) : (
            <span />
          )}
          <button type="button" className="wa-shell-header__edit" disabled={phoneFeatureLocks.whatsappNewChat}>
            Editar
          </button>
          <button
            type="button"
            className="wa-shell-header__new"
            aria-label="Nova conversa"
            aria-disabled={phoneFeatureLocks.whatsappNewChat}
            onClick={() => showToast('Nova conversa bloqueada nesta fase.')}
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              <path fill="currentColor" d="M3 17.25V21h3.75l11-11-3.75-3.75-11 11zm14-9.5l1.5 1.5-2 2-1.5-1.5 2-2zM19 3l2 2-1 1-2-2 1-1z" />
            </svg>
          </button>
        </div>
        <h1 className="wa-shell-header__title">
          {tab === 'calls' ? 'Ligações' : tab === 'chats' ? 'Conversas' : 'WhatsApp'}
        </h1>
        {tab === 'chats' ? (
          <>
            <label className="wa-search">
              <span className="wa-search__icon" aria-hidden>
                🔍
              </span>
              <input type="search" placeholder="Buscar" readOnly aria-label="Buscar conversas" />
            </label>
            {archivedChats.length > 0 ? (
              <button
                type="button"
                className="wa-archived-row"
                data-testid="archived-row"
                onClick={() => push(openWhatsAppArchived())}
              >
                <span className="wa-archived-row__icon" aria-hidden>
                  📥
                </span>
                <span className="wa-archived-row__label">Arquivadas</span>
                <span className="wa-archived-row__count">{archivedChats.length}</span>
              </button>
            ) : null}
          </>
        ) : null}
        {tab !== 'chats' ? (
          <button type="button" className="wa-shell-header__phone-back" onClick={onBackToPhone}>
            ‹ Apps
          </button>
        ) : null}
      </header>

      <div className="wa-shell__body">
        {tab === 'chats' ? <ChatList chats={activeChats} /> : null}
        {tab === 'calls' ? <CallList variant="whatsapp" device={phoneDevice} /> : null}
      </div>

      {toast ? (
        <div className="wa-toast" role="status">
          {toast}
        </div>
      ) : null}

      <WhatsAppTabBar active={tab} onSelect={onTab} />
    </div>
  )
}
