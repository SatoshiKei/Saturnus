import type { StoryActionRef } from '../game/types'
import type { ChatMessage } from '../types/messaging'

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
  /**
   * Se definido, a conversa só avança quando o predicado for verdadeiro.
   * Usado p.ex. para exigir a 1ª visita ao Vértice antes de Rafael enviar o P3.
   */
  requiresFlagsAll?: string[]
}

/** Respostas do step para a opção escolhida (com fallback). */
export function repliesForOption(step: ScriptStep, optionIndex: number): ScriptReply[] {
  const byOpt = step.repliesByOption?.[optionIndex]
  if (byOpt && byOpt.length) return byOpt
  return step.replies
}

/** Mensagens geradas ao escolher `optionIndex` no step `stepIndex` (minha + respostas). */
export function buildScriptStepMessages(
  script: ChatScript,
  stepIndex: number,
  optionIndex: number,
): { mine: ChatMessage; replies: ChatMessage[] } | null {
  const step = script.steps[stepIndex]
  if (!step) return null
  const chatId = script.chatId
  const stamp = (n: number) => formatClock(script.startTime, stepIndex * 2 + n)
  const mine: ChatMessage = {
    id: `${chatId}-s${stepIndex}-me`,
    kind: 'text',
    from: 'me',
    text: step.options[optionIndex],
    timestamp: stamp(0),
    status: 'read',
  }
  const replies: ChatMessage[] = repliesForOption(step, optionIndex).map((r, j) =>
    r.kind === 'text'
      ? {
          id: `${chatId}-s${stepIndex}-r${j}`,
          kind: 'text',
          from: 'them',
          text: r.text,
          timestamp: stamp(1),
        }
      : {
          id: r.id,
          kind: 'audio',
          from: 'them',
          audioSrc: r.audioSrc,
          durationSec: r.durationSec,
          playableUntilSec: r.playableUntilSec,
          timestamp: stamp(1),
          showAvatar: true,
        },
  )
  return { mine, replies }
}

export const paulaScript: ChatScript = {
  chatId: 'chat-paula-augusto',
  contactId: 'paula',
  startTime: [15, 18],
  emptyHint: 'Nenhuma mensagem ainda. Escreva para Paula.',
  steps: [
    {
      // Abertura — formal / direta / seca. Mesma resposta de Paula.
      options: [
        'Paula? Aqui é o delegado Augusto Nogueira. Estou investigando o desaparecimento de Mariana Silva.',
        'Paula, sou Augusto Nogueira, da Polícia Civil. Preciso te perguntar uma coisa sobre a Mariana.',
        'Paula? Polícia Civil. É sobre Mariana Silva.',
      ],
      replies: [{ kind: 'text', text: 'Ela apareceu?' }],
    },
    {
      options: [
        'Ainda não. Estou tentando reconstruir o que ela vinha fazendo antes de desaparecer. Ela te pediu ajuda com alguma coisa fora do normal?',
        'Ainda não. Quero entender o que ela andava fazendo. Ela te pediu alguma coisa fora do normal?',
        'Ainda não. Ela te pediu alguma coisa estranha nos últimos tempos?',
      ],
      replies: [{ kind: 'text', text: 'Pediu pra eu achar uma pessoa.' }],
    },
    {
      options: ['Quem?', 'Achar quem?', 'Quem era a pessoa?'],
      replies: [{ kind: 'text', text: 'Lucas Moreira.' }],
    },
    {
      options: ['Você conhecia?', 'Você já conhecia esse Lucas?', 'Conhecia ele de algum lugar?'],
      replies: [{ kind: 'text', text: 'Não.\nEla também não.' }],
    },
    {
      options: [
        'Então por que pediu pra você?',
        'Então por que ela procurou você?',
        'Se ninguém conhecia, por que você?',
      ],
      replies: [
        {
          kind: 'text',
          text: 'Porque eu ainda falo com gente da faculdade e ela sabia que ele tinha estudado lá.',
        },
      ],
    },
    {
      options: ['Conseguiu encontrar?', 'E vocês acharam ele?', 'Conseguiram localizar?'],
      replies: [{ kind: 'text', text: 'Achei o Instagram e passei pra ela.' }],
    },
    {
      options: [
        'Ela disse por que queria falar com ele?',
        'Ela explicou o que queria com ele?',
        'Ela chegou a dizer o motivo?',
      ],
      replies: [{ kind: 'text', text: 'Só falou que era uma coisa antiga da família.\nNão forcei.' }],
    },
    {
      options: ['Você ainda tem o perfil?', 'Ainda tem o perfil dele?', 'Pode me mandar o perfil?'],
      replies: [{ kind: 'text', text: 'Tenho.\nTe mando.' }],
    },
  ],
  onComplete: [
    { type: 'setFlag', id: 'block02_paula_chat_done', value: true },
    { type: 'addEvidence', id: 'paula_leads_lucas' },
    { type: 'discoverPerson', id: 'lucas', status: 'contactable' },
  ],
}

/** Asset real do áudio de Rafael→Mariana (Puzzle 02 / IAPETUS) — só no celular dela. */
export const RAFAEL_VERTICE_AUDIO_SRC =
  '/assets/audio/forensic/puzzle02/rafael_1610_2147_full.mp3'
/** Truncamento no WhatsApp — o final do Vértice só na bancada após rebuild. */
export const RAFAEL_VERTICE_PLAYABLE_UNTIL_SEC = 22.26
export const RAFAEL_VERTICE_DURATION_SEC = 33

/** Gravação da balada (P3) — Rafael → Augusto. NÃO é a voz do P2. */
export const RAFAEL_CLUB_AUDIO_SRC =
  '/assets/audio/forensic/puzzle03/rec_vtx_old_01_final.mp3'
export const RAFAEL_CLUB_DURATION_SEC = 180

/**
 * Áudio enviado por Rafael a Augusto = cópia da gravação da balada (P3).
 * Id legado `r2-audio-forward` mantido para saves/progresso de chat.
 */
export const RAFAEL_FORWARD_AUDIO: Extract<ScriptReply, { kind: 'audio' }> = {
  kind: 'audio',
  id: 'r2-audio-forward',
  audioSrc: RAFAEL_CLUB_AUDIO_SRC,
  durationSec: RAFAEL_CLUB_DURATION_SEC,
}

/** Alias explícito do mesmo anexo. */
export const RAFAEL_CLUB_AUDIO = RAFAEL_FORWARD_AUDIO

export const rafaelScript: ChatScript = {
  chatId: 'chat-rafael-augusto',
  contactId: 'rafael',
  startTime: [10, 2],
  emptyHint: 'Nenhuma mensagem ainda. Escreva para Rafael.',
  /** Pedido da gravação da balada só após a 1ª visita (arquivos históricos confirmados). */
  requiresFlagsAll: ['block02_vertice_archive'],
  steps: [
    {
      // Abertura — formal / direta / seca. Mesma resposta de Rafael.
      options: [
        'Rafael? Aqui é o delegado Augusto Nogueira. Estou com o celular da Mariana.',
        'Rafael, sou Augusto Nogueira, da Polícia Civil. Preciso falar sobre a Mariana.',
        'Rafael? Polícia Civil. É sobre a Mariana.',
      ],
      replies: [{ kind: 'text', text: 'Ela sumiu mesmo?' }],
    },
    {
      options: [
        'Ainda estamos procurando por ela. Eu vi a conversa de vocês no telefone. Tem um arquivo que ela te mandou e que não está mais no aparelho.',
        'Ainda estamos procurando. Vi a conversa de vocês: o arquivo que ela te mandou sumiu do aparelho.',
        'Ainda procurando. Um arquivo que ela te mandou não está mais no telefone dela.',
      ],
      replies: [{ kind: 'text', text: 'O áudio.' }],
    },
    {
      options: ['Você ainda tem?', 'Ainda tem esse áudio?', 'Tem aí?'],
      replies: [{ kind: 'text', text: 'Tenho.' }],
    },
    {
      options: [
        'É a mesma gravação que você ouviu antes de mandar aquela mensagem pra ela?',
        'É a mesma que você ouviu antes de responder pra ela?',
        'É a que você analisou?',
      ],
      replies: [{ kind: 'text', text: 'É.' }],
    },
    {
      options: ['Preciso de uma cópia.', 'Me manda uma cópia.', 'Preciso desse arquivo.'],
      // Não reenvia a mensagem de voz de Rafael (P2): só a gravação da balada.
      replies: [
        { kind: 'text', text: 'Tá.\nSó um segundo.' },
        RAFAEL_FORWARD_AUDIO,
        { kind: 'text', text: 'É esse.' },
      ],
    },
    {
      options: [
        'Mariana disse por que queria saber quem estava trabalhando naquela noite?',
        'Ela disse por que queria saber quem estava trabalhando?',
        'Ela explicou por que queria saber quem estava lá?',
      ],
      replies: [{ kind: 'text', text: 'Não.' }],
    },
    {
      options: ['Você perguntou?', 'Chegou a perguntar?', 'Perguntou a ela?'],
      replies: [{ kind: 'text', text: 'Perguntei.\nEla desviou.' }],
    },
    {
      options: [
        'Ela tinha certeza de que era o Vértice?',
        'Ela tinha certeza do lugar?',
        'Era o Vértice mesmo?',
      ],
      replies: [
        {
          kind: 'text',
          text: 'Ela disse que sabia de onde vinha.\nEu reconheci coisa do sistema de lá e falei que batia.',
        },
      ],
    },
    {
      options: [
        'Mais alguma coisa que ela tenha dito sobre isso?',
        'Ela disse mais alguma coisa?',
        'Mais alguma coisa?',
      ],
      replies: [{ kind: 'text', text: 'Só que precisava de um nome.' }],
    },
    {
      options: ['Que nome?', 'Nome de quem?', 'Qual nome?'],
      replies: [{ kind: 'text', text: 'De quem estava trabalhando.' }],
    },
    {
      options: ['Certo.', 'Entendi.', 'Ok.'],
      replies: [{ kind: 'text', text: 'Delegado.' }],
    },
    {
      options: ['Fala.', 'Pode falar.', 'Diga.'],
      replies: [{ kind: 'text', text: 'Se achar ela, me avisa.' }],
    },
    {
      options: ['Aviso.', 'Aviso, sim.', 'Pode deixar.'],
      replies: [],
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
