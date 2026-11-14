export type VerticeTopicId =
  | 'iara'
  | 'sandro'
  | 'caio'
  | 'archive'
  | 'sandro_why'
  | 'set_crossref'

export const VERTICE_TOPIC_IDS: VerticeTopicId[] = [
  'iara',
  'sandro',
  'caio',
  'sandro_why',
  'archive',
  'set_crossref',
]

export const verticeTopicLabels: Record<VerticeTopicId, string> = {
  iara: 'Falar com Iara',
  sandro: 'Falar com Sandro',
  caio: 'Falar com Caio',
  archive: 'Consultar arquivos antigos',
  sandro_why: 'Perguntar a Sandro sobre o interesse de Mariana',
  set_crossref: 'Cruzar transição musical com registros de set',
}

export const verticeTopicFlags: Record<VerticeTopicId, string> = {
  iara: 'block02_vertice_iara',
  sandro: 'block02_vertice_sandro',
  caio: 'block02_vertice_caio',
  archive: 'block02_vertice_archive',
  sandro_why: 'block02_vertice_sandro_why',
  set_crossref: 'block02_vertice_set_crossref',
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
    {
      speaker: 'Sandro',
      text: 'No começo não.\nQueria saber quem trabalhava com som aqui uns anos atrás.\nFalou que tinha material pra cruzar — mas não mostrou nada pra mim.',
      portrait: 'sandro',
    },
    { speaker: 'Augusto', text: 'Você reconheceu o período?' },
    { speaker: 'Sandro', text: 'Não.\nMandei ela falar com o Caio.', portrait: 'sandro' },
    { speaker: 'Augusto', text: 'E depois?' },
    { speaker: 'Sandro', text: 'Ela voltou perguntando pelos DJs e pela escala antiga.', portrait: 'sandro' },
    { speaker: 'Augusto', text: 'Quais nomes?' },
    { speaker: 'Sandro', text: 'Aí já não lembro.\nFaz tempo.', portrait: 'sandro' },
  ],
  caio: [
    { speaker: 'Augusto', text: 'Mariana falou com você sobre gravações da casa?' },
    {
      speaker: 'Caio',
      text: 'Falou.\nQueria saber se a gente ainda guardava registro automático de set e de quem tava na cabine.',
      portrait: 'caio',
    },
    { speaker: 'Augusto', text: 'Guardam?' },
    {
      speaker: 'Caio',
      text: 'Parte sim.\nAntes da reforma o software da mesa arquivava operador e sequência.\nO Sandro ainda tem um HD administrativo com exportações antigas.',
      portrait: 'caio',
    },
    { speaker: 'Augusto', text: 'Dá pra achar uma noite específica só com o que ela descreveu?' },
    {
      speaker: 'Caio',
      text: 'Não.\nSem o arquivo de áudio pra cruzar — fingerprint, transição, horário — é chute.\nQuando tiver o material, volta.',
      portrait: 'caio',
    },
  ],
  archive: [
    { speaker: 'Augusto', text: 'Posso ver esses arquivos antigos?' },
    {
      speaker: 'Sandro',
      text: 'Posso te mostrar que eles existem.\nEscala, cachê, logs de set — anos anteriores.\nMas sem uma chave técnica a gente não cruza nada útil hoje.',
      portrait: 'sandro',
    },
    { speaker: 'Augusto', text: 'Chave técnica?' },
    {
      speaker: 'Sandro',
      text: 'Tipo transição de faixa, janela de microfone, assinatura do set.\nQuando tiver isso, a gente filtra o HD.\nPor agora… só confirma que o arquivo histórico tá aqui.',
      portrait: 'sandro',
    },
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
  /** 2ª visita — só após P3 técnico. */
  set_crossref: [
    {
      speaker: 'Augusto',
      text: 'Tenho a gravação e a transição A→B isolada.\nQuero cruzar com os logs de set.',
    },
    {
      speaker: 'Sandro',
      text: 'Agora sim.\nCom a sequência adjacente dá pra filtrar o HD.',
      portrait: 'sandro',
    },
    { speaker: 'Augusto', text: 'Quantas sessões batem?' },
    {
      speaker: 'Sandro',
      text: 'Uma.\nMesma ordem de faixas, mesma janela de microfone no log.',
      portrait: 'sandro',
    },
    { speaker: 'Augusto', text: 'Operador da cabine?' },
    {
      speaker: 'Sandro',
      text: 'Nicolas Prado Reis.\n“Nico”.\nDJ / técnico — recorrente nesse período.',
      portrait: 'sandro',
    },
    {
      speaker: 'Sandro',
      text: 'Cadastro antigo tem só um número que não funciona mais.\nMas o nome é esse.',
      portrait: 'sandro',
    },
  ],
}
