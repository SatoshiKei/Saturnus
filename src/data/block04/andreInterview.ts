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
    { speaker: 'Augusto', text: 'Obrigado por aceitar a visita, André.' },
    { speaker: 'André', text: 'Eu aceitei?\nMe avisaram que tinha um policial.\nÉ diferente.', portrait: 'andre' },
    { speaker: 'Augusto', text: 'Sua irmã voltou a procurar o senhor.' },
    {
      speaker: 'André',
      text: 'Voltou.\nDepois de anos fingindo que eu não existia.\nIsso lá é pergunta ou é constatação?',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'Ela veio mais de uma vez?' },
    {
      speaker: 'André',
      text: 'Uma.\nTalvez duas.\nEu perdi a conta do que conta aqui dentro.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'Sabe o que ela queria?' },
    { speaker: 'André', text: 'Se eu soubesse, o senhor estaria perguntando?', portrait: 'andre' },
  ],
  elisa: [
    { speaker: 'Augusto', text: 'Ela passou a dizer que o senhor era inocente?' },
    {
      speaker: 'André',
      text: 'Do nada.\nAnos acreditando no contrário e, de repente, o processo virou mentira.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'O senhor a incentivou?' },
    { speaker: 'André', text: 'Por que incentivaria?', portrait: 'andre' },
    { speaker: 'André', text: 'Pedi pra ela parar.', portrait: 'andre' },
  ],
  stop: [
    { speaker: 'Augusto', text: 'Parar de quê, exatamente?' },
    {
      speaker: 'André',
      text: 'De mexer nisso.\nDe me usar pra se sentir útil.\nO que já me enterrou uma vez, não precisa ser aberto de novo.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'E ela parou?' },
    { speaker: 'André', text: 'O senhor está aqui. Me diga o senhor.', portrait: 'andre' },
  ],
  maralto: [
    { speaker: 'Augusto', text: 'Maralto Granéis. Os protestos de seis anos atrás. Morsa.' },
    {
      speaker: 'André',
      text: 'Não sei o que o senhor quer ouvir.\nEu não tenho nada disso.',
      portrait: 'andre',
    },
    { speaker: 'Augusto', text: 'Mariana mencionou algum desses nomes?' },
    {
      speaker: 'André',
      text: 'Mariana falava da Elisa.\nO resto, não acompanhei.\nO que tem a ver uma coisa com a outra?',
      portrait: 'andre',
    },
  ],
  trust: [
    { speaker: 'Augusto', text: 'Preciso entender o que ela estava fazendo.' },
    {
      speaker: 'André',
      text: 'O senhor precisa fechar um desaparecimento.\nEu preciso sobreviver a uma condenação.\nA gente não é aliado.',
      portrait: 'andre',
    },
    { speaker: 'André', text: 'O tempo de visita está acabando. Mais alguma coisa?', portrait: 'andre' },
  ],
}
