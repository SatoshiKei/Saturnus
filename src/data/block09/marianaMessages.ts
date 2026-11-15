import type { ChatMessage } from '../../types/messaging'

/** Ondas de mensagens “de Mariana” no WhatsApp de Augusto. */
export const MARIANA_CHAT_ID = 'chat-mariana-augusto'

/** Abertura da onda 1 — só Mariana; respostas de Augusto vêm do roteiro interativo. */
export const marianaWave1Bootstrap: ChatMessage[] = [
  { id: 'mm-w1-1', kind: 'text', from: 'them', text: 'Augusto?', timestamp: '21:04' },
  { id: 'mm-w1-2', kind: 'text', from: 'them', text: 'Sou eu.', timestamp: '21:04' },
  {
    id: 'mm-w1-3',
    kind: 'text',
    from: 'them',
    text: 'Não liga. Ainda não posso falar.',
    timestamp: '21:05',
  },
]

/** Abertura da onda 2. */
export const marianaWave2Bootstrap: ChatMessage[] = [
  { id: 'mm-w2-1', kind: 'text', from: 'them', text: 'Você achou o carro.', timestamp: '22:18' },
]

/** @deprecated referência legada — use bootstrap + roteiro. */
export const marianaMessagesWave1: ChatMessage[] = marianaWave1Bootstrap

/** @deprecated referência legada */
export const marianaMessagesWave2: ChatMessage[] = marianaWave2Bootstrap

export const marianaMessagesWave3: ChatMessage[] = [
  { id: 'mm-w3-1', kind: 'text', from: 'them', text: 'Augusto.', timestamp: '02:17' },
  { id: 'mm-w3-2', kind: 'text', from: 'them', text: 'Ainda estou aqui.', timestamp: '02:17' },
]

/** Anomalias concretas envolvendo Augusto (após outros casos). */
export const marianaMessagesAnomaly: ChatMessage[] = [
  {
    id: 'mm-anom-1',
    kind: 'text',
    from: 'them',
    text: 'Você ia apagar essa pergunta.',
    timestamp: '01:12',
  },
  {
    id: 'mm-anom-2',
    kind: 'text',
    from: 'them',
    text: 'Na segunda versão você ia perguntar “o que você está fazendo comigo?”.',
    timestamp: '01:13',
  },
  { id: 'mm-anom-3', kind: 'text', from: 'them', text: 'Essa é melhor.', timestamp: '01:13' },
]
