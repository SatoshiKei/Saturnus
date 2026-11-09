import type { ChatMessage } from '../../types/messaging'

/** Ondas de mensagens “de Mariana” no WhatsApp de Augusto. */
export const MARIANA_CHAT_ID = 'chat-mariana-augusto'

export const marianaMessagesWave1: ChatMessage[] = [
  { id: 'mm-w1-1', kind: 'text', from: 'them', text: 'Augusto?', timestamp: '21:04' },
  { id: 'mm-w1-2', kind: 'text', from: 'them', text: 'Sou eu.', timestamp: '21:04' },
  {
    id: 'mm-w1-3',
    kind: 'text',
    from: 'them',
    text: 'Não liga. Ainda não posso falar.',
    timestamp: '21:05',
  },
  { id: 'mm-w1-4', kind: 'text', from: 'me', text: 'Onde você está?', timestamp: '21:05' },
  { id: 'mm-w1-5', kind: 'text', from: 'them', text: 'Segura mais um pouco.', timestamp: '21:06' },
  {
    id: 'mm-w1-6',
    kind: 'text',
    from: 'me',
    text: 'Mariana, eu preciso saber se você está em segurança.',
    timestamp: '21:06',
  },
  { id: 'mm-w1-7', kind: 'text', from: 'them', text: 'Estou.', timestamp: '21:07' },
  { id: 'mm-w1-8', kind: 'text', from: 'them', text: 'Continua.', timestamp: '21:07' },
]

export const marianaMessagesWave2: ChatMessage[] = [
  { id: 'mm-w2-1', kind: 'text', from: 'them', text: 'Você achou o carro.', timestamp: '22:18' },
  { id: 'mm-w2-2', kind: 'text', from: 'me', text: 'Como sabe disso?', timestamp: '22:18' },
  { id: 'mm-w2-3', kind: 'text', from: 'them', text: 'Porque você continuou.', timestamp: '22:19' },
  {
    id: 'mm-w2-4',
    kind: 'text',
    from: 'me',
    text: 'O resultado da perícia saiu depois do seu desaparecimento.',
    timestamp: '22:19',
  },
  { id: 'mm-w2-5', kind: 'text', from: 'them', text: 'Eu sei.', timestamp: '22:20' },
  {
    id: 'mm-w2-6',
    kind: 'text',
    from: 'me',
    text: 'Quem está usando este número?',
    timestamp: '22:20',
  },
  {
    id: 'mm-w2-7',
    kind: 'text',
    from: 'them',
    text: 'Você ainda pergunta isso como se tivesse certeza da resposta anterior.',
    timestamp: '22:21',
  },
]

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
