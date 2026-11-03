export type PhoneAppId =
  | 'whatsapp'
  | 'notes'
  | 'calendar'
  | 'photos'
  | 'files'
  | 'phone'
  | 'settings'
  | 'recorder'
  | 'browser'
  | 'appstore'
  | 'hidden-diary'
  | 'wavelab-mobile'

export type WhatsAppTab = 'chats' | 'updates' | 'communities' | 'calls' | 'settings'

export type PhoneRoute =
  | { screen: 'home' }
  | { screen: 'app'; appId: PhoneAppId }
  | { screen: 'whatsapp'; tab: WhatsAppTab }
  | { screen: 'whatsapp-archived' }
  | { screen: 'whatsapp-chat'; chatId: string }
  | { screen: 'note'; noteId: string }
  | { screen: 'calendar-event'; eventId: string }
  | { screen: 'appstore' }
  | { screen: 'recorder' }
  | { screen: 'wavelab' }
  | { screen: 'hidden-diary' }
  | { screen: 'device-settings' }
  | { screen: 'files-browser' }

export interface PhoneAppDef {
  id: PhoneAppId
  label: string
  iconClass: string
  placeholder?: boolean
}
