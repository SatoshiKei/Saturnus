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
    { speaker: 'Augusto', text: 'Morsa. Esse apelido lhe diz alguma coisa?' },
    { speaker: 'Samuel', text: 'Diz.\nO apelido eu conheço.', portrait: 'samuel' },
    { speaker: 'Augusto', text: 'E quem está por trás dele?' },
    {
      speaker: 'Samuel',
      text: 'Eu não vou dar nome.\nNão agora.\nNão pra polícia, e não dentro da minha casa.',
      portrait: 'samuel',
    },
    { speaker: 'Samuel', text: 'Já falei com o senhor mais do que devia, só de abrir essa porta.', portrait: 'samuel' },
  ],
  protests: [
    { speaker: 'Augusto', text: 'O senhor participou dos protestos?' },
    {
      speaker: 'Samuel',
      text: 'Participei.\nMas eu não era do núcleo.\nEu era gente que ia, gritava, voltava pra casa.',
      portrait: 'samuel',
    },
    { speaker: 'Augusto', text: 'Seu nome consta numa lista de detidos.' },
    {
      speaker: 'Samuel',
      text: 'Uns dias depois.\nPor resistência, quando a polícia veio me buscar.\nFiquei detido um tempo e me soltaram.\nNão tem mais nada nisso.',
      portrait: 'samuel',
    },
    { speaker: 'Augusto', text: 'Quem eram os do núcleo?' },
    {
      speaker: 'Samuel',
      text: 'Gente de máscara, pra não ser identificada.\nIsso existiu.\nHouve confronto, houve gente ferida.\nHouve coisa que ninguém quer reabrir.',
      portrait: 'samuel',
    },
  ],
  silence: [
    { speaker: 'Augusto', text: 'Por que o silêncio, depois de seis anos?' },
    {
      speaker: 'Samuel',
      text: 'Porque apontar um é apontar os outros.\nE alguns ainda têm muito a perder.\nEu mesmo levei anos pra reconstruir o que tinha.',
      portrait: 'samuel',
    },
    { speaker: 'Samuel', text: 'Isso foi me custar caro uma vez.\nNão quero pagar de novo.', portrait: 'samuel' },
  ],
  mariana: [
    { speaker: 'Augusto', text: 'Mariana Silva procurou o senhor?' },
    { speaker: 'Samuel', text: 'Procurou.\nFaz semanas.', portrait: 'samuel' },
    { speaker: 'Augusto', text: 'Sobre o Morsa?' },
    {
      speaker: 'Samuel',
      text: 'Sobre o Morsa.\nE sobre a noite dos protestos.',
      portrait: 'samuel',
    },
    { speaker: 'Samuel', text: 'Ela foi educada.\nEu a mandei embora do mesmo jeito.', portrait: 'samuel' },
  ],
  timing: [
    { speaker: 'Augusto', text: 'Ela só queria o nome?' },
    {
      speaker: 'Samuel',
      text: 'Não.\nQueria saber quando ele aparecia.\nQuando sumia.\nPor onde andava.',
      portrait: 'samuel',
    },
    { speaker: 'Augusto', text: 'Como quem monta um horário.' },
    {
      speaker: 'Samuel',
      text: 'Parecia.\nEu não entendi pra quê.\nE não quis entender.',
      portrait: 'samuel',
    },
  ],
}
