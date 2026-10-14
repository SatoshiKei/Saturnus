import { assetPath } from '../../lib/assetPath'
import type { ChatMessage } from '../../types/messaging'

type ImageMsg = Extract<ChatMessage, { kind: 'image' }>

export function ImageMessage({ message }: { message: ImageMsg }) {
  return (
    <figure className="wa-image-msg">
      <img src={assetPath(message.imageSrc)} alt={message.caption ?? 'Imagem enviada'} />
      {message.caption ? <figcaption>{message.caption}</figcaption> : null}
    </figure>
  )
}
