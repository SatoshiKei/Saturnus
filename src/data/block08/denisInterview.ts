export type DenisTopicId = 'order' | 'photos' | 'match' | 'memory'

export const DENIS_TOPIC_IDS: DenisTopicId[] = ['order', 'photos', 'match', 'memory']

export const denisTopicLabels: Record<DenisTopicId, string> = {
  order: 'A ordem',
  photos: 'As fotos',
  match: 'Comparar',
  memory: 'Perícia',
}

export const denisTopicFlags: Record<DenisTopicId, string> = {
  order: 'block08_denis_order',
  photos: 'block08_denis_photos',
  match: 'block08_denis_match',
  memory: 'block08_denis_memory',
}

export type DenisBeat = { speaker?: string; text: string }

export const denisBeats: Record<DenisTopicId, DenisBeat[]> = {
  order: [
    { speaker: 'Dênis', text: 'Seis anos?' },
    { speaker: 'Augusto', text: 'Seis.' },
    { speaker: 'Dênis', text: 'Eu mal lembro o que entrou aqui mês passado.' },
    { speaker: 'Augusto', text: 'Tenho o comprovante.' },
    { speaker: 'Dênis', text: 'Aí já melhora.' },
    { speaker: 'Dênis', text: 'Achei.\n\nLateral dianteira. Para-lama, tinta, alinhamento.' },
  ],
  photos: [
    { speaker: 'Augusto', text: 'Tem fotografia?' },
    { speaker: 'Dênis', text: 'Se fizeram orçamento aqui, provavelmente.' },
    { speaker: 'Dênis', text: 'Tem.' },
  ],
  match: [
    { speaker: 'Augusto', text: 'Quero comparar com isso.' },
    { speaker: 'Dênis', text: 'O que é?' },
    { speaker: 'Augusto', text: 'Foto de uma proteção de via.' },
    { speaker: 'Dênis', text: 'Essa tinta aqui...' },
    { speaker: 'Augusto', text: 'É compatível?' },
    {
      speaker: 'Dênis',
      text: 'Compatível eu digo.\n\n“É o mesmo carro” eu não digo olhando uma foto.',
    },
  ],
  memory: [
    { speaker: 'Augusto', text: 'Certo.' },
    {
      speaker: 'Dênis',
      text: 'Mas altura bate.\n\nPonto de contato bate.\n\nE esse tipo de marca aqui é bem parecido.',
    },
    { speaker: 'Augusto', text: 'O suficiente para justificar perícia.' },
    { speaker: 'Dênis', text: 'Isso é com vocês.\n\nEu só conserto o estrago.' },
  ],
}
