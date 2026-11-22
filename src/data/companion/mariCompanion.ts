/**
 * Beats diegéticos da Mari no hub (cotidiano).
 * Dicas na Bancada: mariPuzzleHints.ts + MariWorkbenchHints.
 */

import type { InvestigationState } from '../../game/types'

export type MariCompanionBeat = {
  id: string
  seenFlag: string
  requireFlags?: string[]
  blockIfFlags?: string[]
  /** Local precisa estar neste status (todos os pares). */
  requireLocations?: Array<{ id: string; status: string }>
  lines: Array<{
    speaker?: string
    text: string
    portraitId?: 'mari' | 'augusto'
    narration?: boolean
  }>
}

export const MARI_COMPANION_BEATS: MariCompanionBeat[] = [
  {
    id: 'hub-welcome',
    seenFlag: 'mari_hub_welcome_seen',
    requireFlags: ['block01_opening_seen'],
    blockIfFlags: ['mari_hub_welcome_seen', 'block01_bo_registered'],
    lines: [
      {
        speaker: 'Mari',
        portraitId: 'mari',
        text: 'A pasta amarela é a dela. O fixo tem o ramal da central se quiser ouvir a ligação de novo.',
      },
      {
        speaker: 'Mari',
        portraitId: 'mari',
        text: 'Eu fico do lado de cá. Se o senhor se perder no material, me chama — eu conheço onde a casa esconde as coisas.',
      },
      {
        speaker: 'Augusto',
        portraitId: 'augusto',
        text: 'Certo.',
      },
    ],
  },
  {
    id: 'hub-b01-after-bo',
    seenFlag: 'mari_hub_b01_bo_seen',
    requireFlags: ['block01_bo_registered'],
    blockIfFlags: ['mari_hub_b01_bo_seen'],
    lines: [
      {
        speaker: 'Mari',
        portraitId: 'mari',
        text: 'O registro subiu pro sistema. Quando o Siqueira pegava ocorrência assim de madrugada, a primeira coisa que ele pedia era saber quem tinha mexido no horário antes de bater o ponto.',
      },
      {
        speaker: 'Augusto',
        portraitId: 'augusto',
        text: 'E aqui?',
      },
      {
        speaker: 'Mari',
        portraitId: 'mari',
        text: 'Aqui o papel já chegou carimbado. O resto está no que sobrou do aparelho.',
      },
    ],
  },
  {
    id: 'hub-b01-after-emg',
    seenFlag: 'mari_hub_b01_emg_seen',
    requireFlags: ['block01_bo_registered'],
    blockIfFlags: ['mari_hub_b01_emg_seen', 'block01_emergency_provisional'],
    lines: [
      {
        speaker: 'Mari',
        portraitId: 'mari',
        text: 'A linha da central pega um chiado feio quando entra sinal fraco. Não é o primeiro áudio que chega parecendo que alguém falou dentro de um corredor de vento.',
      },
      {
        speaker: 'Augusto',
        portraitId: 'augusto',
        text: 'Mesmo assim tem voz ali.',
      },
      {
        speaker: 'Mari',
        portraitId: 'mari',
        text: 'Tem. Só exige paciência de quem não desliga na metade.',
      },
    ],
  },
  {
    id: 'hub-b01-after-phone',
    seenFlag: 'mari_hub_b01_phone_seen',
    requireFlags: ['block01_mariana_phone_opened'],
    blockIfFlags: ['mari_hub_b01_phone_seen', 'block01_complete'],
    lines: [
      {
        speaker: 'Mari',
        portraitId: 'mari',
        text: 'Celular de plantonista costuma ter meia dúzia de conversa picada e lembrete de troca de turno. Quando começa a faltar ponta solta, geralmente não é só distração.',
      },
      {
        speaker: 'Augusto',
        portraitId: 'augusto',
        text: 'Vamos ver o que o hospital diz.',
      },
    ],
  },
  {
    id: 'hub-b01-before-hospital',
    seenFlag: 'mari_hub_b01_hospital_seen',
    requireLocations: [{ id: 'hospital', status: 'visitAvailable' }],
    blockIfFlags: ['mari_hub_b01_hospital_seen', 'block01_hospital_done', 'block01_complete'],
    lines: [
      {
        speaker: 'Mari',
        portraitId: 'mari',
        text: 'No hospital o pessoal fala rápido entre uma porta e outra. Se for falar com eles, deixa o ritmo assentar antes de apertar o assunto.',
      },
      {
        speaker: 'Augusto',
        portraitId: 'augusto',
        text: 'Certo. Tô saindo.',
      },
    ],
  },
]

export type MariCompanionPickContext = {
  flags: Record<string, boolean>
  locations?: InvestigationState['locations']
}

export function pickMariCompanionBeat(ctx: MariCompanionPickContext): MariCompanionBeat | null {
  for (const beat of MARI_COMPANION_BEATS) {
    if (ctx.flags[beat.seenFlag]) continue
    if (beat.requireFlags?.some((f) => !ctx.flags[f])) continue
    if (beat.blockIfFlags?.some((f) => ctx.flags[f])) continue
    if (beat.requireLocations?.length) {
      const ok = beat.requireLocations.every((need) => {
        const loc = ctx.locations?.[need.id]
        return loc?.status === need.status
      })
      if (!ok) continue
    }
    return beat
  }
  return null
}
