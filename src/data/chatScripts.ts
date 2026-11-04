import type { StoryActionRef } from '../game/types'

/**
 * Conversas que o jogador inicia no celular de Augusto. Cada etapa oferece 2–3 formulações
 * cosméticas: qualquer uma envia o mesmo conteúdo narrativo e leva ao mesmo estado.
 * O fio começa vazio — nada de histórico pré-escrito de uma conversa que Augusto nunca teve.
 */
export type ScriptReply =
  | { kind: 'text'; text: string }
  | { kind: 'audio'; id: string; audioSrc: string; durationSec: number }

export interface ScriptStep {
  /** Formulações possíveis (cosméticas). */
  options: string[]
  replies: ScriptReply[]
}

export interface ChatScript {
  chatId: string
  contactId: string
  /** Minuto inicial do relógio dos balões (HH, MM). */
  startTime: [number, number]
  /** Texto exibido no campo antes de a conversa começar. */
  emptyHint: string
  steps: ScriptStep[]
  onComplete: StoryActionRef[]
}

export const paulaScript: ChatScript = {
  chatId: 'chat-paula-augusto',
  contactId: 'paula',
  startTime: [15, 18],
  emptyHint: 'Nenhuma mensagem ainda. Escreva para Paula.',
  steps: [
    {
      options: [
        'Delegado Augusto Nogueira, Polícia Civil. Estou investigando o desaparecimento de Mariana Silva.',
        'Sou Augusto, da Polícia Civil. Preciso falar com você sobre a Mariana.',
        'Polícia Civil. Seu número apareceu entre os contatos de Mariana. Pode conversar?',
      ],
      replies: [{ kind: 'text', text: 'Ela tá bem?' }],
    },
    {
      options: [
        'Ainda estamos tentando localizar Mariana. Preciso entender o que ela estava fazendo antes de desaparecer.',
        'Ainda não sabemos. Quero entender o que ela fazia nos últimos dias.',
      ],
      replies: [{ kind: 'text', text: 'Tá.' }],
    },
    {
      options: [
        'Ela pediu alguma coisa incomum recentemente?',
        'Mariana te pediu ajuda com alguma coisa nos últimos dias?',
      ],
      replies: [{ kind: 'text', text: 'Ela tava procurando um cara.' }],
    },
    {
      options: ['Quem?', 'Procurando quem?'],
      replies: [{ kind: 'text', text: 'Lucas.' }],
    },
    {
      options: ['Sobrenome?', 'Sabe o sobrenome dele?'],
      replies: [{ kind: 'text', text: 'Moreira.' }],
    },
    {
      options: ['Você conhece ele?', 'Vocês dois conheciam esse Lucas?'],
      replies: [{ kind: 'text', text: 'Não.\nNem ela conhecia.' }],
    },
    {
      options: ['Então por que Mariana pediu sua ajuda?', 'Por que ela procurou você, então?'],
      replies: [
        {
          kind: 'text',
          text: 'Porque eu ainda tenho contato com gente da faculdade.\nEla sabia que ele tinha estudado lá.',
        },
      ],
    },
    {
      options: ['E vocês encontraram?', 'Conseguiram falar com ele?'],
      replies: [{ kind: 'text', text: 'Eu consegui o Instagram.\nPassei pra ela.' }],
    },
    {
      options: ['Ela falou o que queria com ele?', 'Disse por que queria falar com ele?'],
      replies: [{ kind: 'text', text: 'Não direito.\nDisse que era coisa antiga da família.' }],
    },
  ],
  onComplete: [
    { type: 'setFlag', id: 'block02_paula_chat_done', value: true },
    { type: 'addEvidence', id: 'paula_leads_lucas' },
    { type: 'discoverPerson', id: 'lucas', status: 'contactable' },
  ],
}

export const rafaelScript: ChatScript = {
  chatId: 'chat-rafael-augusto',
  contactId: 'rafael',
  startTime: [10, 2],
  emptyHint: 'Nenhuma mensagem ainda. Escreva para Rafael.',
  steps: [
    {
      options: [
        'Rafael? Delegado Augusto Nogueira. Estou investigando o desaparecimento de Mariana Silva.',
        'Aqui é o delegado Augusto, da Polícia Civil. Você é o Rafael, amigo da Mariana?',
        'Rafael, Polícia Civil. Preciso falar sobre Mariana Silva.',
      ],
      replies: [{ kind: 'text', text: 'Delegado?\nCaralho.\nEla sumiu mesmo então?' }],
    },
    {
      options: ['Por que “mesmo”?', 'Como assim, “mesmo”?'],
      replies: [
        {
          kind: 'text',
          text: 'A Júlia me chamou ontem perguntando se eu sabia onde ela tava.\nEu achei que ela só tinha desligado o celular ou sei lá.',
        },
      ],
    },
    {
      options: ['Quando foi a última vez que você falou com ela?', 'Quando vocês se falaram pela última vez?'],
      replies: [{ kind: 'text', text: 'Sábado.\nPor mensagem.' }],
    },
    {
      options: ['Vocês estavam falando de uma gravação.', 'Vi que vocês trocaram uma gravação.'],
      replies: [{ kind: 'text', text: 'Tá com o celular dela?' }],
    },
    {
      options: [
        'Estou com o que foi apreendido no apartamento. O arquivo que ela mandou não está mais no aparelho.',
        'Estou com o celular. O arquivo sumiu do aparelho.',
      ],
      replies: [{ kind: 'text', text: 'Eu ainda tenho aqui.' }],
    },
    {
      options: ['Pode encaminhar para este número?', 'Consegue me mandar uma cópia?'],
      replies: [
        { kind: 'text', text: 'Mando agora.' },
        { kind: 'audio', id: 'r2-audio-forward', audioSrc: '/assets/audio/rafael-forward-block02.wav', durationSec: 34 },
      ],
    },
    {
      options: ['O que Mariana queria descobrir?', 'O que ela queria com essa gravação?'],
      replies: [{ kind: 'text', text: 'Quem tava trabalhando no lugar quando isso foi gravado.' }],
    },
    {
      options: ['Que lugar?', 'Qual lugar?'],
      replies: [{ kind: 'text', text: 'Eu falei pra ela que parecia o Vértice.' }],
    },
    {
      options: ['Parecia?', 'Você tem certeza?'],
      replies: [
        { kind: 'text', text: 'Trabalho com som, não sou vidente.\nTem coisa ali que lembra o sistema antigo deles.' },
      ],
    },
    {
      options: ['Mariana disse de onde tirou a gravação?', 'Ela contou como conseguiu isso?'],
      replies: [
        { kind: 'text', text: 'Disse que sabia de onde veio.\nNão disse como conseguiu.' },
        { kind: 'text', text: 'Perguntei.\nEla mudou de assunto.' },
      ],
    },
  ],
  onComplete: [{ type: 'setFlag', id: 'block02_rafael_chat_done', value: true }],
}

export const chatScripts: Record<string, ChatScript> = {
  [paulaScript.chatId]: paulaScript,
  [rafaelScript.chatId]: rafaelScript,
}

export function formatClock(startTime: [number, number], minutesAfter: number): string {
  const total = startTime[0] * 60 + startTime[1] + minutesAfter
  const h = Math.floor(total / 60) % 24
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
