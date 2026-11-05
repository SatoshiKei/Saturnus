import type { ChatMessage } from '../../types/messaging'

/** Ondas de mensagens “de Mariana” no WhatsApp de Augusto. */
export const MARIANA_CHAT_ID = 'chat-mariana-augusto'

export const marianaMessagesWave1: ChatMessage[] = [
  {
    id: 'mm-w1-1',
    kind: 'text',
    from: 'them',
    text: 'Augusto. Sou eu.',
    timestamp: '21:04',
  },
  {
    id: 'mm-w1-2',
    kind: 'text',
    from: 'them',
    text: 'Não posso falar por voz ainda. Mas estou bem. Continua.',
    timestamp: '21:05',
  },
  {
    id: 'mm-w1-3',
    kind: 'text',
    from: 'them',
    text: 'Você já viu o que o Geraldo escondeu. Isso importa.',
    timestamp: '21:06',
  },
]

export const marianaMessagesWave2: ChatMessage[] = [
  {
    id: 'mm-w2-1',
    kind: 'text',
    from: 'them',
    text: 'A correspondência do guardrail com as fotos da oficina… você fechou bem.',
    timestamp: '22:18',
  },
  {
    id: 'mm-w2-2',
    kind: 'text',
    from: 'them',
    text: 'Eu não saberia o resultado da reanálise pericial. Mas você sabe. E eu também, agora.',
    timestamp: '22:19',
  },
]

export const marianaMessagesWave3: ChatMessage[] = [
  {
    id: 'mm-w3-1',
    kind: 'text',
    from: 'them',
    text: 'Augusto.',
    timestamp: '00:41',
  },
  {
    id: 'mm-w3-2',
    kind: 'text',
    from: 'them',
    text: 'Ainda estou aqui.',
    timestamp: '00:41',
  },
  {
    id: 'mm-w3-3',
    kind: 'text',
    from: 'them',
    text: 'Pergunta o que quiser. Eu lembro de tudo.',
    timestamp: '00:42',
  },
]
