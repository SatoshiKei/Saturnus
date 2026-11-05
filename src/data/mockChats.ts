import { block01MarianaChats } from './block01/marianaChats'
import { chatScripts } from './chatScripts'
import type { InvestigationState } from '../game/types'
import type { ChatThread } from '../types/messaging'

/** Conversas do celular profissional de Augusto (fora do Bloco 1 principal). */
const augustoChats: ChatThread[] = [
  {
    id: 'chat-rafael-augusto',
    contactId: 'rafael',
    lastPreview: 'Toque para iniciar conversa',
    lastTime: '—',
    messages: [],
  },
  {
    id: 'chat-paula-augusto',
    contactId: 'paula',
    lastPreview: 'Toque para iniciar conversa',
    lastTime: '—',
    messages: [],
  },
  {
    id: 'chat-camila-augusto',
    contactId: 'camila',
    lastPreview: 'Recebi o arquivo',
    lastTime: '18:10',
    messages: [
      {
        id: 'ca-aug-1',
        kind: 'text',
        from: 'them',
        text: 'Delegado, segue o que consegui separar do prontuário.',
        timestamp: '18:08',
      },
      {
        id: 'ca-aug-2',
        kind: 'text',
        from: 'them',
        text: 'Recebi o arquivo',
        timestamp: '18:10',
      },
    ],
  },
  {
    id: 'chat-mariana-augusto',
    contactId: 'mariana',
    lastPreview: 'Toque para abrir',
    lastTime: '—',
    messages: [],
  },
]

export const mockChats: ChatThread[] = [...block01MarianaChats, ...augustoChats]

export const activeChats = mockChats.filter((c) => !c.archived)
export const archivedChats = mockChats.filter((c) => c.archived)

export function getChatById(id: string, state?: InvestigationState): ChatThread | undefined {
  const script = chatScripts[id]
  if (script && state?.phones.augusto.unlockedChatIds.includes(id)) {
    // Conversas iniciadas pelo jogador: o fio vem do progresso salvo (começa vazio).
    const messages = state.chatProgress[id]?.messages ?? []
    const last = [...messages].reverse().find((m) => m.kind === 'text' || m.kind === 'audio')
    return {
      id,
      contactId: script.contactId,
      lastPreview: !last ? 'Toque para iniciar conversa' : last.kind === 'text' ? last.text.split('\n')[0] : 'Áudio',
      lastTime: last && 'timestamp' in last ? last.timestamp : '—',
      messages,
    }
  }
  // Fios com mensagens injetadas (ex.: Mariana → Augusto no Bloco 9).
  if (state?.phones.augusto.unlockedChatIds.includes(id)) {
    const base = mockChats.find((c) => c.id === id)
    if (!base) return undefined
    const messages = state.chatProgress[id]?.messages ?? base.messages
    const last = [...messages].reverse().find((m) => m.kind === 'text' || m.kind === 'audio')
    return {
      id,
      contactId: base.contactId ?? 'mariana',
      lastPreview: !last
        ? base.lastPreview ?? '—'
        : last.kind === 'text'
          ? last.text.split('\n')[0]
          : 'Áudio',
      lastTime: last && 'timestamp' in last ? last.timestamp : '—',
      messages,
      unreadCount: base.unreadCount,
    }
  }
  return mockChats.find((c) => c.id === id)
}
