import type { ChatMessage, Contact } from '../../types/messaging'
import { Avatar } from '../../components/Avatar'
import { AudioMessage } from './AudioMessage'
import { ImageMessage } from './ImageMessage'

interface MessageBubbleProps {
  message: ChatMessage
  contact: Contact
  allMessages: ChatMessage[]
  onImageOpen?: (src: string, alt: string, caption?: string) => void
  onAudioPlay?: () => void
}

function findReplyText(allMessages: ChatMessage[], replyTo?: string): string | undefined {
  if (!replyTo) return undefined
  const ref = allMessages.find((m) => m.id === replyTo)
  if (!ref || ref.kind === 'date-separator') return undefined
  if (ref.kind === 'text') return ref.text
  if (ref.kind === 'image') return ref.caption ?? 'Foto'
  if (ref.kind === 'audio') return 'Áudio'
  return 'Mensagem'
}

export function MessageBubble({ message, contact, allMessages, onImageOpen, onAudioPlay }: MessageBubbleProps) {
  if (message.kind === 'date-separator') {
    return (
      <div className="wa-date-sep" role="separator">
        {message.label}
      </div>
    )
  }

  const outgoing = message.from === 'me'

  if (message.kind === 'deleted') {
    return (
      <div className={`wa-row wa-row--${outgoing ? 'out' : 'in'}`}>
        <div className="wa-bubble wa-bubble--deleted">
          <span className="wa-bubble__deleted-icon" aria-hidden>
            🚫
          </span>
          Mensagem apagada
          <span className="wa-bubble__meta">{message.timestamp}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`wa-row wa-row--${outgoing ? 'out' : 'in'}`} data-message-id={message.id}>
      {!outgoing && message.kind === 'audio' && message.showAvatar ? (
        <span className="wa-row__avatar">
          <Avatar contact={contact} size={28} />
        </span>
      ) : (
        <span className="wa-row__avatar-spacer" />
      )}
      <div
        className={`wa-bubble wa-bubble--${message.kind}${outgoing ? ' wa-bubble--out wa-bubble--tail-out' : ' wa-bubble--tail-in'}`}
      >
        {message.kind === 'text' && message.forwarded ? (
          <span className="wa-bubble__forwarded">Encaminhada</span>
        ) : null}
        {message.kind === 'text' && message.replyTo ? (
          <span className="wa-bubble__quote">{findReplyText(allMessages, message.replyTo)}</span>
        ) : null}
        {message.kind === 'text' ? <p>{message.text}</p> : null}
        {message.kind === 'image' ? (
          <ImageMessage message={message} onOpen={onImageOpen} />
        ) : null}
        {message.kind === 'media-missing' ? (
          <p className="wa-bubble__missing">{message.label}</p>
        ) : null}
        {message.kind === 'audio' ? <AudioMessage message={message} onPlayStart={onAudioPlay} /> : null}
        <span className="wa-bubble__meta">
          {message.timestamp}
          {outgoing && message.kind === 'text' && message.status ? (
            <span className={`wa-checks wa-checks--${message.status}`} aria-label={message.status}>
              ✓✓
            </span>
          ) : null}
        </span>
      </div>
    </div>
  )
}
