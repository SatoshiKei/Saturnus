import { activeChats } from '../../data/mockChats'
import { ChatList } from './ChatList'

interface WhatsAppHomeProps {
  onBack: () => void
}

export function WhatsAppHome({ onBack }: WhatsAppHomeProps) {
  return (
    <div className="wa-app" data-testid="whatsapp-home">
      <header className="wa-header">
        <button type="button" className="wa-header__back" onClick={onBack} aria-label="Voltar">
          ‹
        </button>
        <h1 className="wa-header__title">Conversas</h1>
      </header>
      <ChatList chats={activeChats} />
    </div>
  )
}
