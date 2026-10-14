import { archivedChats } from '../../data/mockChats'
import { ChatList } from './ChatList'

interface ArchivedChatsViewProps {
  onBack: () => void
}

export function ArchivedChatsView({ onBack }: ArchivedChatsViewProps) {
  return (
    <div className="wa-app wa-app--archived" data-testid="whatsapp-archived">
      <header className="wa-header wa-header--archived">
        <button type="button" className="wa-header__back" onClick={onBack} aria-label="Voltar">
          ‹
        </button>
        <h1 className="wa-header__title">Arquivadas</h1>
      </header>
      <p className="wa-archived-hint">Conversas arquivadas permanecem silenciadas neste mock.</p>
      <ChatList chats={archivedChats} />
    </div>
  )
}
