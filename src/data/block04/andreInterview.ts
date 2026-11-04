export type AndreTopicId = 'mariana' | 'elisa' | 'stop' | 'maralto' | 'trust'

export const ANDRE_TOPIC_IDS: AndreTopicId[] = [
  'mariana',
  'elisa',
  'stop',
  'maralto',
  'trust',
]

export const andreTopicLabels: Record<AndreTopicId, string> = {
  mariana: 'Contato com Mariana',
  elisa: 'Mudança sobre o caso',
  stop: 'O que você pediu a ela',
  maralto: 'Maralto e protestos',
  trust: 'Por que falar comigo',
}

export const andreTopicFlags: Record<AndreTopicId, string> = {
  mariana: 'block04_andre_mariana',
  elisa: 'block04_andre_elisa',
  stop: 'block04_andre_stop',
  maralto: 'block04_andre_maralto',
  trust: 'block04_andre_trust',
}

export type AndreBeat = { speaker?: string; text: string; portrait?: 'andre' }

export const andreBeats: Record<AndreTopicId, AndreBeat[]> = {
  mariana: [
    { speaker: 'Augusto', text: 'Mariana voltou a te procurar.' },
    {
      speaker: 'André',
      text: 'Voltou.\nDepois de anos fingindo que eu não existia.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'Você aceitou a visita?' },
    {
      speaker: 'André',
      text: 'Aceitei.\nUma vez.\nTalvez duas.\nNão sei o que ela queria de verdade.',
      portrait: 'andre',
    },
  ],
  elisa: [
    { speaker: 'Augusto', text: 'Ela passou a dizer que você era inocente?' },
    {
      speaker: 'André',
      text: 'Do nada.\nAnos acreditando no contrário.\nAí começa a perguntar sobre Elisa como se o processo fosse mentira.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'Você incentivou?' },
    {
      speaker: 'André',
      text: 'Eu falei pra ela parar.',
      portrait: 'andre',
    },
  ],
  stop: [
    { speaker: 'Augusto', text: 'Parar de quê?' },
    {
      speaker: 'André',
      text: 'De mexer no caso.\nDe me usar pra se sentir útil.\nDe reabrir o que já me enterrou.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'E ela parou?' },
    {
      speaker: 'André',
      text: 'Não parece.\nVocê tá aqui.',
      portrait: 'andre',
    },
  ],
  maralto: [
    { speaker: 'Augusto', text: 'Maralto Granéis. Protestos. Morsa.' },
    {
      speaker: 'André',
      text: 'Não sei o que você quer ouvir.\nNão tenho nada disso pra te dar.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'Mariana mencionou?' },
    {
      speaker: 'André',
      text: 'Mariana mencionava Elisa.\nO resto eu não acompanhei.',
      portrait: 'andre',
    },
  ],
  trust: [
    { speaker: 'Augusto', text: 'Preciso entender o que ela estava fazendo.' },
    {
      speaker: 'André',
      text: 'Você precisa fechar um desaparecimento.\nEu preciso sobreviver a uma condenação.\nNão somos aliados.',
      portrait: 'andre',
    },
  ],
}
