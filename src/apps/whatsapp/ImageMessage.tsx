import { resolveChatMediaSrc } from '../../lib/characterSprites'
import type { ChatMessage } from '../../types/messaging'

type ImageMsg = Extract<ChatMessage, { kind: 'image' }>

interface ImageMessageProps {
  message: ImageMsg
  onOpen?: (src: string, alt: string, caption?: string) => void
}

export function ImageMessage({ message, onOpen }: ImageMessageProps) {
  const alt = message.caption ?? 'Imagem enviada'

  return (
    <figure className="wa-image-msg">
      <button
        type="button"
        className="wa-image-msg__btn"
        aria-label="Ampliar imagem"
        data-testid="image-message-open"
        onClick={() => onOpen?.(message.imageSrc, alt, message.caption)}
      >
        <img src={resolveChatMediaSrc(message.imageSrc)} alt={alt} />
      </button>
      {message.caption ? <figcaption>{message.caption}</figcaption> : null}
    </figure>
  )
}
