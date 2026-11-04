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
    { speaker: 'Augusto', text: 'Você conhecia Elisa Duarte?' },
    { speaker: 'Nico', text: 'Conhecia.\nTodo mundo da casa conhecia.', portrait: 'nico' },
    { speaker: 'Augusto', text: 'Como?' },
    {
      speaker: 'Nico',
      text: 'Ela ia no Vértice.\nNão era VIP.\nSó… aparecia.',
      portrait: 'nico',
    },
  ],
  vertice_night: [
    { speaker: 'Augusto', text: 'Você estava trabalhando na noite em que ela morreu?' },
    { speaker: 'Nico', text: 'Estava.\nNa cabine.', portrait: 'nico' },
    { speaker: 'Augusto', text: 'Viu ela sair?' },
    {
      speaker: 'Nico',
      text: 'Eu já depus isso uma vez.\nNão vou recontar o processo inteiro.',
      portrait: 'nico',
    },
  ],
  mariana: [
    { speaker: 'Augusto', text: 'Mariana Silva te procurou recentemente?' },
    { speaker: 'Nico', text: 'Procurou.', portrait: 'nico' },
    { speaker: 'Augusto', text: 'Você reconheceu quem ela era?' },
    {
      speaker: 'Nico',
      text: 'Não no começo.\nDepois ela falou do irmão.\nAí eu entendi.',
      portrait: 'nico',
    },
    { speaker: 'Augusto', text: 'E você falou com ela?' },
    {
      speaker: 'Nico',
      text: 'Falei o mínimo.\nNão gostei da conversa.',
      portrait: 'nico',
    },
  ],
  questions: [
    { speaker: 'Augusto', text: 'O que ela queria?' },
    {
      speaker: 'Nico',
      text: 'Horários.\nSequência.\nQuem entrou, quem saiu, em que ordem.',
      portrait: 'nico',
    },
    { speaker: 'Augusto', text: 'Quem matou Elisa?' },
    {
      speaker: 'Nico',
      text: 'Não.\nEla quase não perguntou isso.\nParecia obcecada com quando cada coisa aconteceu.',
      portrait: 'nico',
    },
    { speaker: 'Augusto', text: 'Por quê?' },
    {
      speaker: 'Nico',
      text: 'Não sei.\nE não quis saber.',
      portrait: 'nico',
    },
  ],
  recordings: [
    { speaker: 'Augusto', text: 'Existem registros daquela noite?' },
    {
      speaker: 'Nico',
      text: 'Duas gravações.\nUma da mesa.\nOutra de um gravador que a gente usava pra checar mix.',
      portrait: 'nico',
    },
    { speaker: 'Augusto', text: 'Você ainda tem?' },
    {
      speaker: 'Nico',
      text: 'Tenho cópia.\nNão é oficial.\nMas é daquela noite.',
      portrait: 'nico',
    },
    { speaker: 'Augusto', text: 'Preciso ouvir.' },
    {
      speaker: 'Nico',
      text: 'Leva.\nSó… não me envolva de novo nessa história.',
      portrait: 'nico',
    },
  ],
}
