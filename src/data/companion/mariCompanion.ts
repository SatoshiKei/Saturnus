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
  {
    id: 'hub-b02-vertice',
    seenFlag: 'mari_hub_b02_vertice_seen',
    requireFlags: ['block02_vertice_visit_done'],
    blockIfFlags: ['mari_hub_b02_vertice_seen', 'block03_started'],
    lines: [
      {
        speaker: 'Mari',
        portraitId: 'mari',
        text: 'Casa noturna que passou por reforma e troca de gente costuma ter arquivo capenga — igual prateleira de supermercado depois de promoção. Se sobrou alguma coisa daquela época, tá enfiada no canto que ninguém quis limpar.',
      },
      {
        speaker: 'Augusto',
        portraitId: 'augusto',
        text: 'Eles não ajudaram muito hoje.',
      },
      {
        speaker: 'Mari',
        portraitId: 'mari',
        text: 'Normal. Quem vive de madrugada odeia olhar pra cara de alguém antes do almoço.',
      },
    ],
  },
  {
    id: 'hub-b02-elisa-thread',
    seenFlag: 'mari_hub_b02_elisa_seen',
    requireFlags: ['block02_lucas_interview_done', 'block02_vertice_set_crossref'],
    blockIfFlags: ['mari_hub_b02_elisa_seen', 'block03_started'],
    lines: [
      {
        speaker: 'Mari',
        portraitId: 'mari',
        text: 'Quando processo velho entra no meio de caso novo, o pessoal já vem de guarda alta. Todo mundo jura que já deu o recado inteiro e não tem mais nada pra falar.',
      },
      {
        speaker: 'Augusto',
        portraitId: 'augusto',
        text: 'E quase sempre esconde o resto.',
      },
      {
        speaker: 'Mari',
        portraitId: 'mari',
        text: 'Ou só cansou de repetir a mesma ladainha.',
      },
    ],
  },
  {
    id: 'hub-b03-nico',
    seenFlag: 'mari_hub_b03_nico_seen',
    requireFlags: ['block03_nico_interview_done'],
    blockIfFlags: ['mari_hub_b03_nico_seen', 'block04_started'],
    lines: [
      {
        speaker: 'Mari',
        portraitId: 'mari',
        text: 'Gente de cabine e de palco tem uma relação esquisita com relógio — pra eles, a noite só acaba quando apagam a luz ou quando a cabeça pifa.',
      },
      {
        speaker: 'Augusto',
        portraitId: 'augusto',
        text: 'Ele não deu hora certa de nada.',
      },
      {
        speaker: 'Mari',
        portraitId: 'mari',
        text: 'Nunca dão. Só lembram quem tava fazendo barulho e quem sumiu antes da saideira.',
      },
    ],
  },
  {
    id: 'hub-b03-janus',
    seenFlag: 'mari_hub_b03_janus_seen',
    requireFlags: ['block03_janus_done'],
    blockIfFlags: ['mari_hub_b03_janus_seen', 'block04_hexagon_done'],
    lines: [
      {
        speaker: 'Mari',
        portraitId: 'mari',
        text: 'Não é a primeira vez que alguém confunde relógio mal ajustado com verdade absoluta. O Siqueira vivia implicando com horário de log antes de acreditar em papel timbrado.',
      },
      {
        speaker: 'Augusto',
        portraitId: 'augusto',
        text: 'Desta vez o relógio fazia diferença.',
      },
      {
        speaker: 'Mari',
        portraitId: 'mari',
        text: 'Pois é. Até relógio parado acerta duas vezes, mas relógio torto só atrapalha.',
      },
    ],
  },
  {
    id: 'hub-b04-hex-delivery',
    seenFlag: 'mari_hub_b04_hex_seen',
    requireFlags: ['block04_hex_received'],
    blockIfFlags: ['mari_hub_b04_hex_seen', 'block04_hexagon_done'],
    lines: [
      {
        speaker: 'Mari',
        portraitId: 'mari',
        text: 'Ligação muda seguida de pacote solto assim não veio por trâmite normal da casa, não. Alguém fez questão de bater na porta sem deixar cartão de visita.',
      },
      {
        speaker: 'Augusto',
        portraitId: 'augusto',
        text: 'E o fixo tocou direto aqui.',
      },
      {
        speaker: 'Mari',
        portraitId: 'mari',
        text: 'Pois é. Às vezes a delegacia parece caixa de correio de quem não quer dar as caras.',
      },
    ],
  },
  {
    id: 'hub-b04-andre',
    seenFlag: 'mari_hub_b04_andre_seen',
    requireFlags: ['block04_andre_interview_done'],
    blockIfFlags: ['mari_hub_b04_andre_seen', 'block05_started'],
    lines: [
      {
        speaker: 'Mari',
        portraitId: 'mari',
        text: 'Quando preso manda parente parar de mexer no passado, quase nunca é por falta de assunto. Ou tá protegendo alguém, ou tá tentando não deixar estourar outro fio.',
      },
      {
        speaker: 'Augusto',
        portraitId: 'augusto',
        text: 'Ele disse que era pra poupar a irmã.',
      },
      {
        speaker: 'Mari',
        portraitId: 'mari',
        text: 'Pode até ser. Mas cadeia ensina a medir cada palavra antes de soltar.',
      },
    ],
  },
  {
    id: 'hub-b05-jana',
    seenFlag: 'mari_hub_b05_jana_seen',
    requireFlags: ['block05_jana_interview_done'],
    blockIfFlags: ['mari_hub_b05_jana_seen', 'block06_started'],
    lines: [
      {
        speaker: 'Mari',
        portraitId: 'mari',
        text: 'Tem gente que passa anos tentando engessar uma história só pra não ter que encarar a própria parte nela. Quando alguém cutuca, o pessoal reage como se fosse invasão de domicílio.',
      },
      {
        speaker: 'Augusto',
        portraitId: 'augusto',
        text: 'Ela fechou a cara na hora.',
      },
      {
        speaker: 'Mari',
        portraitId: 'mari',
        text: 'Quem quer virar a página não gosta que fiquem passando marca-texto atrás.',
      },
    ],
  },
  {
    id: 'hub-b06-operation',
    seenFlag: 'mari_hub_b06_operation_seen',
    requireFlags: ['block06_operation_done'],
    blockIfFlags: ['mari_hub_b06_operation_seen', 'block07_started'],
    lines: [
      {
        speaker: 'Mari',
        portraitId: 'mari',
        text: 'Operação de madrugada sempre deixa a sala cheirando a café requentado, papel molhado e gente com cara de sono. Pelo menos agora tem gente prestando depoimento em vez de fugir.',
      },
      {
        speaker: 'Augusto',
        portraitId: 'augusto',
        text: 'Falta fazer a história fechar.',
      },
      {
        speaker: 'Mari',
        portraitId: 'mari',
        text: 'Isso nunca vem de bandeja.',
      },
    ],
  },
  {
    id: 'hub-b07-hospital-twist',
    seenFlag: 'mari_hub_b07_hospital_seen',
    requireFlags: ['block07_hospital_deposit_done'],
    blockIfFlags: [
      'mari_hub_b07_hospital_seen',
      'block07_henrique_identified',
      'block08_started',
    ],
    lines: [
      {
        speaker: 'Mari',
        portraitId: 'mari',
        text: 'Quando prontuário velho e nome trocado começam a cruzar caminho, o caso muda de figura num piscar de olhos. Parece que cada gaveta aberta puxa outra que ninguém tinha pedido.',
      },
      {
        speaker: 'Augusto',
        portraitId: 'augusto',
        text: 'E o rastro dela passa por isso.',
      },
      {
        speaker: 'Mari',
        portraitId: 'mari',
        text: 'Passa. E cada vez menos parece coincidência de plantão.',
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
