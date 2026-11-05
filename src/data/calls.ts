import type { InvestigationState, StoryActionRef } from '../game/types'

export interface CallLine {
  who: 'augusto' | 'other'
  text: string
}

export interface CallScript {
  id: string
  /** Quem atende (exibido no visor). */
  speaker: string
  /** Contato da agenda que dispara esta ligação. */
  contactId?: string
  /** Ramal interno / institucional. */
  ext?: string
  /** Se a ligação já pode ser feita (documento lido, flag…). Fora disso, a linha só chama sem resultado. */
  available: (s: InvestigationState) => boolean
  lines: CallLine[]
  /** Transição narrativa depois da conversa (ex.: "Algumas horas depois…"). */
  timeSkip?: string
  /** Texto do resultado depois da ligação (ex.: "Documento recebido"). */
  result?: { label: string; detail: string }
  onComplete: StoryActionRef[]
  /** Fala quando a ligação já foi concluída antes. */
  repeat: CallLine[]
  /** Fala quando ainda não faz sentido ligar (indisponível). */
  notYet?: CallLine[]
}

const flag = (s: InvestigationState, id: string) => Boolean(s.flags[id])

/**
 * Roteiros das ligações do telefone fixo / do celular de Augusto.
 * Fala curta, institucional. Conclusões não aparecem aqui (ficam nos documentos e na Reflexão).
 */
export const callScripts: CallScript[] = [
  {
    id: 'call-nico',
    speaker: 'Nico',
    contactId: 'contact-nico',
    available: () => true,
    lines: [
      { who: 'other', text: 'Fala.' },
      { who: 'augusto', text: 'Nicolas Prado Reis? Aqui é Augusto Nogueira, da Polícia Civil. Preciso de alguns minutos com o senhor.' },
      { who: 'other', text: 'Polícia. Sobre o quê, exatamente?' },
      { who: 'augusto', text: 'Sobre o desaparecimento de Mariana Silva.' },
      { who: 'other', text: '…A irmã do André. Então é isso. Achei que ia ser sobre a noite de seis anos atrás de novo, e acho que é, de um jeito ou de outro.' },
      { who: 'augusto', text: 'Posso ir até o senhor hoje.' },
      { who: 'other', text: 'Eu estou no Titã. Passa antes de a casa abrir, depois a pista enche e ninguém ouve ninguém.' },
    ],
    onComplete: [
      { type: 'completeCall', id: 'call-nico' },
      { type: 'unlockLocation', id: 'titan', status: 'visitAvailable' },
    ],
    repeat: [
      { who: 'other', text: 'Já combinamos. Passa no Titã antes de abrir.' },
    ],
  },
  {
    id: 'call-livia',
    speaker: 'Rádio Costeira FM — redação',
    contactId: 'contact-livia',
    available: () => true,
    lines: [
      { who: 'other', text: 'Rádio Costeira, redação.' },
      { who: 'augusto', text: 'Boa tarde. Augusto Nogueira, Polícia Civil. Procuro Lívia Serrano.' },
      { who: 'other', text: 'Um instante.' },
      { who: 'other', text: 'Lívia.' },
      { who: 'augusto', text: 'Sou o delegado que cuida do desaparecimento de Mariana Silva. Ela esteve com a senhora?' },
      { who: 'other', text: 'Esteve. Pediu arquivo, não entrevista. O que eu tenho não vai por telefone nem por e-mail. Venha à redação.' },
    ],
    onComplete: [
      { type: 'completeCall', id: 'call-livia' },
      { type: 'discoverPerson', id: 'livia', status: 'located' },
      { type: 'unlockLocation', id: 'radio', status: 'visitAvailable' },
    ],
    repeat: [{ who: 'other', text: 'Já falamos. A redação fica aberta até tarde.' }],
  },
  {
    id: 'call-presidio-visit',
    speaker: 'Unidade prisional — setor de visitas',
    contactId: 'contact-presidio',
    available: () => true,
    lines: [
      { who: 'other', text: 'Setor de visitas.' },
      { who: 'augusto', text: 'Delegado Augusto Nogueira, Polícia Civil. Preciso falar com um custodiado, André Silva.' },
      { who: 'other', text: 'Visita de autoridade. O senhor precisa se identificar na portaria e passar pela revista.' },
      { who: 'augusto', text: 'Hoje ainda é possível?' },
      { who: 'other', text: 'Até as vinte e duas. Sala de visitas, com acompanhamento de um agente.' },
    ],
    onComplete: [
      { type: 'completeCall', id: 'call-presidio-visit' },
      { type: 'discoverPerson', id: 'andre', status: 'located' },
      { type: 'unlockLocation', id: 'presidio', status: 'visitAvailable' },
    ],
    repeat: [{ who: 'other', text: 'A autorização do senhor já está registrada. Basta se apresentar na portaria.' }],
  },
  {
    id: 'call-cartorio-elisa',
    speaker: 'Cartório da vara',
    ext: '204',
    available: (s) => s.documentsOwned.includes('doc-elisa-resumo'),
    lines: [
      { who: 'other', text: 'Cartório da vara.' },
      { who: 'augusto', text: 'Augusto Nogueira, Polícia Civil. Preciso da cópia autenticada das folhas quarenta e uma do processo Elisa Duarte, a cronologia da noite.' },
      { who: 'other', text: 'Esse processo está arquivado, vou ter que buscar. Posso enviar à delegacia ainda hoje.' },
      { who: 'augusto', text: 'Obrigado.' },
    ],
    timeSkip: 'Algumas horas depois…',
    result: {
      label: 'Documento recebido',
      detail: 'Cronologia da noite — cópia autenticada (fls. 41). Arquivado em Processos / Autos.',
    },
    onComplete: [
      { type: 'completeCall', id: 'call-cartorio-elisa' },
      { type: 'addDocument', id: 'doc-elisa-cronologia' },
    ],
    repeat: [{ who: 'other', text: 'A cópia já foi enviada ao senhor.' }],
    notYet: [
      { who: 'other', text: 'Cartório da vara.' },
      { who: 'augusto', text: 'Preciso ver antes qual processo devo pedir.' },
      { who: 'other', text: 'Quando tiver o número ou o nome das partes, ligue de novo.' },
    ],
  },
  {
    id: 'call-pericia-device',
    speaker: 'Perícia — dispositivos móveis',
    ext: '212',
    available: (s) => flag(s, 'block04_forensics_unlocked'),
    lines: [
      { who: 'other', text: 'Perícia, dispositivos móveis.' },
      {
        who: 'augusto',
        text: 'Augusto Nogueira. Aparelho apreendido de Mariana Silva, lacre 0412. Preciso de uma análise dos pacotes instalados: o que existe no sistema além do que a tela mostra.',
      },
      { who: 'other', text: 'Listagem direta do sistema de arquivos, sem passar pelo launcher. Leva um tempo.' },
      { who: 'augusto', text: 'Peço que me retorne com o laudo.' },
    ],
    timeSkip: 'Algumas horas depois…',
    result: {
      label: 'Documento recebido',
      detail: 'Laudo pericial — aparelho de Mariana (análise de pacotes). Disponível no módulo Perícia do computador.',
    },
    onComplete: [
      { type: 'completeCall', id: 'call-pericia-device' },
      { type: 'addDocument', id: 'doc-laudo-forense' },
    ],
    repeat: [{ who: 'other', text: 'O laudo já foi enviado. Está no módulo de perícia do seu terminal.' }],
    notYet: [
      { who: 'other', text: 'Perícia, dispositivos móveis.' },
      { who: 'augusto', text: 'Ainda não tenho o que pedir ao senhor.' },
      { who: 'other', text: 'Qualquer análise precisa de uma solicitação específica. Ligue quando tiver.' },
    ],
  },
  {
    id: 'call-hospital',
    speaker: 'Hospital Municipal — recepção',
    ext: 'HOSP',
    available: (s) => !flag(s, 'block07_ricardo_search_unlocked'),
    lines: [
      { who: 'other', text: 'Hospital Municipal, recepção.' },
      { who: 'augusto', text: 'Augusto Nogueira, Polícia Civil. Sobre a funcionária Mariana Silva: houve algum contato dela com o setor?' },
      { who: 'other', text: 'Nenhum. Qualquer informação, o setor avisa o senhor.' },
    ],
    onComplete: [{ type: 'completeCall', id: 'call-hospital' }],
    repeat: [{ who: 'other', text: 'Sem novidades até agora, delegado.' }],
  },
  {
    id: 'call-hospital-ricardo',
    speaker: 'Hospital Municipal — arquivo de plantão',
    ext: 'HOSP',
    available: (s) => flag(s, 'block07_ricardo_search_unlocked'),
    lines: [
      { who: 'other', text: 'Hospital Municipal, arquivo de plantão.' },
      {
        who: 'augusto',
        text: 'Augusto Nogueira, Polícia Civil. Preciso cruzar um nome — Ricardo — com o plantão noturno do período que estou isolando. Mariana Silva estava de plantão.',
      },
      {
        who: 'other',
        text: 'Há um atendimento/óbito naquela madrugada sob Ricardo Freitas. Documentação pobre. Posso encaminhar o resumo ao sistema de consulta.',
      },
    ],
    result: {
      label: 'Registro encaminhado',
      detail: 'Atendimento/óbito — Ricardo Freitas (plantão correspondente).',
    },
    onComplete: [
      { type: 'completeCall', id: 'call-hospital-ricardo' },
      { type: 'addDocument', id: 'doc-hospital-ricardo-freitas' },
      { type: 'discoverPerson', id: 'ricardo', status: 'identified' },
      { type: 'addEvidence', id: 'ricardo_freitas_died_that_shift' },
      { type: 'addEvidence', id: 'ricardo_record_poor_id' },
      { type: 'setFlag', id: 'block07_ricardo_found', value: true },
      { type: 'completeTask', id: 'task_find_ricardo' },
      { type: 'addHypothesis', id: 'hyp_ricardo_linked_to_onset' },
      {
        type: 'addTask',
        id: 'task_crosscheck_ricardo_mariana',
        label: 'Cruzar “Ricardo” com os dados privados de Mariana',
      },
      { type: 'setFlag', id: 'block07_ricardo_crosscheck_unlocked', value: true },
    ],
    repeat: [
      {
        who: 'other',
        text: 'O resumo de Ricardo Freitas já foi encaminhado ao sistema, delegado.',
      },
    ],
    notYet: [{ who: 'other', text: 'Sem pedido específico de plantão neste momento.' }],
  },
  {
    id: 'call-central',
    speaker: 'Central de atendimento',
    ext: 'CENT',
    available: () => true,
    lines: [
      { who: 'other', text: 'Central de atendimento.' },
      { who: 'augusto', text: 'Delegado Augusto Nogueira. Sobre o registro das 08:03 de ontem.' },
      { who: 'other', text: 'O áudio está arquivado sob o protocolo da central. A cópia que o senhor tem é a mesma que temos.' },
    ],
    onComplete: [{ type: 'completeCall', id: 'call-central' }],
    repeat: [{ who: 'other', text: 'O protocolo continua o mesmo, delegado.' }],
  },
  {
    id: 'call-plantao',
    speaker: 'Plantão',
    ext: '201',
    available: () => true,
    lines: [
      { who: 'other', text: 'Plantão.' },
      { who: 'augusto', text: 'Augusto. Alguma ocorrência nova ligada ao caso?' },
      { who: 'other', text: 'Nada novo, doutor. Se entrar, o senhor é avisado.' },
    ],
    onComplete: [{ type: 'completeCall', id: 'call-plantao' }],
    repeat: [{ who: 'other', text: 'Nada novo, doutor.' }],
  },
  {
    id: 'call-arquivo',
    speaker: 'Arquivo',
    ext: '220',
    available: () => true,
    lines: [
      { who: 'other', text: 'Arquivo.' },
      { who: 'augusto', text: 'Augusto Nogueira. Preciso consultar um volume antigo.' },
      { who: 'other', text: 'Tudo o que podemos liberar já está no sistema de consulta, doutor. O resto exige requisição formal.' },
    ],
    onComplete: [{ type: 'completeCall', id: 'call-arquivo' }],
    repeat: [{ who: 'other', text: 'O que dá para liberar está no sistema de consulta.' }],
  },
]

export function scriptByContact(contactId: string): CallScript | undefined {
  return callScripts.find((c) => c.contactId === contactId)
}

export function scriptByExt(ext: string, state?: InvestigationState): CallScript | undefined {
  const matches = callScripts.filter((c) => c.ext === ext)
  if (!matches.length) return undefined
  if (state) {
    const available = matches.find((c) => c.available(state))
    if (available) return available
  }
  return matches[0]
}

/** Ramais e setores sempre disponíveis na agenda do fixo. */
export const landlineDirectory: { key: string; name: string; scriptId?: string }[] = [
  { key: '100', name: 'Gabinete do delegado' },
  { key: '201', name: 'Plantão', scriptId: 'call-plantao' },
  { key: '204', name: 'Cartório', scriptId: 'call-cartorio-elisa' },
  { key: '212', name: 'Perícia', scriptId: 'call-pericia-device' },
  { key: '220', name: 'Arquivo', scriptId: 'call-arquivo' },
  { key: 'HOSP', name: 'Hospital Municipal — recepção', scriptId: 'call-hospital' },
  { key: 'CENT', name: 'Central de atendimento', scriptId: 'call-central' },
]
