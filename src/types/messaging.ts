export type MessageDeliveryStatus = 'sent' | 'delivered' | 'read'

export type ChatMessage =
  | {
      id: string
      kind: 'text'
      from: 'me' | 'them'
      text: string
      timestamp: string
      status?: MessageDeliveryStatus
      replyTo?: string
      forwarded?: boolean
    }
  | {
      id: string
      kind: 'image'
      from: 'me' | 'them'
      imageSrc: string
      caption?: string
      timestamp: string
      status?: MessageDeliveryStatus
    }
  | {
      id: string
      kind: 'audio'
      from: 'me' | 'them'
      audioSrc: string
      durationSec: number
      timestamp: string
      status?: MessageDeliveryStatus
      showAvatar?: boolean
    }
  | {
      id: string
      kind: 'deleted'
      from: 'me' | 'them'
      timestamp: string
    }
  | {
      id: string
      kind: 'date-separator'
      label: string
    }
  | {
      id: string
      kind: 'media-missing'
      from: 'me' | 'them'
      label: string
      timestamp: string
    }

export interface Contact {
  id: string
  name: string
  avatarHue: number
  initials: string
}

export interface ChatThread {
  id: string
  contactId: string
  isGroup?: boolean
  groupTitle?: string
  archived?: boolean
  unreadCount?: number
  lastPreview: string
  lastTime: string
  pinned?: boolean
  messages: ChatMessage[]
}
