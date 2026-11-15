import type { ChatScript } from '../chatScripts'
import { MARIANA_CHAT_ID } from './marianaMessages'
import type { InvestigationState } from '../../game/types'

export const marianaAugustoWave1Script: ChatScript = {
  chatId: MARIANA_CHAT_ID,
  contactId: 'mariana',
  startTime: [21, 4],
  emptyHint: 'Mariana enviou mensagens novas.',
  steps: [
    {
      options: ['Onde você está?', 'Mariana, onde você está agora?', 'Diga onde está.'],
      replies: [{ kind: 'text', text: 'Segura mais um pouco.' }],
    },
    {
      options: [
        'Mariana, eu preciso saber se você está em segurança.',
        'Você está em segurança?',
        'Preciso saber se você está bem.',
      ],
      replies: [{ kind: 'text', text: 'Estou.' }, { kind: 'text', text: 'Continua.' }],
    },
  ],
  onComplete: [],
}

export const marianaAugustoWave2Script: ChatScript = {
  chatId: MARIANA_CHAT_ID,
  contactId: 'mariana',
  startTime: [22, 18],
  emptyHint: 'Nova mensagem de Mariana.',
  steps: [
    {
      options: ['Como sabe disso?', 'Como você sabe?', 'De onde veio isso?'],
      replies: [{ kind: 'text', text: 'Porque você continuou.' }],
    },
    {
      options: [
        'O resultado da perícia saiu depois do seu desaparecimento.',
        'A perícia saiu depois que você sumiu.',
        'Isso só fechou depois do seu desaparecimento.',
      ],
      replies: [{ kind: 'text', text: 'Eu sei.' }],
    },
    {
      options: [
        'Quem está usando este número?',
        'Quem fala por este número?',
        'Quem é você neste chat?',
      ],
      replies: [
        {
          kind: 'text',
          text: 'Você ainda pergunta isso como se tivesse certeza da resposta anterior.',
        },
      ],
    },
  ],
  onComplete: [],
}

/** Roteiro ativo no WhatsApp de Augusto (ondas 1 e 2); onda 3 é só leitura. */
export function resolveMarianaAugustoScript(
  state: InvestigationState,
): ChatScript | undefined {
  if (!state.flags.block09_messages_wave1 || state.flags.block09_messages_wave1_read) {
    if (
      state.flags.block09_messages_wave2 &&
      !state.flags.block09_messages_impossible_done
    ) {
      return marianaAugustoWave2Script
    }
    return undefined
  }
  const prog = state.chatProgress[MARIANA_CHAT_ID]
  if (prog?.done) return undefined
  return marianaAugustoWave1Script
}