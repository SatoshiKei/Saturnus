export type LiviaTopicId = 'mariana' | 'maralto' | 'protests' | 'archives' | 'material'

export const LIVIA_TOPIC_IDS: LiviaTopicId[] = [
  'mariana',
  'maralto',
  'protests',
  'archives',
  'material',
]

export const liviaTopicLabels: Record<LiviaTopicId, string> = {
  mariana: 'Contato com Mariana',
  maralto: 'O que ela queria da Maralto',
  protests: 'Protestos de seis anos atrás',
  archives: 'Arquivos originais',
  material: 'Material bruto preservado',
}

export const liviaTopicFlags: Record<LiviaTopicId, string> = {
  mariana: 'block03_livia_mariana',
  maralto: 'block03_livia_maralto',
  protests: 'block03_livia_protests',
  archives: 'block03_livia_archives',
  material: 'block03_livia_material',
}

export type LiviaBeat = { speaker?: string; text: string; portrait?: 'livia' }

export const liviaBeats: Record<LiviaTopicId, LiviaBeat[]> = {
  mariana: [
    { speaker: 'Augusto', text: 'Mariana Silva te procurou?' },
    { speaker: 'Lívia', text: 'Procurou.\nHá poucas semanas.', portrait: 'livia' },
    { speaker: 'Augusto', text: 'Como jornalista ou como…?' },
    {
      speaker: 'Lívia',
      text: 'Como alguém que precisava de arquivo.\nNão pediu entrevista.\nPediu material.',
      portrait: 'livia',
    },
  ],
  maralto: [
    { speaker: 'Augusto', text: 'Ela estava investigando a Maralto hoje?' },
    {
      speaker: 'Lívia',
      text: 'Não.\nNada de irregularidade atual.\nNada de denúncia fresca.',
      portrait: 'livia',
    },
    { speaker: 'Augusto', text: 'Então o quê?' },
    {
      speaker: 'Lívia',
      text: 'História.\nOs protestos de quando a operação se consolidou aqui.',
      portrait: 'livia',
    },
  ],
  protests: [
    { speaker: 'Augusto', text: 'Seis anos atrás.' },
    {
      speaker: 'Lívia',
      text: 'Isso.\nCobertura local, rádio, algumas notas.\nFoi feio em pelo menos uma noite.',
      portrait: 'livia',
    },
    { speaker: 'Augusto', text: 'Você sabe por que ela queria exatamente isso?' },
    {
      speaker: 'Lívia',
      text: 'Não.\nE ela não explicou.',
      portrait: 'livia',
    },
  ],
  archives: [
    { speaker: 'Augusto', text: 'Os arquivos oficiais ainda existem?' },
    {
      speaker: 'Lívia',
      text: 'Incompletos.\nParte sumiu, parte nunca foi digitalizada direito.\nInstituições “perderam” fita.',
      portrait: 'livia',
    },
    { speaker: 'Augusto', text: 'E você?' },
    {
      speaker: 'Lívia',
      text: 'Guardei o bruto da minha cobertura.\nNão por heroísmo.\nPor hábito.',
      portrait: 'livia',
    },
  ],
  material: [
    { speaker: 'Augusto', text: 'Posso ouvir?' },
    {
      speaker: 'Lívia',
      text: 'Pode.\nMas o arquivo da rádio veio torto.\nOrdem estranha.\nVai precisar reconstruir.',
      portrait: 'livia',
    },
    { speaker: 'Augusto', text: 'Você tem log?' },
    {
      speaker: 'Lívia',
      text: 'Tenho o que sobrou do sistema antigo.\nBatch IDs, timestamps inconsistentes.\nLeva tudo.',
      portrait: 'livia',
    },
  ],
}
