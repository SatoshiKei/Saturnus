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
  archive: 'Perguntar pelos arquivos antigos',
  sandro_why: 'Perguntar a Sandro sobre o interesse de Mariana',
  set_crossref: 'Mostrar a gravação e consultar os registros',
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

/**
 * 1ª visita (antes da cópia de Rafael): ninguém ouve, comenta ou analisa o áudio da balada.
 * 2ª visita (`set_crossref`): Caio ouve a gravação; Sandro cruza com o arquivo → Nico.
 */
export const verticeBeats: Record<VerticeTopicId, VnBeat[]> = {
  iara: [
    {
      speaker: 'Augusto',
      text: 'Polícia Civil. Estou procurando informações sobre Mariana Silva. Ela esteve aqui recentemente.',
    },
    { speaker: 'Iara', text: 'Se for a mulher da foto, esteve.', portrait: 'iara' },
    { speaker: 'Augusto', text: 'Quando?' },
    { speaker: 'Iara', text: 'Não vou saber o dia.\nUmas semanas atrás, de manhã.', portrait: 'iara' },
    { speaker: 'Augusto', text: 'Ela veio sozinha?' },
    { speaker: 'Iara', text: 'Veio.', portrait: 'iara' },
    { speaker: 'Augusto', text: 'Falou com você?' },
    { speaker: 'Iara', text: 'Pouco.\nEla queria o Sandro.', portrait: 'iara' },
    { speaker: 'Augusto', text: 'Por quê?' },
    {
      speaker: 'Iara',
      text: 'Perguntava de gente que trabalhou aqui anos atrás.\nQuem ficava no som, quem ainda tinha contato com quem saiu... coisa velha.',
      portrait: 'iara',
    },
    { speaker: 'Augusto', text: 'Ela parecia conhecer alguém daqui?' },
    { speaker: 'Iara', text: 'Não sei.\nParecia conhecer as perguntas.', portrait: 'iara' },
    { speaker: 'Augusto', text: 'Como assim?' },
    {
      speaker: 'Iara',
      text: 'Ela perguntava, eu respondia, e daqui a pouco vinha a mesma coisa por outro lado.\nAchei que ela não estava acreditando em mim.',
      portrait: 'iara',
    },
    { speaker: 'Augusto', text: 'E estava?' },
    { speaker: 'Iara', text: 'Sei lá.\nTalvez só estivesse conferindo.', portrait: 'iara' },
  ],
  sandro: [
    { speaker: 'Augusto', text: 'Mariana procurou o senhor?' },
    { speaker: 'Sandro', text: 'Procurou.\nFicou aqui um bom tempo.', portrait: 'sandro' },
    { speaker: 'Augusto', text: 'Ela queria nomes de funcionários antigos?' },
    {
      speaker: 'Sandro',
      text: 'Funcionários, DJs, pessoal da cabine.\nPrincipalmente gente de uns anos atrás.',
      portrait: 'sandro',
    },
    { speaker: 'Augusto', text: 'O senhor deu algum nome?' },
    {
      speaker: 'Sandro',
      text: 'De cabeça, alguns.\nMas seis anos é muito tempo numa casa dessas.\nEntrou gente, saiu gente, teve reforma, mudou sistema.',
      portrait: 'sandro',
    },
  ],
  caio: [
    { speaker: 'Augusto', text: 'Mariana também falou com você?' },
    {
      speaker: 'Caio',
      text: 'Passou por mim, sim.\nMais conversou com o Sandro, mas fez umas perguntas de mesa.',
      portrait: 'caio',
    },
    { speaker: 'Augusto', text: 'Que tipo de pergunta?' },
    {
      speaker: 'Caio',
      text: 'Se a cabine antiga guardava registro de quem operava.\nGuardava, em parte. Depois da reforma, não sei o que sobrou.',
      portrait: 'caio',
    },
    { speaker: 'Augusto', text: 'Dá pra chegar em alguém só com isso?' },
    {
      speaker: 'Caio',
      text: 'Sem um período fechado ou uma referência, não.\nÉ uma pilha de nomes.',
      portrait: 'caio',
    },
  ],
  archive: [
    { speaker: 'Augusto', text: 'Ainda existe registro daquele período?' },
    {
      speaker: 'Sandro',
      text: 'Alguma coisa.\nEscala, fechamento, exportação antiga.\nNão está organizado o suficiente pra eu abrir uma pasta e te entregar uma resposta.',
      portrait: 'sandro',
    },
    { speaker: 'Augusto', text: 'Mariana chegou a consultar esse material?' },
    { speaker: 'Sandro', text: 'Não comigo.', portrait: 'sandro' },
    { speaker: 'Iara', text: 'É só isso?', portrait: 'iara' },
    { speaker: 'Augusto', text: 'Por enquanto.' },
    {
      speaker: 'Iara',
      text: 'Se descobrir o que ela estava procurando, talvez seja mais fácil perguntar.',
      portrait: 'iara',
    },
    { speaker: 'Augusto', text: 'É o que eu estou tentando fazer.' },
  ],
  sandro_why: [
    { speaker: 'Augusto', text: 'Ela explicou o motivo?' },
    { speaker: 'Sandro', text: 'Não.\nE eu perguntei.', portrait: 'sandro' },
    { speaker: 'Augusto', text: 'O que ela respondeu?' },
    { speaker: 'Sandro', text: 'Que precisava conferir uma coisa.\nSó isso.', portrait: 'sandro' },
    { speaker: 'Augusto', text: 'Ela voltou?' },
    { speaker: 'Sandro', text: 'Uma vez.\nFez mais perguntas e foi embora.', portrait: 'sandro' },
    { speaker: 'Augusto', text: 'Perguntas sobre quem?' },
    { speaker: 'Sandro', text: 'Se eu lembrasse, tinha dito pra ela na época.', portrait: 'sandro' },
  ],
  /** 2ª visita — só após ANÉIS técnico (a gravação já foi analisada). */
  set_crossref: [
    { speaker: 'Iara', text: 'Você de novo.', portrait: 'iara' },
    { speaker: 'Augusto', text: 'Dessa vez eu trouxe uma coisa útil.' },
    { speaker: 'Iara', text: 'Que bom.\nO Sandro está lá dentro.', portrait: 'iara' },
    { speaker: 'Sandro', text: 'Conseguiu descobrir o que ela estava procurando?', portrait: 'sandro' },
    { speaker: 'Augusto', text: 'Consegui recuperar uma gravação que Mariana tinha mandado para um amigo.' },
    { speaker: 'Sandro', text: 'E?', portrait: 'sandro' },
    { speaker: 'Augusto', text: 'É daqui.' },
    { speaker: 'Sandro', text: 'Você tem certeza?', portrait: 'sandro' },
    { speaker: 'Augusto', text: 'O suficiente para não pedir que você procure seis anos de arquivo no escuro.' },
    { speaker: 'Sandro', text: 'Aí melhorou.', portrait: 'sandro' },
    { speaker: 'Augusto', text: 'Quero que você ouça um trecho.' },
    { speaker: 'Caio', text: 'Agora você tem o arquivo.', portrait: 'caio' },
    { speaker: 'Augusto', text: 'Tenho.' },
    { text: '[Augusto reproduz um trecho da gravação.]' },
    { speaker: 'Caio', text: 'Isso é daqui.', portrait: 'caio' },
    { speaker: 'Augusto', text: 'O que entrega?' },
    {
      speaker: 'Caio',
      text: 'Não é uma coisa só.\nO comportamento do microfone, a compressão, umas marcas do sistema antigo.\nAntes da reforma a cabine trabalhava desse jeito.',
      portrait: 'caio',
    },
    { speaker: 'Augusto', text: 'Dá pra chegar numa sessão?' },
    {
      speaker: 'Caio',
      text: 'Com o que você já tirou do arquivo, talvez.\nSe o log daquele período ainda estiver inteiro.',
      portrait: 'caio',
    },
    { speaker: 'Sandro', text: 'Inteiro não está.', portrait: 'sandro' },
    { speaker: 'Caio', text: 'Inteiro nunca está.', portrait: 'caio' },
    { speaker: 'Sandro', text: 'Me passa a referência.', portrait: 'sandro' },
    { speaker: 'Augusto', text: 'Aqui.' },
    { speaker: 'Sandro', text: 'Espera.', portrait: 'sandro' },
    { text: '[Sandro consulta o arquivo administrativo.]' },
    { speaker: 'Sandro', text: 'Tem mais de uma noite nesse intervalo.', portrait: 'sandro' },
    { speaker: 'Augusto', text: 'E com essa combinação?' },
    { speaker: 'Sandro', text: 'Uma.', portrait: 'sandro' },
    { speaker: 'Augusto', text: 'Abre.' },
    { speaker: 'Sandro', text: '...', portrait: 'sandro' },
    { speaker: 'Sandro', text: 'Nico.', portrait: 'sandro' },
    { speaker: 'Augusto', text: 'Nome completo.' },
    { speaker: 'Sandro', text: 'Nicolas Prado Reis.', portrait: 'sandro' },
    { speaker: 'Augusto', text: 'Ele operava a cabine?' },
    { speaker: 'Sandro', text: 'DJ residente.\nNesse registro, a sessão está no nome dele.', portrait: 'sandro' },
    { speaker: 'Augusto', text: 'Ainda trabalha aqui?' },
    { speaker: 'Sandro', text: 'Não faz anos.', portrait: 'sandro' },
    { speaker: 'Augusto', text: 'Tem contato?' },
    {
      speaker: 'Sandro',
      text: 'Só coisa antiga.\nTalvez você tenha mais sorte procurando pelo nome.',
      portrait: 'sandro',
    },
    { speaker: 'Augusto', text: 'Quando Mariana veio aqui, ela chegou nesse nome?' },
    { speaker: 'Sandro', text: 'Não comigo.', portrait: 'sandro' },
    { speaker: 'Augusto', text: 'Ela esteve perto?' },
    {
      speaker: 'Sandro',
      text: 'Delegado, ela fazia pergunta demais e explicava de menos.\nEu nem sabia o que ela estava tentando montar.',
      portrait: 'sandro',
    },
    { speaker: 'Augusto', text: 'Agora eu tenho uma ideia.' },
    { speaker: 'Sandro', text: 'Ótimo.\nPorque eu continuo sem ter.', portrait: 'sandro' },
  ],
}
