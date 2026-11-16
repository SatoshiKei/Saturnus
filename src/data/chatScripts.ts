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
      options: [
        'Rafael? Aqui é o delegado Augusto Nogueira. Estou com o celular da Mariana.',
        'Rafael. Polícia Civil. A Mariana sumiu e preciso do que ficou no telefone dela.',
        'Rafael, não some no meio da conversa. É o Augusto.',
      ],
      replies: [{ kind: 'text', text: 'KRL! Ela sumiu mesmo então?' }],
      repliesByOption: [
        [
          {
            kind: 'text',
            text: 'Porra.\nEntão não era exagero de grupo.\nEla sumiu mesmo.',
          },
        ],
        [
          {
            kind: 'text',
            text: 'Cara, eu já vi os áudios no grupo.\nSó queria que vocês desmentissem.\nMas não desmentiram.',
          },
        ],
        [
          {
            kind: 'text',
            text: 'Augusto. Relaxa.\nTô aqui.\nE sim, ela sumiu.',
          },
        ],
      ],
    },
    {
      options: [
        'Ainda estamos procurando. No aparelho dela há registro de um áudio que ela te mandou e que não está mais no celular.',
        'Ela sumiu e o arquivo que te mandou evaporou do telefone. Isso não me agrada.',
        'Traduz pra mim: existe conversa sua, não existe arquivo no celular dela?',
      ],
      replies: [{ kind: 'text', text: 'O áudio.' }],
      repliesByOption: [
        [
          {
            kind: 'text',
            text: 'O áudio da balada.\nA gravação que ela queria que eu ouvisse.',
          },
        ],
        [
          {
            kind: 'text',
            text: 'Sumiu daí, sim.\nDaqui eu ainda tenho.\nÓbvio.',
          },
        ],
        [
          {
            kind: 'text',
            text: 'WhatsApp mutila arquivo, não apaga do meu lado.\nÉ o áudio da noite no clube, Augusto.',
          },
        ],
      ],
    },
    {
      options: [
        'Você ainda conserva uma cópia desse material?',
        'Você guarda tudo ou fez backup só dessa?',
        'Mesmo depois desse tempo você ainda tem ou apagou na madrugada?',
      ],
      replies: [{ kind: 'text', text: 'Tenho.' }],
      repliesByOption: [
        [{ kind: 'text', text: 'Tenho. Original, sem passar de novo pelo zap.' }],
        [{ kind: 'text', text: 'Tenho.\nE guardo coisa pior sem motivo.' }],
        [
          {
            kind: 'text',
            text: 'Augusto, eu tenho projeto de Ableton de 2017.\nClaro que eu tenho.',
          },
        ],
      ],
    },
    {
      options: [
        'Confirma que é a mesma gravação que você ouviu antes de responder à Mariana?',
        'Não vai me mandar de novo aquela sua mensagem de voz e chamar de evidência?',
        'É o áudio da balada ou mais um PTT teu filosofando em grave?',
      ],
      replies: [{ kind: 'text', text: 'É.' }],
      repliesByOption: [
        [
          {
            kind: 'text',
            text: 'É a mesma.\nNão é minha voz, é o ambiente que ela mandou.',
          },
        ],
        [
          {
            kind: 'text',
            text: 'Vai se foder.\nNão é meu áudio.\nÉ a gravação dela.',
          },
        ],
        [
          {
            kind: 'text',
            text: 'Não sou eu falando.\nÉ o clube, com o PA todo espremido no celular.',
          },
        ],
      ],
    },
    {
      options: [
        'Preciso de uma cópia íntegra para o inquérito.',
        'Me manda. E não pelo WhatsApp de novo, se der.',
        'Manda aí. Prometo não julgar teu disco rígido.',
      ],
      replies: [
        { kind: 'text', text: 'Tá.\nSó um segundo.' },
        RAFAEL_FORWARD_AUDIO,
        { kind: 'text', text: 'É esse.' },
      ],
      repliesByOption: [
        [
          { kind: 'text', text: 'Tá. Um segundo.\nSem recompressão feia.' },
          RAFAEL_FORWARD_AUDIO,
          { kind: 'text', text: 'É esse. O que eu ouvi na época.' },
        ],
        [
          { kind: 'text', text: 'Pera aí.' },
          RAFAEL_FORWARD_AUDIO,
          { kind: 'text', text: 'Pronto.\nÉ o arquivo da balada.' },
        ],
        [
          { kind: 'text', text: 'Segura.' },
          RAFAEL_FORWARD_AUDIO,
          { kind: 'text', text: 'É esse.\nBoa sorte limpando isso.' },
        ],
      ],
    },
    {
      options: [
        'Mariana chegou a dizer por que queria saber quem estava trabalhando naquela noite?',
        'Ela te deu motivo ou só pediu nome e calou?',
        'Traduz: por que ela queria saber quem estava no turno?',
      ],
      replies: [{ kind: 'text', text: 'Não.' }],
      repliesByOption: [
        [{ kind: 'text', text: 'Não.\nSó pediu pra ouvir e depois apertou no nome.' }],
        [{ kind: 'text', text: 'Não.\nMotivo ela não deu.' }],
        [{ kind: 'text', text: 'Não em português claro.\nTipo, zero.' }],
      ],
    },
    {
      options: [
        'Você chegou a perguntar o motivo?',
        'E você deixou passar?',
        'Você insistiu ou deixou ela desviar?',
      ],
      replies: [{ kind: 'text', text: 'Perguntei.\nEla desviou.' }],
      repliesByOption: [
        [{ kind: 'text', text: 'Perguntei.\nEla mudou de assunto.' }],
        [
          {
            kind: 'text',
            text: 'Não deixei passar.\nEla que não respondeu.\nPerguntei, ela desviou.',
          },
        ],
        [
          {
            kind: 'text',
            text: 'Insisti uma vez.\nEla soltou um "depois" e foi dormir no emoji.\nDesviou.',
          },
        ],
      ],
    },
    {
      options: [
        'Quanto você confia na identificação dela? Consegue associar isso a algum lugar?',
        'Ela jurava o Vértice ou você reconheceu o som pra mostrar serviço?',
        'Certo. Agora em português: de onde veio esse barulho?',
      ],
      replies: [
        {
          kind: 'text',
          text: 'Ela disse que sabia de onde vinha.\nEu reconheci coisa do sistema de lá e falei que batia.',
        },
      ],
      repliesByOption: [
        [
          {
            kind: 'text',
            text: 'Ela disse que sabia de onde vinha.\nEu bati o limiter abrindo quando entra voz, o grave, o sub.\nVértice.\nE não, não estou chutando.',
          },
        ],
        [
          {
            kind: 'text',
            text: 'Mostrar serviço?\nCara, passei noite demais naquele PA ouvindo techno ruim em equipamento bom.\nEla falou Vértice, eu ouvi e confirmei.\nNa prática bate.',
          },
        ],
        [
          {
            kind: 'text',
            text: 'Em português: essa porra é do Vértice.\nO sub daquele lugar parecia querer desmontar teu esterno.\nEla acertou no lugar.',
          },
        ],
      ],
    },
    {
      options: [
        'Ela disse mais alguma coisa sobre esse áudio?',
        'Ficou alguma pista além do lugar?',
        'Só isso, ou ela soltou mais papo de mesa de som?',
      ],
      replies: [{ kind: 'text', text: 'Só que precisava de um nome.' }],
      repliesByOption: [
        [{ kind: 'text', text: 'Só que precisava de um nome.' }],
        [{ kind: 'text', text: 'Nada útil.\nSó que precisava de um nome.' }],
        [
          {
            kind: 'text',
            text: 'Papo de mesa de som não.\nSó que precisava de um nome.',
          },
        ],
      ],
    },
    {
      options: [
        'Nome de quem exatamente?',
        'Que nome ela queria?',
        'Nome pra quê, Rafael?',
      ],
      replies: [{ kind: 'text', text: 'De quem estava trabalhando.' }],
      repliesByOption: [
        [{ kind: 'text', text: 'De quem estava trabalhando naquela noite.' }],
        [{ kind: 'text', text: 'De quem estava no turno.\nQuem estava trabalhando.' }],
        [
          {
            kind: 'text',
            text: 'De quem estava trabalhando.\nNão era DJ, era operação da casa.',
          },
        ],
      ],
    },
    {
      options: [
        'Certo. Anotado.',
        'Tá. Não vou inventar que você colaborou de bom grado.',
        'Beleza. Valeu pelo áudio, mesmo com o sarcasmo.',
      ],
      replies: [{ kind: 'text', text: 'Delegado.' }],
      repliesByOption: [
        [{ kind: 'text', text: 'Delegado.' }],
        [
          {
            kind: 'text',
            text: 'Eu colaboro.\nSó não gosto de arquivo mutilado.\nDelegado.',
          },
        ],
        [{ kind: 'text', text: 'O sarcasmo é de graça.\nDelegado.' }],
      ],
    },
    {
      options: ['Fala.', 'Tem mais alguma coisa?', 'Só isso?'],
      replies: [{ kind: 'text', text: 'Se achar ela, me avisa.' }],
      repliesByOption: [
        [{ kind: 'text', text: 'Se achar ela, me avisa.' }],
        [
          {
            kind: 'text',
            text: 'Só isso.\nSe achar ela, me avisa.',
          },
        ],
        [
          {
            kind: 'text',
            text: 'Por enquanto sim.\nSe achar ela, me avisa.',
          },
        ],
      ],
    },
    {
      options: [
        'Aviso sim que a encontrarmos.',
        'Pode deixar.',
        'Se eu achar antes de você, também te falo.',
      ],
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
