import { useEffect } from 'react'
import { Avatar } from '../../components/Avatar'
import { onUnknownCallerNumberSeen } from '../../game/story/block04PhoneHooks'
import type { Contact } from '../../types/messaging'
import type { ChatThread } from '../../types/messaging'

export function ChatProfileSheet({
  contact,
  chat,
  device,
  onClose,
}: {
  contact: Contact
  chat: ChatThread
  device: 'mariana' | 'augusto'
  onClose: () => void
}) {
  useEffect(() => {
    if (device === 'mariana' && contact.id === 'unknown') onUnknownCallerNumberSeen()
  }, [contact.id, device])

  const media = chat.messages.filter((m) => m.kind === 'image').length
  const savedName = contact.name

  return (
    <div className="wa-profile" data-testid="wa-chat-profile" role="dialog" aria-modal="true">
      <header className="wa-profile__head">
        <button type="button" className="wa-header__back" onClick={onClose} aria-label="Voltar ao chat">
          ‹
        </button>
        <span>Dados do contato</span>
      </header>
      <div className="wa-profile__hero">
        <Avatar contact={contact} size={96} />
        <p className="wa-profile__name">{savedName}</p>
        {contact.phone ? (
          <p className="wa-profile__phone" data-testid="wa-profile-phone">
            {contact.phone}
          </p>
        ) : null}
        {contact.about ? <p className="wa-profile__about">{contact.about}</p> : null}
      </div>
      <ul className="wa-profile__meta">
        <li>
          <span className="wa-profile__label">Na agenda</span>
          <span>{savedName === 'Sem nome' ? 'Não salvo' : savedName}</span>
        </li>
        {contact.phone ? (
          <li>
            <span className="wa-profile__label">Telefone</span>
            <span>{contact.phone}</span>
          </li>
        ) : null}
        <li>
          <span className="wa-profile__label">Mídia</span>
          <span>{media ? `${media} foto${media === 1 ? '' : 's'}` : 'Nenhuma'}</span>
        </li>
      </ul>
    </div>
  )
}
