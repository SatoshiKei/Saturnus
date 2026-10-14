export type PhoneAppId =
  | 'whatsapp'
  | 'notes'
  | 'calendar'
  | 'photos'
  | 'files'
  | 'phone'
  | 'settings'

export type WhatsAppTab = 'chats' | 'updates' | 'communities' | 'calls' | 'settings'

export type PhoneRoute =
  | { screen: 'home' }
  | { screen: 'app'; appId: PhoneAppId }
  | { screen: 'whatsapp'; tab: WhatsAppTab }
  | { screen: 'whatsapp-archived' }
  | { screen: 'whatsapp-chat'; chatId: string }
  | { screen: 'note'; noteId: string }
  | { screen: 'calendar-event'; eventId: string }

export interface PhoneAppDef {
  id: PhoneAppId
  label: string
  iconClass: string
  placeholder?: boolean
}
