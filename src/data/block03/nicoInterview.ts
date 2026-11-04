export type NicoTopicId = 'elisa' | 'vertice_night' | 'mariana' | 'questions' | 'recordings'

export const NICO_TOPIC_IDS: NicoTopicId[] = [
  'elisa',
  'vertice_night',
  'mariana',
  'questions',
  'recordings',
]

export const nicoTopicLabels: Record<NicoTopicId, string> = {
  elisa: 'Elisa Duarte',
  vertice_night: 'A Noite X no Vértice',
  mariana: 'Visita de Mariana',
  questions: 'O que ela queria saber',
  recordings: 'Registros sonoros',
}

export const nicoTopicFlags: Record<NicoTopicId, string> = {
  elisa: 'block03_nico_elisa',
  vertice_night: 'block03_nico_vertice_night',
  mariana: 'block03_nico_mariana',
  questions: 'block03_nico_questions',
  recordings: 'block03_nico_recordings',
}

export type NicoBeat = { speaker?: string; text: string; portrait?: 'nico' }

export const nicoBeats: Record<NicoTopicId, NicoBeat[]> = {
  elisa: [
    { speaker: 'Nico', text: 'Antes que pergunte: sim, eu sei de quem a gente vai falar.\nSó achei que depois de seis anos ia ser outro assunto.', portrait: 'nico' },
    { speaker: 'Augusto', text: 'Você conhecia Elisa Duarte?' },
    { speaker: 'Nico', text: 'Conhecia.\nTodo mundo da casa conhecia.', portrait: 'nico' },
    { speaker: 'Augusto', text: 'Como?' },
    {
      speaker: 'Nico',
      text: 'Ela ia no Vértice.\nNão era VIP, não era promoter.\nSó… aparecia.\nTem gente que a pista adota.',
      portrait: 'nico',
    },
  ],
  vertice_night: [
    { speaker: 'Augusto', text: 'Você estava trabalhando na noite em que ela morreu?' },
    { speaker: 'Nico', text: 'Estava. Cabine, como sempre.', portrait: 'nico' },
    { speaker: 'Augusto', text: 'Viu quando ela saiu?' },
    {
      speaker: 'Nico',
      text: 'Cara… eu já falei isso.\nPra delegado, pra advogado, pra escrivão com cheiro de café.\nTá tudo no processo.',
      portrait: 'nico',
    },
    { speaker: 'Nico', text: 'Eu estava de fone, olhando o mixer e a pista.\nGente entrando, gente saindo.\nNão sou guarda-costas de ninguém.', portrait: 'nico' },
  ],
  mariana: [
    { speaker: 'Augusto', text: 'Mariana Silva procurou você há pouco tempo.' },
    { speaker: 'Nico', text: 'Procurou.', portrait: 'nico' },
    { speaker: 'Augusto', text: 'Você a reconheceu?' },
    {
      speaker: 'Nico',
      text: 'Não de cara.\nDepois ela falou do irmão e aí caiu a ficha.',
      portrait: 'nico',
    },
    { speaker: 'Augusto', text: 'Vocês conversaram?' },
    {
      speaker: 'Nico',
      text: 'O mínimo.\nNão curti a conversa.\nNão é nada contra ela, é que eu tinha deixado essa noite lá atrás.',
      portrait: 'nico',
    },
  ],
  questions: [
    { speaker: 'Augusto', text: 'O que ela queria saber?' },
    {
      speaker: 'Nico',
      text: 'Horário.\nSequência.\nQuem entrou, quem saiu, em que ordem.',
      portrait: 'nico',
    },
    { speaker: 'Augusto', text: 'Quem matou Elisa?' },
    {
      speaker: 'Nico',
      text: 'Isso ela quase não perguntou.\nA moça parecia obcecada com quando cada coisa aconteceu.\nMinuto por minuto.',
      portrait: 'nico',
    },
    { speaker: 'Augusto', text: 'Ela disse por quê?' },
    {
      speaker: 'Nico',
      text: 'Não.\nE eu também não perguntei.',
      portrait: 'nico',
    },
  ],
  recordings: [
    { speaker: 'Augusto', text: 'Existem registros daquela noite?' },
    {
      speaker: 'Nico',
      text: 'Tem.\nDuas gravações.\nUma que sai direto da mesa.\nOutra de um gravador portátil que a gente deixava ligado pra checar mix.',
      portrait: 'nico',
    },
    { speaker: 'Augusto', text: 'Você ainda guarda isso?' },
    {
      speaker: 'Nico',
      text: 'Tenho cópia.\nNão é oficial, não foi pro processo.\nMas é daquela noite.',
      portrait: 'nico',
    },
    { speaker: 'Augusto', text: 'Preciso ouvir.' },
    {
      speaker: 'Nico',
      text: 'Leva.\nSó me faz um favor: não me chama de volta pra essa história.',
      portrait: 'nico',
    },
  ],
}
