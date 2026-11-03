import { describe, expect, it } from 'vitest'
import { getChatById } from '../../src/data/mockChats'
import { mockNotes } from '../../src/data/mockNotes'

describe('mock data — Bloco 1', () => {
  it('includes Rafael chat with audio and media-missing', () => {
    const chat = getChatById('chat-rafael')
    expect(chat).toBeDefined()
    const kinds = new Set(chat!.messages.map((m) => m.kind))
    expect(kinds.has('audio')).toBe(true)
    expect(kinds.has('media-missing')).toBe(true)
  })

  it('includes Júlia chat with text messages', () => {
    const chat = getChatById('chat-julia')
    expect(chat).toBeDefined()
    expect(chat!.messages.some((m) => m.kind === 'text')).toBe(true)
  })

  it('mariana block notes count', () => {
    expect(mockNotes.length).toBeGreaterThanOrEqual(4)
  })
})
