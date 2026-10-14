import type { PhoneAppId, PhoneRoute, WhatsAppTab } from '../types/phone'

export function phoneHome(): PhoneRoute {
  return { screen: 'home' }
}

export function openApp(appId: PhoneAppId): PhoneRoute {
  return { screen: 'app', appId }
}

export function openWhatsApp(tab: WhatsAppTab = 'chats'): PhoneRoute {
  return { screen: 'whatsapp', tab }
}

export function openWhatsAppArchived(): PhoneRoute {
  return { screen: 'whatsapp-archived' }
}

export function openWhatsAppChat(chatId: string): PhoneRoute {
  return { screen: 'whatsapp-chat', chatId }
}

export function openNote(noteId: string): PhoneRoute {
  return { screen: 'note', noteId }
}

export function openCalendarEvent(eventId: string): PhoneRoute {
  return { screen: 'calendar-event', eventId }
}

export function navigateBack(stack: PhoneRoute[]): PhoneRoute[] {
  if (stack.length <= 1) return stack
  return stack.slice(0, -1)
}

export function pushRoute(stack: PhoneRoute[], route: PhoneRoute): PhoneRoute[] {
  return [...stack, route]
}

export function currentRoute(stack: PhoneRoute[]): PhoneRoute {
  return stack[stack.length - 1] ?? phoneHome()
}

export function resolveAppFromRoute(route: PhoneRoute): string | null {
  if (route.screen === 'app') return route.appId
  if (route.screen === 'whatsapp' || route.screen === 'whatsapp-archived') return 'whatsapp'
  if (route.screen === 'whatsapp-chat') return 'whatsapp'
  if (route.screen === 'note') return 'notes'
  if (route.screen === 'calendar-event') return 'calendar'
  return null
}
