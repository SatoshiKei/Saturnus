export type VerticeTopicId = 'iara' | 'sandro' | 'caio' | 'archive' | 'sandro_why'

export const VERTICE_TOPIC_IDS: VerticeTopicId[] = ['iara', 'sandro', 'caio', 'sandro_why', 'archive']

export const verticeTopicLabels: Record<VerticeTopicId, string> = {
  iara: 'Falar com Iara',
  sandro: 'Falar com Sandro',
  caio: 'Falar com Caio',
  archive: 'Consultar arquivos antigos',
  sandro_why: 'Perguntar a Sandro sobre o interesse de Mariana',
}

export const verticeTopicFlags: Record<VerticeTopicId, string> = {
  iara: 'block02_vertice_iara',
  sandro: 'block02_vertice_sandro',
  caio: 'block02_vertice_caio',
  archive: 'block02_vertice_archive',
  sandro_why: 'block02_vertice_sandro_why',
}

export type VnBeat = { speaker?: string; text: string; portrait?: 'iara' | 'sandro' | 'caio' }

export const verticeBeats: Record<VerticeTopicId, VnBeat[]> = {
  iara: [
    { speaker: 'Augusto', text: 'Reconhece esta pessoa?' },
    { speaker: 'Iara', text: 'Ela veio aqui.', portrait: 'iara' },
    { speaker: 'Augusto', text: 'Quando?' },
    { speaker: 'Iara', text: 'Sei lá... mês passado?\nTalvez um pouco mais.', portrait: 'iara' },
    { speaker: 'Augusto', text: 'Sozinha?' },
    { speaker: 'Iara', text: 'Sim.', portrait: 'iara' },
    { speaker: 'Augusto', text: 'O que ela queria?' },
    {
      speaker: 'Iara',
      text: 'Falou com o Sandro mais do que comigo.\nPerguntou de gente que trabalhava aqui antigamente.',
      portrait: 'iara',
    },
    { speaker: 'Augusto', text: 'Ela parecia nervosa?' },
    {
      speaker: 'Iara',
      text: 'Não.\nParecia chata.',
      portrait: 'iara',
    },
    { speaker: 'Augusto', text: 'Chata?' },
    {
      speaker: 'Iara',
      text: 'Perguntava uma coisa, tu respondia, ela perguntava de novo de outro jeito.\nParecia que tava tentando ver se a resposta mudava.',
      portrait: 'iara',
    },
  ],
  sandro: [
    { speaker: 'Augusto', text: 'Ela estava procurando alguém específico?' },
    { speaker: 'Sandro', text: 'No começo não.\nEla tinha um áudio.\nQueria saber quem trabalhava com som aqui uns anos atrás.', portrait: 'sandro' },
    { speaker: 'Augusto', text: 'Você reconheceu?' },
    { speaker: 'Sandro', text: 'Não.\nMandei ela falar com o Caio.', portrait: 'sandro' },
    { speaker: 'Augusto', text: 'E depois?' },
    { speaker: 'Sandro', text: 'Ela voltou perguntando pelos DJs.', portrait: 'sandro' },
    { speaker: 'Augusto', text: 'Quais?' },
    { speaker: 'Sandro', text: 'Aí já não lembro.\nFaz tempo.', portrait: 'sandro' },
  ],
  caio: [
    { speaker: 'Augusto', text: 'Preciso que ouça esta gravação.' },
    { speaker: 'Caio', text: 'Isso é daqui.', portrait: 'caio' },
    { speaker: 'Augusto', text: 'Tem certeza?' },
    { speaker: 'Caio', text: 'Dessa vez tenho.', portrait: 'caio' },
    { speaker: 'Augusto', text: 'Por quê?' },
    {
      speaker: 'Caio',
      text: 'Essa vinheta já matou a dúvida.\nAntes da reforma usavam isso entre alguns sets.',
      portrait: 'caio',
    },
    { speaker: 'Augusto', text: 'Dá pra saber quando?' },
    { speaker: 'Caio', text: 'Não pelo áudio sozinho.', portrait: 'caio' },
    {
      speaker: 'Caio',
      text: 'Tem uma voz masculina curta fora do microfone principal — não identifico quem é.\nMas as gravações automáticas da mesa eram arquivadas com o operador ou o set.\nO Sandro ainda tem parte disso num HD administrativo.',
      portrait: 'caio',
    },
  ],
  archive: [
    { speaker: 'Augusto', text: 'Exportação parcial dos registros antigos — escalas, cachês, DJs convidados.' },
    {
      speaker: 'Sandro',
      text: 'Vários nomes aparecem nesse período.\nUm deles se repete no tipo de gravação que ela procurava.',
      portrait: 'sandro',
    },
    { speaker: 'Augusto', text: 'Nicolas “Nico” — DJ.' },
    { speaker: 'Sandro', text: 'Só um número antigo no cadastro. Não funciona mais.', portrait: 'sandro' },
  ],
  sandro_why: [
    { speaker: 'Augusto', text: 'Por que Mariana estava interessada nesse período?' },
    { speaker: 'Sandro', text: 'Ela não falou.', portrait: 'sandro' },
    { speaker: 'Augusto', text: 'Ela mencionou algum nome?' },
    { speaker: 'Sandro', text: 'Não pra mim.', portrait: 'sandro' },
    { speaker: 'Augusto', text: 'Problema com alguém daqui?' },
    {
      speaker: 'Sandro',
      text: 'Delegado, isso foi anos atrás.\nMetade das pessoas que trabalhavam aqui nem mora mais na cidade.',
      portrait: 'sandro',
    },
  ],
}
