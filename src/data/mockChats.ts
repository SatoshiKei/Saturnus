import { block01MarianaChats } from './block01/marianaChats'
import { MARIANA_CHAT_ID } from './block09/marianaMessages'
import { chatScripts } from './chatScripts'
import type { InvestigationState } from '../game/types'
import type { ChatThread } from '../types/messaging'
import { resolveMarianaAugustoScript } from './block09/marianaAugustoChatScripts'

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
  {
    id: 'chat-anon-augusto',
    contactId: 'unknown',
    lastPreview: 'Toque para abrir',
    lastTime: '—',
    messages: [],
  },
]

export const mockChats: ChatThread[] = [...block01MarianaChats, ...augustoChats]

export const activeChats = mockChats.filter((c) => !c.archived)
export const archivedChats = mockChats.filter((c) => c.archived)

function marianaUnreadCount(state: InvestigationState): number {
  if (!state.phones.augusto.unlockedChatIds.includes(MARIANA_CHAT_ID)) return 0
  const msgs = state.chatProgress[MARIANA_CHAT_ID]?.messages ?? []
  if (state.flags.block09_messages_wave1 && !state.flags.block09_messages_wave1_read) {
    return msgs.length > 0 ? 1 : 0
  }
  if (
    state.flags.block09_messages_wave2 &&
    !state.flags.block09_messages_impossible_done &&
    resolveMarianaAugustoScript(state)
  ) {
    const prog = state.chatProgress[MARIANA_CHAT_ID]
    if (prog && !prog.done && msgs.length > 0) return 1
  }
  if (state.flags.block09_messages_wave3 && !state.flags.block09_post_death_message_read) {
    return msgs.some((m) => m.id === 'mm-w3-1' || m.id === 'mm-w3-2') ? 1 : 0
  }
  return 0
}

export function getChatById(id: string, state?: InvestigationState): ChatThread | undefined {
  const script = id === MARIANA_CHAT_ID && state ? resolveMarianaAugustoScript(state) : chatScripts[id]
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
    const unread =
      id === MARIANA_CHAT_ID ? marianaUnreadCount(state) : (base.unreadCount ?? 0)
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
      unreadCount: unread,
      pinned: id === MARIANA_CHAT_ID && unread > 0 ? true : undefined,
    }
  }
  return mockChats.find((c) => c.id === id)
}
