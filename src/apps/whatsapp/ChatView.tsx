import { useEffect, useState } from 'react'
import { addEvidence, completeTask, unlockContact } from '../../game/state/investigationStore'
import { contactById } from '../../data/mockContacts'
import { getChatById } from '../../data/mockChats'
import { phoneFeatureLocks } from '../../data/phoneFeatures'
import { Avatar } from '../../components/Avatar'
import { ChatComposer } from './ChatComposer'
import { ImageLightbox } from './ImageLightbox'
import { MessageBubble } from './MessageBubble'

interface ChatViewProps {
  chatId: string
  onBack: () => void
}

export function ChatView({ chatId, onBack }: ChatViewProps) {
  const chat = getChatById(chatId)
  const [lightbox, setLightbox] = useState<{ src: string; alt: string; caption?: string } | null>(
    null,
  )
  const [composerHint, setComposerHint] = useState<string | null>(null)

  useEffect(() => {
    if (chatId === 'chat-rafael') {
      addEvidence('rafael_audio_01')
      unlockContact('contact-rafael')
    }
    if (chatId === 'chat-julia') {
      completeTask('task_mariana_phone')
    }
  }, [chatId])

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
        <Avatar contact={contact} size={36} />
        <div className="wa-chat-header__title">
          <span className="wa-chat-header__name">{title}</span>
          {chat.isGroup ? (
            <span className="wa-chat-header__sub">toque para info do grupo</span>
          ) : (
            <span className="wa-chat-header__sub">online</span>
          )}
        </div>
        <div className="wa-chat-header__actions">
          <button
            type="button"
            className="wa-chat-header__action"
            aria-label="Vídeo chamada"
            aria-disabled={phoneFeatureLocks.videoCall}
            disabled={phoneFeatureLocks.videoCall}
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              <path
                fill="currentColor"
                d="M17 10.5V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-3.5l4 4v-11l-4 4z"
              />
            </svg>
          </button>
          <button
            type="button"
            className="wa-chat-header__action"
            aria-label="Ligação"
            aria-disabled={phoneFeatureLocks.voiceCall}
            disabled={phoneFeatureLocks.voiceCall}
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              <path
                fill="currentColor"
                d="M6.6 10.8c1.4 2.8 3.4 5.2 6 6.8l2-2c.3-.3.8-.4 1.2-.2 1 .4 2.1.7 3.2.7.7 0 1.2.5 1.2 1.2V20c0 .7-.5 1.2-1.2 1.2C9.2 21.2 2.8 14.8 2.8 6.8 2.8 6.1 3.3 5.6 4 5.6c1.1 0 2.2.3 3.2.7.4.2.9.1 1.2-.2l2-2z"
              />
            </svg>
          </button>
        </div>
      </header>
      <div className="wa-messages" data-testid="chat-messages">
        {chat.messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            contact={contact}
            allMessages={chat.messages}
            onImageOpen={(src, alt, caption) => setLightbox({ src, alt, caption })}
          />
        ))}
      </div>
      <div className="wa-chat-view__footer">
        {composerHint ? (
          <p className="wa-composer-hint" role="status">
            {composerHint}
          </p>
        ) : null}
        <ChatComposer
          onBlockedAction={() => {
            setComposerHint('Envio bloqueado nesta fase do projeto.')
            window.setTimeout(() => setComposerHint(null), 2400)
          }}
        />
      </div>
      {lightbox ? (
        <ImageLightbox
          src={lightbox.src}
          alt={lightbox.alt}
          caption={lightbox.caption}
          onClose={() => setLightbox(null)}
        />
      ) : null}
    </div>
  )
}
