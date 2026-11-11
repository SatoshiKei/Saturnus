import type { StoryActionRef } from '../game/types'

/**
 * Conversas que o jogador inicia no celular de Augusto. Cada etapa oferece 2–3 formulações
 * cosméticas (tons distintos): mesma intenção investigativa, respostas imediatas diferentes,
 * convergência no próximo step. Flags/evidências/`onComplete` não dependem da opção.
 */
export type ScriptReply =
  | { kind: 'text'; text: string }
  | {
      kind: 'audio'
      id: string
      audioSrc: string
      durationSec: number
      playableUntilSec?: number
    }

export interface ScriptStep {
  /** Formulações possíveis (cosméticas) — tons distintos, não paráfrases. */
  options: string[]
  /** Fallback: mesma resposta para qualquer opção. */
  replies: ScriptReply[]
  /**
   * Se presente, opção i usa `repliesByOption[i]`.
   * Sem este campo, usa `replies`.
   */
  repliesByOption?: ScriptReply[][]
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

/** Respostas do step para a opção escolhida (com fallback). */
export function repliesForOption(step: ScriptStep, optionIndex: number): ScriptReply[] {
  const byOpt = step.repliesByOption?.[optionIndex]
  if (byOpt && byOpt.length) return byOpt
  return step.replies
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
      repliesByOption: [
        [{ kind: 'text', text: 'Ela tá bem?' }],
        [{ kind: 'text', text: '…Ela tá bem?' }],
        [{ kind: 'text', text: 'Ok.\nEla tá bem?' }],
      ],
    },
    {
      options: [
        'Ainda estamos tentando localizá-la. Preciso entender o que ela fazia antes de desaparecer.',
        'Ainda não sabemos onde ela está. Quero o que ela andava fazendo.',
        'Não temos ela. Me conta o que rolou nos últimos dias.',
      ],
      replies: [{ kind: 'text', text: 'Tá.' }],
      repliesByOption: [
        [{ kind: 'text', text: 'Tá.\nPode perguntar.' }],
        [{ kind: 'text', text: 'Tá.' }],
        [{ kind: 'text', text: 'Certo.\nManda.' }],
      ],
    },
    {
      options: [
        'Ela pediu alguma coisa incomum recentemente?',
        'Mariana te pediu ajuda com alguma coisa?',
        'Te procurou por algum favor estranho?',
      ],
      replies: [{ kind: 'text', text: 'Ela tava procurando um cara.' }],
      repliesByOption: [
        [{ kind: 'text', text: 'Ela tava procurando um cara.' }],
        [{ kind: 'text', text: 'Pediu.\nTava procurando um cara.' }],
        [{ kind: 'text', text: 'Estranho?\nEla tava atrás de um cara.' }],
      ],
    },
    {
      options: [
        'Quem ela estava procurando?',
        'Procurando quem?',
        'Um cara. Nome?',
      ],
      replies: [{ kind: 'text', text: 'Lucas.' }],
      repliesByOption: [
        [{ kind: 'text', text: 'Lucas.' }],
        [{ kind: 'text', text: 'Lucas.' }],
        [{ kind: 'text', text: 'Lucas.\nSó isso.' }],
      ],
    },
    {
      options: [
        'Você sabe o sobrenome dele?',
        'Lucas o quê?',
        'Lucas Neto?',
      ],
      replies: [{ kind: 'text', text: 'Moreira.' }],
      repliesByOption: [
        [{ kind: 'text', text: 'Moreira.\nLucas Moreira.' }],
        [{ kind: 'text', text: 'Moreira.\nCalma, delegado.' }],
        [{ kind: 'text', text: 'Não.\nMoreira.\nLucas Moreira.' }],
      ],
    },
    {
      options: [
        'Você conhece esse Lucas Moreira?',
        'Vocês dois conheciam ele?',
        'Lucas Moreira — amigo de vocês?',
      ],
      replies: [{ kind: 'text', text: 'Não.\nNem ela conhecia.' }],
      repliesByOption: [
        [{ kind: 'text', text: 'Não.\nNem ela conhecia.' }],
        [{ kind: 'text', text: 'Não.\nEla também não.' }],
        [{ kind: 'text', text: 'Amigo?\nNão.\nNem ela conhecia.' }],
      ],
    },
    {
      options: [
        'Então por que Mariana pediu a sua ajuda?',
        'Por que ela veio falar com você, então?',
        'Se ninguém conhecia, por que você?',
      ],
      replies: [
        {
          kind: 'text',
          text: 'Porque eu ainda tenho contato com gente da faculdade.\nEla sabia que ele tinha estudado lá.',
        },
      ],
      repliesByOption: [
        [
          {
            kind: 'text',
            text: 'Porque eu ainda tenho contato com gente da faculdade.\nEla sabia que ele tinha estudado lá.',
          },
        ],
        [
          {
            kind: 'text',
            text: 'Eu ainda falo com gente da faculdade.\nEla sabia que ele tinha estudado lá.',
          },
        ],
        [
          {
            kind: 'text',
            text: 'Porque eu.\nAinda tenho contato na faculdade.\nEla sabia que ele tinha estudado lá.',
          },
        ],
      ],
    },
    {
      options: [
        'Vocês conseguiram localizá-lo?',
        'E acharam?',
        'Conseguiram falar com ele?',
      ],
      replies: [{ kind: 'text', text: 'Eu consegui o Instagram.\nPassei pra ela.' }],
      repliesByOption: [
        [{ kind: 'text', text: 'Eu consegui o Instagram.\nPassei pra ela.' }],
        [{ kind: 'text', text: 'Achei o Instagram.\nPassei pra ela.' }],
        [{ kind: 'text', text: 'Falar, não.\nConsegui o Instagram e passei pra ela.' }],
      ],
    },
    {
      options: [
        'Ela explicou o que queria com ele?',
        'Disse por que queria falar com ele?',
        '“Coisa antiga da família” — ela usou essas palavras?',
      ],
      replies: [{ kind: 'text', text: 'Não direito.\nDisse que era coisa antiga da família.' }],
      repliesByOption: [
        [{ kind: 'text', text: 'Não direito.\nDisse que era coisa antiga da família.' }],
        [{ kind: 'text', text: 'Quase nada.\nSó que era coisa antiga da família.' }],
        [{ kind: 'text', text: 'Mais ou menos.\nFoi isso que ela disse — coisa antiga da família.' }],
      ],
    },
  ],
  onComplete: [
    { type: 'setFlag', id: 'block02_paula_chat_done', value: true },
    { type: 'addEvidence', id: 'paula_leads_lucas' },
    { type: 'discoverPerson', id: 'lucas', status: 'contactable' },
  ],
}

/** Asset real do áudio de Rafael (Puzzle 02 / IAPETUS). */
export const RAFAEL_VERTICE_AUDIO_SRC =
  '/assets/audio/forensic/puzzle02/rafael_1610_2147_full.mp3'
/** Truncamento no WhatsApp — o final do Vértice só na bancada após rebuild. */
export const RAFAEL_VERTICE_PLAYABLE_UNTIL_SEC = 19.85
export const RAFAEL_VERTICE_DURATION_SEC = 31

/** Áudio do forward Rafael → Augusto (Puzzle 02). Exportado para re-sincronizar saves antigos. */
export const RAFAEL_FORWARD_AUDIO: Extract<ScriptReply, { kind: 'audio' }> = {
  kind: 'audio',
  id: 'r2-audio-forward',
  audioSrc: RAFAEL_VERTICE_AUDIO_SRC,
  durationSec: RAFAEL_VERTICE_DURATION_SEC,
  playableUntilSec: RAFAEL_VERTICE_PLAYABLE_UNTIL_SEC,
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
      repliesByOption: [
        [{ kind: 'text', text: 'Delegado?\nCaralho.\nEla sumiu mesmo então?' }],
        [{ kind: 'text', text: 'Sou.\nCaralho.\nEla sumiu mesmo então?' }],
        [{ kind: 'text', text: 'Delegado.\nCaralho.\nEla sumiu mesmo então?' }],
      ],
    },
    {
      options: [
        'Por que “mesmo”?',
        '“Mesmo” — você já esperava isso?',
        'Fala direito. O que você quis dizer com “mesmo”?',
      ],
      replies: [
        {
          kind: 'text',
          text: 'A Júlia me chamou ontem perguntando se eu sabia onde ela tava.\nEu achei que ela só tinha desligado o celular ou sei lá.',
        },
      ],
      repliesByOption: [
        [
          {
            kind: 'text',
            text: 'A Júlia me chamou ontem perguntando se eu sabia onde ela tava.\nEu achei que ela só tinha desligado o celular ou sei lá.',
          },
        ],
        [
          {
            kind: 'text',
            text: 'Não esperava.\nMas a Júlia me chamou ontem perguntando se eu sabia onde ela tava.\nAchei que era celular desligado.',
          },
        ],
        [
          {
            kind: 'text',
            text: 'Calma.\nA Júlia me ligou ontem perguntando se eu sabia onde ela tava.\nEu achei que ela só tinha desligado o celular.',
          },
        ],
      ],
    },
    {
      options: [
        'Quando foi a última vez que você falou com ela?',
        'Último contato — quando?',
        'Vocês se falaram quando?',
      ],
      replies: [{ kind: 'text', text: 'Sábado.\nPor mensagem.' }],
      repliesByOption: [
        [{ kind: 'text', text: 'Sábado.\nPor mensagem.' }],
        [{ kind: 'text', text: 'Sábado.\nMensagem.' }],
        [{ kind: 'text', text: 'Sábado, por mensagem.' }],
      ],
    },
    {
      options: [
        'Vi no celular dela que vocês trocaram uma gravação.',
        'Vocês estavam falando de uma gravação.',
        'Aquela gravação que ela te mandou — ainda tem?',
      ],
      replies: [{ kind: 'text', text: 'Tá com o celular dela?' }],
      repliesByOption: [
        [{ kind: 'text', text: 'Tá com o celular dela?' }],
        [{ kind: 'text', text: 'Tá.\nVocê tá com o celular dela?' }],
        [{ kind: 'text', text: 'Tenho.\nMas… tá com o celular dela?' }],
      ],
    },
    {
      options: [
        'Estou com o que foi apreendido no apartamento. O arquivo que ela mandou não está mais no aparelho.',
        'Estou com o celular. O arquivo sumiu do aparelho.',
        'Tenho o aparelho. A gravação não está mais lá.',
      ],
      replies: [{ kind: 'text', text: 'Eu ainda tenho aqui.' }],
      repliesByOption: [
        [{ kind: 'text', text: 'Eu ainda tenho aqui.' }],
        [{ kind: 'text', text: 'Sumiu?\nEu ainda tenho aqui.' }],
        [{ kind: 'text', text: 'Beleza.\nEu ainda tenho aqui.' }],
      ],
    },
    {
      options: [
        'Pode encaminhar para este número?',
        'Me manda uma cópia agora.',
        'Consegue me passar o arquivo?',
      ],
      replies: [{ kind: 'text', text: 'Mando agora.' }, RAFAEL_FORWARD_AUDIO],
      repliesByOption: [
        [{ kind: 'text', text: 'Mando agora.' }, RAFAEL_FORWARD_AUDIO],
        [{ kind: 'text', text: 'Já.' }, RAFAEL_FORWARD_AUDIO],
        [{ kind: 'text', text: 'Consigo.\nMando agora.' }, RAFAEL_FORWARD_AUDIO],
      ],
    },
    {
      options: [
        'O que Mariana queria descobrir com essa gravação?',
        'O que ela queria com isso?',
        'Ela te disse o objetivo?',
      ],
      replies: [{ kind: 'text', text: 'Quem tava trabalhando no lugar quando isso foi gravado.' }],
      repliesByOption: [
        [{ kind: 'text', text: 'Quem tava trabalhando no lugar quando isso foi gravado.' }],
        [{ kind: 'text', text: 'Saber quem tava trabalhando no lugar quando isso foi gravado.' }],
        [
          {
            kind: 'text',
            text: 'Disse.\nQuem tava trabalhando no lugar quando isso foi gravado.',
          },
        ],
      ],
    },
    {
      options: [
        'Que lugar era esse?',
        'Qual lugar?',
        'O Vértice, certo?',
      ],
      replies: [{ kind: 'text', text: 'Eu falei pra ela que parecia o Vértice.' }],
      repliesByOption: [
        [{ kind: 'text', text: 'Eu falei pra ela que parecia o Vértice.' }],
        [{ kind: 'text', text: 'Parecia o Vértice.\nFoi o que eu falei pra ela.' }],
        [{ kind: 'text', text: 'Eu acho.\nFalei pra ela que parecia o Vértice.' }],
      ],
    },
    {
      options: [
        'Parecia — ou você tem certeza?',
        'Você tem certeza?',
        '“Parecia” não me ajuda muito.',
      ],
      replies: [
        { kind: 'text', text: 'Trabalho com som, não sou vidente.\nTem coisa ali que lembra o sistema antigo deles.' },
      ],
      repliesByOption: [
        [
          {
            kind: 'text',
            text: 'Trabalho com som, não sou vidente.\nTem coisa ali que lembra o sistema antigo deles.',
          },
        ],
        [
          {
            kind: 'text',
            text: 'Certeza absoluta, não.\nMas tem coisa ali que lembra o sistema antigo deles.',
          },
        ],
        [
          {
            kind: 'text',
            text: 'Eu sei.\nTrabalho com som, não sou vidente.\nTem coisa ali que lembra o sistema antigo deles.',
          },
        ],
      ],
    },
    {
      options: [
        'Mariana disse de onde tirou a gravação?',
        'Ela contou como conseguiu isso?',
        'Origem do arquivo — ela falou?',
      ],
      replies: [
        { kind: 'text', text: 'Disse que sabia de onde veio.\nNão disse como conseguiu.' },
        { kind: 'text', text: 'Perguntei.\nEla mudou de assunto.' },
      ],
      repliesByOption: [
        [
          { kind: 'text', text: 'Disse que sabia de onde veio.\nNão disse como conseguiu.' },
          { kind: 'text', text: 'Perguntei.\nEla mudou de assunto.' },
        ],
        [
          { kind: 'text', text: 'Como, não.\nSó que sabia de onde veio.' },
          { kind: 'text', text: 'Perguntei.\nEla mudou de assunto.' },
        ],
        [
          { kind: 'text', text: 'Falou que sabia de onde veio.\nNão como conseguiu.' },
          { kind: 'text', text: 'Insisti.\nEla mudou de assunto.' },
        ],
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
