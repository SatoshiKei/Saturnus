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
    /** Institucional: agenda do telefone fixo (contact.institution), não o iPhone. */
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
    id: 'call-julia-onset',
    speaker: 'Júlia Martins',
    contactId: 'contact-julia',
    available: (s) => flag(s, 'block07_julia_camila_check_unlocked'),
    lines: [
      { who: 'other', text: 'Alô?' },
      {
        who: 'augusto',
        text: 'Júlia, Augusto Nogueira. Preciso de um minuto sobre o período em que a Mariana começou a ficar estranha.',
      },
      { who: 'other', text: 'Pode falar.' },
      {
        who: 'augusto',
        text: 'Naquele começo — meses antes do desaparecimento — aconteceu alguma coisa excepcional no hospital? Acidente, crise, agressão, algo fora do normal com ela?',
      },
      {
        who: 'other',
        text: 'Deixa eu pensar… Ela já vinha esquecendo coisa miúda. Parecia deslocada, às vezes. Mas um episódio marcante? Não. Nada que eu lembre.',
      },
      { who: 'augusto', text: 'Nenhum plantão que tenha saído do controle?' },
      {
        who: 'other',
        text: 'Se tivesse, acho que a gente lembrava. Foi mais gradual. Estranho, mas sem um estouro.',
      },
    ],
    result: {
      label: 'Conferência concluída',
      detail: 'Nenhum evento dramático conhecido no início dos lapsos.',
    },
    onComplete: [
      { type: 'completeCall', id: 'call-julia-onset' },
      { type: 'setFlag', id: 'block07_julia_camila_checked', value: true },
      { type: 'addEvidence', id: 'no_dramatic_event_at_onset' },
      { type: 'completeTask', id: 'task_check_julia_camila_onset' },
    ],
    repeat: [
      {
        who: 'other',
        text: 'Já falamos disso. Eu não lembro de nenhum episódio grande naquele período.',
      },
    ],
    notYet: [
      { who: 'other', text: 'Alô?' },
      { who: 'augusto', text: 'Júlia — ainda estou organizando umas datas. Te ligo em breve.' },
      { who: 'other', text: 'Tudo bem.' },
    ],
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
    id: 'call-pericia-guardrail',
    speaker: 'Perícia — criminalística',
    ext: '212',
    available: (s) =>
      flag(s, 'block08_guardrail_reexam_unlocked') && !flag(s, 'block08_guardrail_done'),
    lines: [
      { who: 'other', text: 'Criminalística.' },
      {
        who: 'augusto',
        text: 'Augusto Nogueira. Preciso que vocês reabram o material fotográfico da queda de Elisa Duarte.',
      },
      { who: 'other', text: 'O caso antigo?' },
      {
        who: 'augusto',
        text: 'Principalmente a proteção da via. Não quero uma revisão da queda. Quero a estrutura.',
      },
      { who: 'other', text: 'Procurando o quê?' },
      {
        who: 'augusto',
        text: 'Quero saber se aquele dano podia estar ali antes de Elisa encostar no guardrail.',
      },
      {
        who: 'other',
        text: 'As fotografias originais ainda estão preservadas. Vou pedir comparação de deformação e vestígios.',
      },
      {
        who: 'augusto',
        text: 'Procurem impacto automotivo. Tinta, plástico, metal, direção da força. O que tiver.',
      },
    ],
    timeSkip: 'Algumas horas depois…',
    result: {
      label: 'Documento recebido',
      detail: 'Laudo complementar — Guardrail / proteção da via. Consulte o módulo Perícia.',
    },
    onComplete: [
      { type: 'completeCall', id: 'call-pericia-guardrail' },
      { type: 'addDocument', id: 'doc-guardrail-reanalise' },
      {
        type: 'notifyInvestigationUpdate',
        id: 'doc-received-guardrail',
        kind: 'document',
        title: 'Laudo complementar — Guardrail',
        subtitle: 'Encaminhado pela Perícia',
      },
    ],
    repeat: [
      {
        who: 'other',
        text: 'O laudo complementar do guardrail já está no sistema. Qualquer dúvida, abra o documento.',
      },
    ],
    notYet: [
      { who: 'other', text: 'Criminalística.' },
      { who: 'augusto', text: 'Ainda não tenho solicitação formal para o senhor.' },
      { who: 'other', text: 'Quando tiver material e pedido específicos, ligue de novo.' },
    ],
  },
  {
    id: 'call-parts-jaguar-lead',
    speaker: 'Peças / importados (atendimento)',
    ext: 'PECA',
    available: (s) => flag(s, 'block08_parts_call_unlocked') && !flag(s, 'block08_denis_contact_unlocked'),
    lines: [
      { who: 'other', text: 'Bom dia.' },
      {
        who: 'augusto',
        text: 'Polícia Civil. Estou tentando localizar uma oficina que trabalhasse com Jaguar antigo aqui na cidade uns seis anos atrás.',
      },
      { who: 'other', text: 'Jaguar novo ou velho?' },
      { who: 'augusto', text: 'XJ6. Meados dos noventa.' },
      {
        who: 'other',
        text: 'Aqui quase ninguém queria pegar isso.\n\nFala com o Dênis. Ele mexia bastante com importado velho e carro que os outros não queriam encostar.',
      },
    ],
    result: { label: 'Indicação', detail: 'Oficina Dênis — importados antigos.' },
    onComplete: [{ type: 'completeCall', id: 'call-parts-jaguar-lead' }],
    repeat: [{ who: 'other', text: 'Já te indiquei o Dênis, delegado.' }],
  },
  {
    id: 'call-detran-jaguar',
    speaker: 'DETRAN — histórico de frota',
    ext: 'DETRAN',
    available: (s) => flag(s, 'block08_detran_call_unlocked') && !flag(s, 'block08_detran_done'),
    lines: [
      {
        who: 'augusto',
        text: 'Delegado Augusto Nogueira, Polícia Civil. Preciso de levantamento histórico de frota.',
      },
      { who: 'other', text: 'Quais filtros?' },
      {
        who: 'augusto',
        text: 'Jaguar XJ6. Geração X300. Ano aproximado entre 1995 e 1997. Cor registrada verde. Quero os veículos que estavam registrados nesta regional na data que vou encaminhar.',
      },
      { who: 'other', text: 'É um filtro bem específico.' },
      { who: 'augusto', text: 'Quantos?' },
      {
        who: 'other',
        text: 'Três na regional naquele período.\n\nDois estavam registrados em municípios vizinhos.\n\nSó um constava nesta cidade na data informada.',
      },
      { who: 'augusto', text: 'Proprietário?' },
      { who: 'other', text: 'Mauro.' },
    ],
    result: { label: 'Levantamento', detail: 'Um Jaguar XJ6 verde nesta cidade — titular Mauro.' },
    onComplete: [{ type: 'completeCall', id: 'call-detran-jaguar' }],
    repeat: [{ who: 'other', text: 'O levantamento de Jaguar verde já foi registrado no protocolo.' }],
    notYet: [{ who: 'other', text: 'Preciso dos filtros e da data formalizados na solicitação.' }],
  },
  {
    id: 'call-pericia-device',
    speaker: 'Perícia — dispositivos móveis',
    ext: '212',
    available: (s) =>
      (flag(s, 'block04_forensics_unlocked') ||
        flag(s, 'block01_bo_registered') ||
        flag(s, 'block01_complete')) &&
      !flag(s, 'diary_package_known') &&
      !(flag(s, 'block08_guardrail_reexam_unlocked') && !flag(s, 'block08_guardrail_done')),
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
      detail:
        'Laudo pericial — aparelho de Mariana. Consulte o módulo Perícia; o pacote recuperado fica no aparelho apreendido.',
    },
    onComplete: [
      { type: 'completeCall', id: 'call-pericia-device' },
      { type: 'addDocument', id: 'doc-laudo-forense' },
      {
        type: 'notifyInvestigationUpdate',
        id: 'doc-received-laudo',
        kind: 'document',
        title: 'Laudo pericial — aparelho de Mariana',
        subtitle: 'Encaminhado pela Perícia',
      },
    ],
    repeat: [
      {
        who: 'other',
        text: 'O laudo já foi enviado. O pacote recuperado está acessível no aparelho apreendido.',
      },
    ],
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
    available: (s) =>
      !flag(s, 'block07_hospital_archive_unlocked') || flag(s, 'block07_ricardo_found'),
    lines: [
      { who: 'other', text: 'Hospital Municipal, recepção.' },
      { who: 'augusto', text: 'Augusto Nogueira, Polícia Civil. Sobre a funcionária Mariana Silva: houve algum contato dela com o setor?' },
      { who: 'other', text: 'Nenhum. Qualquer informação, o setor avisa o senhor.' },
    ],
    onComplete: [{ type: 'completeCall', id: 'call-hospital' }],
    repeat: [{ who: 'other', text: 'Sem novidades até agora, delegado.' }],
  },
  {
    id: 'call-julia-ricardo-audio',
    speaker: 'Júlia Martins',
    contactId: 'contact-julia',
    available: (s) => flag(s, 'block07_julia_ricardo_audio_unlocked') && !flag(s, 'block07_julia_ricardo_audio_done'),
    lines: [
      { who: 'other', text: 'Alô?' },
      { who: 'augusto', text: 'Júlia, escuta uma coisa pra mim. Depois eu explico de onde veio.' },
      { who: 'other', text: '…Ricardo…? Espera. Volta um pouco — não no nome. Essa voz. Acho que é a Renata.' },
      { who: 'augusto', text: 'Renata Farias?' },
      { who: 'other', text: 'Sim. Eu conheço a voz dela. Posso te passar o contato — se alguém lembra daquele plantão, é ela.' },
      { who: 'augusto', text: 'Me passa.' },
    ],
    result: { label: 'Áudio conferido', detail: 'Júlia reconhece a voz feminina como Renata Farias.' },
    onComplete: [{ type: 'completeCall', id: 'call-julia-ricardo-audio' }],
    repeat: [{ who: 'other', text: 'Já te passei o contato da Renata. Fala com ela.' }],
  },
  {
    id: 'call-renata-farias',
    speaker: 'Renata Farias',
    ext: 'REN',
    available: (s) => flag(s, 'block07_renata_call_unlocked') && !flag(s, 'block07_renata_call_done'),
    lines: [
      { who: 'other', text: 'Alô?' },
      { who: 'augusto', text: 'Delegado Augusto Nogueira. Júlia me passou seu contato. Ouvi um trecho com o nome Ricardo — ambiente que parece hospitalar.' },
      { who: 'other', text: 'Ricardo… Sim. Paciente antigo, observação. Identidade frágil. Mariana estava naquele plantão. Depois daquele cara ela ficou dias muito mal.' },
      { who: 'augusto', text: 'O que você lembra dele?' },
      { who: 'other', text: 'Inquieto, olhava pra porta. Insistia no nome. Janela: madrugada daquele período. Se for o mesmo, o arquivo do hospital deve ter alguma ficha.' },
    ],
    result: {
      label: 'Depoimento',
      detail: 'Paciente Ricardo; plantão da Mariana; janela temporal aproximada.',
    },
    onComplete: [{ type: 'completeCall', id: 'call-renata-farias' }],
    repeat: [{ who: 'other', text: 'Já contei o que lembro daquele plantão, delegado. Procure o arquivo.' }],
  },
  {
    id: 'call-hospital-ricardo',
    speaker: 'Hospital Municipal — arquivo médico',
    ext: 'HOSP',
    available: (s) => flag(s, 'block07_hospital_archive_unlocked') && !flag(s, 'block07_ricardo_found'),
    lines: [
      { who: 'other', text: 'Arquivo médico, boa tarde.' },
      {
        who: 'augusto',
        text: 'Delegado Augusto Nogueira. Prontuário antigo — primeiro nome Ricardo, setor de observação. Tenho janela de plantão e funcionária do setor.',
      },
      { who: 'other', text: 'Um momento… Tenho um Ricardo Freitas. Documento não apresentado. Alta: óbito na madrugada.' },
      { who: 'augusto', text: 'Encaminha o que puder disponibilizar formalmente.' },
    ],
    result: {
      label: 'Prontuário separado',
      detail: 'Ricardo Freitas — identidade declarada, óbito no plantão.',
    },
    onComplete: [
      { type: 'completeCall', id: 'call-hospital-ricardo' },
      { type: 'addDocument', id: 'doc-hospital-ricardo-freitas' },
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
    id: 'call-aster-early',
    speaker: 'Aster Sistemas — administrativo',
    ext: 'ASTER',
    available: (s) =>
      flag(s, 'block07_aster_early_call_unlocked') &&
      !flag(s, 'block07_aster_call_unlocked') &&
      !flag(s, 'block07_henrique_named'),
    lines: [
      { who: 'other', text: 'Aster Sistemas, administrativo.' },
      {
        who: 'augusto',
        text: 'Delegado Augusto Nogueira. Tenho um nickname técnico — hvalenca — e uma menção à Aster em fórum antigo. Preciso identificar o usuário.',
      },
      {
        who: 'other',
        text: 'Username externo não identifica funcionário. Sem nome civil, caso formal ou fundamento concreto, não fornecemos dados de ex-colaboradores.',
      },
      { who: 'augusto', text: 'Mesmo com o vínculo à empresa no post?' },
      {
        who: 'other',
        text: 'Mesmo assim. Volte quando tiver identificação suficiente.',
      },
    ],
    result: {
      label: 'Consulta recusada',
      detail: 'Aster não identifica pessoa a partir de nickname apenas.',
    },
    onComplete: [
      { type: 'completeCall', id: 'call-aster-early' },
      { type: 'setFlag', id: 'block07_aster_early_refused', value: true },
    ],
    repeat: [
      {
        who: 'other',
        text: 'Continua valendo: sem identificação civil, não abrimos arquivo de pessoal.',
      },
    ],
    notYet: [{ who: 'other', text: 'Sem abertura administrativa para essa consulta no momento.' }],
  },
  {
    id: 'call-aster-henrique',
    speaker: 'Aster Sistemas — administrativo',
    ext: 'ASTER',
    available: (s) =>
      flag(s, 'block07_aster_call_unlocked') && !flag(s, 'block07_henrique_named'),
    lines: [
      { who: 'other', text: 'Aster Sistemas, administrativo.' },
      {
        who: 'augusto',
        text: 'Delegado Augusto Nogueira. Procuro alguém da equipe técnica por volta de 2021 — identificador hvalenca, iniciais H.V.',
      },
      { who: 'other', text: 'Espera… Tem um nome que pode ser. Henrique Valença. Não trabalha mais aqui.' },
      {
        who: 'augusto',
        text: 'Quem trabalhou diretamente com ele?',
      },
      {
        who: 'other',
        text: 'Cecília Prado ficou na mesma equipe. Posso repassar o contato profissional atual mediante solicitação.',
      },
    ],
    result: {
      label: 'Nome recuperado',
      detail: 'Henrique Valença — ex-Aster Sistemas; indicação Cecília Prado.',
    },
    onComplete: [{ type: 'completeCall', id: 'call-aster-henrique' }],
    repeat: [{ who: 'other', text: 'Já passamos o que tínhamos sobre Henrique, delegado.' }],
    notYet: [{ who: 'other', text: 'Sem abertura administrativa para essa consulta no momento.' }],
  },
  {
    id: 'call-fernanda-memory',
    speaker: 'Fernanda',
    contactId: 'contact-fernanda',
    available: (s) =>
      flag(s, 'block01_hospital_done') && !flag(s, 'fernanda_memory_lapse_noted'),
    lines: [
      { who: 'other', text: 'Alô?' },
      {
        who: 'augusto',
        text: 'Fernanda? Delegado Augusto Nogueira. Sobre a festa — Mariana tinha confirmado que ia?',
      },
      {
        who: 'other',
        // [TEXTO PENDENTE]
        text: 'Tinha. Eu convidei, ela topou. Depois agiu como se nunca tivesse concordado.',
      },
      { who: 'augusto', text: 'Como se não lembrasse.' },
      { who: 'other', text: 'É. Estranho. Mas eu não sei de mais nada.' },
    ],
    result: {
      label: 'Conversa registrada',
      detail: 'Fernanda: Mariana confirmou a festa e depois agiu como se não lembrasse.',
    },
    onComplete: [
      { type: 'completeCall', id: 'call-fernanda-memory' },
      { type: 'setFlag', id: 'fernanda_memory_lapse_noted', value: true },
      { type: 'setFlag', id: 'theory_julia_pending', value: true },
    ],
    repeat: [{ who: 'other', text: 'Já falei o que eu sei da festa.' }],
    notYet: [{ who: 'other', text: '…' }],
  },
  {
    id: 'call-marcelo-close',
    speaker: 'Marcelo Viana',
    ext: 'MARC',
    available: (s) =>
      flag(s, 'marcelo_address_found') &&
      !flag(s, 'marcelo_line_closed') &&
      (flag(s, 'theory_maralto_retaliation_pending') ||
        flag(s, 'block03_saturnalia_done') ||
        flag(s, 'samuel_accidental_done')),
    lines: [
      { who: 'other', text: 'Pois não.' },
      {
        who: 'augusto',
        text: 'Marcelo Viana? Delegado Augusto Nogueira. Sobre o período em que o senhor trabalhou no terminal Maralto.',
      },
      {
        who: 'other',
        // [TEXTO PENDENTE]
        text: 'Saí por motivo profissional. Não conheço nenhuma Mariana Silva. Não tenho nada a acrescentar.',
      },
    ],
    result: {
      label: 'Linha encerrada',
      detail: 'Marcelo Viana: saída banal; sem vínculo com Mariana.',
    },
    onComplete: [
      { type: 'completeCall', id: 'call-marcelo-close' },
      { type: 'setFlag', id: 'marcelo_line_closed', value: true },
    ],
    repeat: [{ who: 'other', text: 'Já respondi. Não tenho o que falar.' }],
    notYet: [{ who: 'other', text: '…' }],
  },
  {
    id: 'call-julia-pressure',
    speaker: 'Júlia Martins',
    contactId: 'contact-julia',
    available: (s) =>
      flag(s, 'theory_julia_pending') &&
      flag(s, 'fernanda_memory_lapse_noted') &&
      !flag(s, 'julia_pressure_done'),
    lines: [
      { who: 'other', text: 'Augusto?' },
      {
        who: 'augusto',
        text: 'Júlia. Preciso que você me diga, com horário, o que Mariana pediu que você corrigisse — e o que ela esquecia sozinha.',
      },
      {
        who: 'other',
        // [TEXTO PENDENTE]
        text: 'Você está me acusando de moldar a memória dela?',
      },
      {
        who: 'augusto',
        text: 'Estou perguntando. Houve algum lapso que aconteceu sem você por perto?',
      },
      {
        who: 'other',
        text: 'Sim. A festa da Fernanda. Eu nem sabia que ela tinha topado. Ela esqueceu sozinha.',
      },
    ],
    result: {
      label: 'Pressão registrada',
      detail: 'Júlia irritada; lapso da festa ocorreu sem a participação dela.',
    },
    onComplete: [
      { type: 'completeCall', id: 'call-julia-pressure' },
      { type: 'setFlag', id: 'julia_pressure_done', value: true },
    ],
    repeat: [{ who: 'other', text: 'Já falei. Não vou repetir isso.' }],
    notYet: [{ who: 'other', text: '…' }],
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
