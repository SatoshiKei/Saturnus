import { describe, expect, it } from 'vitest'
import {
  currentRoute,
  navigateBack,
  openApp,
  openNote,
  openWhatsAppChat,
  phoneHome,
  pushRoute,
  resolveAppFromRoute,
} from '../../src/lib/phoneRouter'

describe('phoneRouter', () => {
  it('starts at home', () => {
    expect(currentRoute([phoneHome()])).toEqual({ screen: 'home' })
  })

  it('opens apps and chats', () => {
    let stack = [phoneHome()]
    stack = pushRoute(stack, openApp('whatsapp'))
    expect(currentRoute(stack)).toEqual({ screen: 'app', appId: 'whatsapp' })
    stack = pushRoute(stack, openWhatsAppChat('chat-mariana'))
    expect(resolveAppFromRoute(currentRoute(stack))).toBe('whatsapp')
    stack = navigateBack(stack)
    expect(currentRoute(stack).screen).toBe('app')
  })

  it('opens notes and calendar routes', () => {
    expect(openNote('n1')).toEqual({ screen: 'note', noteId: 'n1' })
    expect(resolveAppFromRoute(openApp('calendar'))).toBe('calendar')
  })

  it('does not pop below one route', () => {
    expect(navigateBack([phoneHome()])).toHaveLength(1)
  })
})
