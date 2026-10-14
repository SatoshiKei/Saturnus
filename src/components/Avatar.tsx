import type { Contact } from '../types/messaging'

export function Avatar({
  contact,
  size = 40,
}: {
  contact: Pick<Contact, 'initials' | 'avatarHue' | 'name'>
  size?: number
}) {
  return (
    <span
      className="avatar"
      style={{
        width: size,
        height: size,
        background: `hsl(${contact.avatarHue} 45% 42%)`,
        fontSize: size * 0.36,
      }}
      aria-hidden
    >
      {contact.initials}
    </span>
  )
}
