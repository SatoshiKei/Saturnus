export type DenisTopicId = 'order' | 'photos' | 'match' | 'memory'

export const DENIS_TOPIC_IDS: DenisTopicId[] = ['order', 'photos', 'match', 'memory']

export const denisTopicLabels: Record<DenisTopicId, string> = {
  order: 'A ordem de serviço',
  photos: 'Fotos do orçamento',
  match: 'Comparar com o guardrail',
  memory: 'Lembrança espontânea',
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
    { speaker: 'Augusto', text: 'Dênis? Trouxe o comprovante do Mauro — reparo de seis anos atrás.' },
    { speaker: 'Dênis', text: 'Sem o número eu não lembro carro nenhum.\nDeixa eu puxar no sistema antigo.' },
    { speaker: 'Dênis', text: 'Aqui. Ordem de serviço. Lateral dianteira. Tinta e geometria anotadas.' },
  ],
  photos: [
    { speaker: 'Augusto', text: 'Tem imagem?' },
    { speaker: 'Dênis', text: 'Do orçamento, sim.\nA gente fotografava o dano antes de pintar.\nAinda está no arquivo.' },
  ],
  match: [
    { speaker: 'Augusto', text: 'Compare com as marcas do guardrail daquela madrugada.' },
    { speaker: 'Dênis', text: 'Altura, região, transferência de tinta…\nIsso não é coincidência de oficina.\nÉ o mesmo tipo de impacto.' },
  ],
  memory: [
    { speaker: 'Augusto', text: 'O senhor lembrava desse carro?' },
    { speaker: 'Dênis', text: 'Não.\nSeiscentos carros atrás.\nSem o papel do Mauro, eu não teria achado nada.' },
  ],
}
