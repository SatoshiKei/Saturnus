import { describe, expect, it } from 'vitest'
import { mockContacts } from '../../src/data/mockContacts'
import { mockChats, getChatById } from '../../src/data/mockChats'
import { mockNotes } from '../../src/data/mockNotes'
import { sceneObjects } from '../../src/data/sceneComposition'

describe('mock data', () => {
  it('has at least 8 contacts and 6 active chats', () => {
    expect(mockContacts.length).toBeGreaterThanOrEqual(8)
    const active = mockChats.filter((c) => !c.archived)
    expect(active.length).toBeGreaterThanOrEqual(6)
  })

  it('includes varied message types in mariana chat', () => {
    const chat = getChatById('chat-mariana')
    expect(chat).toBeDefined()
    const kinds = new Set(chat!.messages.map((m) => m.kind))
    expect(kinds.has('audio')).toBe(true)
    expect(kinds.has('text')).toBe(true)
  })

  it('has deleted, forwarded, reply, image, group, archived', () => {
    expect(getChatById('chat-jana')!.messages.some((m) => m.kind === 'deleted')).toBe(true)
    const valter = getChatById('chat-valter-long')!
    expect(valter.messages.some((m) => m.kind === 'text' && m.forwarded)).toBe(true)
    expect(valter.messages.some((m) => m.kind === 'text' && m.replyTo)).toBe(true)
    expect(getChatById('chat-elisa')!.messages.some((m) => m.kind === 'image')).toBe(true)
    expect(getChatById('chat-grupo-bar')!.isGroup).toBe(true)
    expect(mockChats.some((c) => c.archived)).toBe(true)
  })

  it('notes list is non-empty', () => {
    expect(mockNotes.length).toBeGreaterThanOrEqual(5)
  })

  it('scene has phone object with unique ids', () => {
    const ids = sceneObjects.map((o) => o.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(sceneObjects.some((o) => o.kind === 'phone')).toBe(true)
  })
})
