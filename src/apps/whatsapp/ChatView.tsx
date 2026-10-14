import { contactById } from '../../data/mockContacts'
import { getChatById } from '../../data/mockChats'
import { MessageBubble } from './MessageBubble'

interface ChatViewProps {
  chatId: string
  onBack: () => void
}

export function ChatView({ chatId, onBack }: ChatViewProps) {
  const chat = getChatById(chatId)
  if (!chat) {
    return (
      <div className="wa-chat-view">
        <p>Conversa não encontrada (mock).</p>
      </div>
    )
  }
  const contact = contactById[chat.contactId]
  const title = chat.isGroup ? (chat.groupTitle ?? contact.name) : contact.name

  return (
    <div className="wa-chat-view" data-testid="whatsapp-chat-view">
      <header className="wa-chat-header">
        <button type="button" className="wa-header__back" onClick={onBack} aria-label="Voltar à lista">
          ‹
        </button>
        <div className="wa-chat-header__title">
          <span className="wa-chat-header__name">{title}</span>
          {chat.isGroup ? <span className="wa-chat-header__sub">Grupo</span> : null}
        </div>
      </header>
      <div className="wa-messages" data-testid="chat-messages">
        {chat.messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} contact={contact} allMessages={chat.messages} />
        ))}
      </div>
    </div>
  )
}
