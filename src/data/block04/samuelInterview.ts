export type SamuelTopicId = 'morsa' | 'protests' | 'silence' | 'mariana' | 'timing'

export const SAMUEL_TOPIC_IDS: SamuelTopicId[] = [
  'morsa',
  'protests',
  'silence',
  'mariana',
  'timing',
]

export const samuelTopicLabels: Record<SamuelTopicId, string> = {
  morsa: 'Quem era Morsa',
  protests: 'O núcleo dos protestos',
  silence: 'Por que ninguém fala',
  mariana: 'Visita de Mariana',
  timing: 'O que ela queria saber',
}

export const samuelTopicFlags: Record<SamuelTopicId, string> = {
  morsa: 'block04_samuel_morsa',
  protests: 'block04_samuel_protests',
  silence: 'block04_samuel_silence',
  mariana: 'block04_samuel_mariana',
  timing: 'block04_samuel_timing',
}

export type SamuelBeat = { speaker?: string; text: string; portrait?: 'samuel' }

export const samuelBeats: Record<SamuelTopicId, SamuelBeat[]> = {
  morsa: [
    { speaker: 'Augusto', text: 'Morsa. Você conhece esse nome?' },
    { speaker: 'Samuel', text: 'Conheço o apelido.', portrait: 'samuel' },
    { speaker: 'Augusto', text: 'E a pessoa?' },
    {
      speaker: 'Samuel',
      text: 'Não vou dar nome.\nNão agora.\nNão pra polícia.',
      portrait: 'samuel',
    },
  ],
  protests: [
    { speaker: 'Augusto', text: 'Ele fazia parte do núcleo mais radical?' },
    {
      speaker: 'Samuel',
      text: 'Fazia.\nMáscara.\nEvitar identificação.\nIsso existiu.',
      portrait: 'samuel',
    },
    { speaker: 'Augusto', text: 'Houve crimes?' },
    {
      speaker: 'Samuel',
      text: 'Houve confrontos.\nHouve gente ferida.\nHouve coisas que ninguém quer reabrir.',
      portrait: 'samuel',
    },
  ],
  silence: [
    { speaker: 'Augusto', text: 'Por que o silêncio depois de seis anos?' },
    {
      speaker: 'Samuel',
      text: 'Porque apontar alguém aponta outros.\nE porque alguns ainda têm o que perder.',
      portrait: 'samuel',
    },
  ],
  mariana: [
    { speaker: 'Augusto', text: 'Mariana Silva te procurou?' },
    { speaker: 'Samuel', text: 'Procurou.\nHá semanas.', portrait: 'samuel' },
    { speaker: 'Augusto', text: 'Sobre Morsa?' },
    {
      speaker: 'Samuel',
      text: 'Sobre Morsa.\nE sobre a noite dos protestos.',
      portrait: 'samuel',
    },
  ],
  timing: [
    { speaker: 'Augusto', text: 'Ela só queria o nome?' },
    {
      speaker: 'Samuel',
      text: 'Não.\nQuerida saber quando aparecia.\nQuando sumia.\nMovimentação.',
      portrait: 'samuel',
    },
    { speaker: 'Augusto', text: 'Como se montasse um horário.' },
    {
      speaker: 'Samuel',
      text: 'Parecia.\nEu não entendi pra quê.\nE não quis entender.',
      portrait: 'samuel',
    },
  ],
}
