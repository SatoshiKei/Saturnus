export type DenisTopicId = 'intro' | 'jaguar' | 'people'

export const DENIS_TOPIC_IDS: DenisTopicId[] = ['intro', 'jaguar', 'people']

export const denisTopicLabels: Record<DenisTopicId, string> = {
  intro: 'O carro',
  jaguar: 'O dano',
  people: 'Quem trouxe',
}

export const denisTopicFlags: Record<DenisTopicId, string> = {
  intro: 'block08_denis_intro',
  jaguar: 'block08_denis_jaguar',
  people: 'block08_denis_people',
}

export type DenisBeat = { speaker?: string; text: string }

export const denisBeats: Record<DenisTopicId, DenisBeat[]> = {
  intro: [
    { speaker: 'Dênis', text: 'Sou eu.' },
    {
      speaker: 'Augusto',
      text: 'Polícia Civil. Preciso perguntar sobre um carro que pode ter passado por aqui alguns anos atrás.',
    },
    { speaker: 'Dênis', text: 'Seis anos? Se for Uno, Gol ou Celta, pode voltar pra casa.' },
    { speaker: 'Augusto', text: 'Jaguar XJ6.' },
    { speaker: 'Dênis', text: 'Verde?' },
    { speaker: 'Augusto', text: 'Por que verde?' },
    {
      speaker: 'Dênis',
      text: 'Porque Jaguar eu lembro.\n\nVerde então, mais ainda.',
    },
  ],
  jaguar: [
    { speaker: 'Augusto', text: 'O dano era compatível com uma pancada em proteção metálica?' },
    {
      speaker: 'Dênis',
      text: 'Podia ser.\n\nPara-choque, para-lama, lateral. Pegou alguma coisa de raspão e com força.',
    },
    {
      speaker: 'Dênis',
      text: 'XJ6 antigo, verde-escuro, interior bege.\n\nCanto dianteiro direito destruído — friso, para-lama, pintura raspada.\n\nO carro ainda rodava.',
    },
    { speaker: 'Augusto', text: 'Placa?' },
    { speaker: 'Dênis', text: 'Depois de seis anos? Nem ideia.' },
    { speaker: 'Augusto', text: 'Seguro?' },
    { speaker: 'Dênis', text: 'Não.\n\nDinheiro.' },
    {
      speaker: 'Dênis',
      text: 'Chegou pouco depois daquela madrugada.\n\nGeração X300 — uns noventa e cinco, noventa e seis.',
    },
  ],
  people: [
    { speaker: 'Augusto', text: 'Você lembra de quem trouxe?' },
    { speaker: 'Dênis', text: 'Da guria.' },
    { speaker: 'Augusto', text: 'Nome?' },
    { speaker: 'Dênis', text: 'Nem ideia.' },
    {
      speaker: 'Dênis',
      text: 'Jovem demais pra combinar com aquele carro.\n\nToda de preto. Cabelo escuro, maquiagem carregada.\n\nParecia que tinha saído de outra década e roubado o carro de outra pessoa.',
    },
    { speaker: 'Augusto', text: 'Estava sozinha?' },
    {
      speaker: 'Dênis',
      text: 'Tinha um rapaz.\n\nMais ou menos da idade dela.\n\nNervosos. Queriam reparo rápido.',
    },
    { speaker: 'Augusto', text: 'Quem dirigia?' },
    {
      speaker: 'Dênis',
      text: 'Não lembro.\n\nE não vou inventar porque você quer ouvir.',
    },
  ],
}
