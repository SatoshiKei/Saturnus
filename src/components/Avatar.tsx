import type { Contact } from '../types/messaging'
import { contactAvatarSrc } from '../lib/characterSprites'

export function Avatar({
  contact,
  size = 40,
}: {
  contact: Pick<Contact, 'id' | 'initials' | 'avatarHue' | 'name'>
  size?: number
}) {
  const src = contactAvatarSrc(contact.id)
  return (
    <span
      className={`avatar${src ? ' avatar--photo' : ''}`}
      style={{
        width: size,
        height: size,
        background: src ? '#e8e8ed' : `hsl(${contact.avatarHue} 45% 42%)`,
        fontSize: size * 0.36,
      }}
      aria-hidden
    >
      {src ? <img src={src} alt="" /> : contact.initials}
    </span>
  )
}
