import { block01MarianaChats } from './block01/marianaChats'
import { paulaAugustoBlock02Thread } from './block02/paulaAugustoChat'
import { rafaelAugustoBlock02Thread } from './block02/rafaelAugustoChat'
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
]

export const mockChats: ChatThread[] = [...block01MarianaChats, ...augustoChats]

export const activeChats = mockChats.filter((c) => !c.archived)
export const archivedChats = mockChats.filter((c) => c.archived)

export function getChatById(id: string, state?: InvestigationState): ChatThread | undefined {
  const augustoUnlocked = state?.phones.augusto.unlockedChatIds ?? []
  if (augustoUnlocked.includes('chat-rafael-augusto') && id === 'chat-rafael-augusto') {
    return rafaelAugustoBlock02Thread
  }
  if (augustoUnlocked.includes('chat-paula-augusto') && id === 'chat-paula-augusto') {
    return paulaAugustoBlock02Thread
  }
  return mockChats.find((c) => c.id === id)
}
