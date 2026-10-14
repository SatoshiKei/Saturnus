import { contactById } from '../../data/mockContacts'
import type { ChatThread } from '../../types/messaging'
import { usePhoneSession } from '../../app/PhoneSessionContext'
import { openWhatsAppChat } from '../../lib/phoneRouter'
import { Avatar } from '../../components/Avatar'

interface ChatListProps {
  chats: ChatThread[]
}

export function ChatList({ chats }: ChatListProps) {
  const { push } = usePhoneSession()

  return (
    <ul className="wa-chat-list" role="list">
      {chats.map((chat) => {
        const contact = contactById[chat.contactId]
        const title = chat.isGroup ? (chat.groupTitle ?? contact.name) : contact.name
        return (
          <li key={chat.id}>
            <button
              type="button"
              className="wa-chat-row"
              data-testid={`chat-row-${chat.contactId}`}
              onClick={() => push(openWhatsAppChat(chat.id))}
            >
              <Avatar contact={contact} size={48} />
              <span className="wa-chat-row__body">
                <span className="wa-chat-row__top">
                  <span className="wa-chat-row__name">{title}</span>
                  <span className="wa-chat-row__time">{chat.lastTime}</span>
                </span>
                <span className="wa-chat-row__bottom">
                  <span className="wa-chat-row__preview">{chat.lastPreview}</span>
                  {chat.unreadCount ? (
                    <span className="wa-chat-row__badge" aria-label={`${chat.unreadCount} não lidas`}>
                      {chat.unreadCount}
                    </span>
                  ) : null}
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
